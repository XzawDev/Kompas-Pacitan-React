"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { User, AuthContextType } from "@/lib/types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Helper function to safely convert Firestore timestamp to string
const convertFirestoreTimestamp = (timestamp: any): string => {
  if (!timestamp) {
    return new Date().toISOString();
  }

  // Jika sudah string, langsung return
  if (typeof timestamp === "string") {
    return timestamp;
  }

  // Jika merupakan Firestore Timestamp object
  if (timestamp.toDate && typeof timestamp.toDate === "function") {
    return timestamp.toDate().toISOString();
  }

  // Fallback
  return new Date().toISOString();
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Fungsi untuk membuat user profile di Firestore
  const createUserProfile = async (
    userId: string,
    userData: {
      email: string;
      username: string;
      role?: "user" | "admin" | "owner";
    }
  ) => {
    try {
      console.log("🔄 Creating user profile for:", userId);
      // Gunakan setDoc untuk membuat dokumen baru
      await setDoc(doc(db, "users", userId), {
        uid: userId,
        email: userData.email,
        displayName: userData.username,
        username: userData.username,
        role: userData.role || "user",
        isActive: true, // Tambahkan default value
        createdAt: serverTimestamp(), // Pastikan menggunakan serverTimestamp()
        updatedAt: serverTimestamp(),
      });
      console.log("✅ User profile created successfully");
    } catch (error) {
      console.error("❌ Error creating user profile:", error);
      throw error;
    }
  };

  // Fungsi untuk mendapatkan user profile - DIPERBAIKI
  const getUserProfile = async (userId: string): Promise<User | null> => {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        console.log("✅ User profile found:", userId, data);

        // Gunakan helper function untuk convert timestamp dengan aman
        const createdAt = convertFirestoreTimestamp(data.createdAt);

        return {
          uid: userId,
          email: data.email,
          displayName: data.displayName || data.username,
          username: data.username,
          role: data.role || "user",
          photoURL: data.photoURL,
          isActive: data.isActive !== false, // Default true jika tidak ada
          createdAt: createdAt,
        } as User;
      }
      console.log("❌ User profile not found:", userId);
      return null;
    } catch (error) {
      console.error("❌ Error getting user profile:", error);
      throw error;
    }
  };

  const findUserByUsername = async (
    username: string
  ): Promise<string | null> => {
    try {
      const userDoc = await getDoc(
        doc(db, "usernames", username.toLowerCase())
      );
      return userDoc.exists() ? userDoc.data().email : null;
    } catch (error) {
      console.error("Error finding user by username:", error);
      return null;
    }
  };

  const signIn = async (identifier: string, password: string) => {
    try {
      setLoading(true);
      let email = identifier;

      if (!identifier.includes("@")) {
        const foundEmail = await findUserByUsername(identifier);
        if (!foundEmail) {
          throw new Error("Username tidak ditemukan");
        }
        email = foundEmail;
      }

      console.log("🔄 Attempting login for:", email);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;

      // Get user profile from Firestore
      const userProfile = await getUserProfile(firebaseUser.uid);

      if (!userProfile) {
        console.log("⚠️ User profile not found, creating new one...");
        // Create profile if doesn't exist
        await createUserProfile(firebaseUser.uid, {
          email: firebaseUser.email!,
          username:
            firebaseUser.displayName || firebaseUser.email!.split("@")[0],
          role: "user",
        });

        const newProfile = await getUserProfile(firebaseUser.uid);
        setUser(newProfile);
      } else {
        setUser(userProfile);
      }

      console.log("✅ Login successful");
    } catch (error: any) {
      console.error("❌ Login error:", error);
      let errorMessage = "Terjadi kesalahan saat login";

      if (error.code === "auth/user-not-found") {
        errorMessage = "User tidak ditemukan";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Password salah";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Email tidak valid";
      } else if (error.code === "auth/invalid-credential") {
        errorMessage = "Kredensial tidak valid";
      } else {
        errorMessage = error.message || errorMessage;
      }

      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      setLoading(true);
      console.log("🔄 Starting registration process...");

      // Check if username already exists
      const usernameDoc = await getDoc(
        doc(db, "usernames", username.toLowerCase())
      );
      if (usernameDoc.exists()) {
        throw new Error("Username sudah digunakan");
      }

      // Create user in Firebase Auth
      console.log("🔄 Creating Firebase Auth user...");
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;
      console.log("✅ Firebase Auth user created:", firebaseUser.uid);

      // Update profile with username in Firebase Auth
      await updateProfile(firebaseUser, {
        displayName: username,
      });

      // Create user profile in Firestore menggunakan setDoc
      await createUserProfile(firebaseUser.uid, {
        email,
        username,
        role: "user",
      });

      // Store username-email mapping
      await setDoc(doc(db, "usernames", username.toLowerCase()), {
        email,
        userId: firebaseUser.uid,
        createdAt: serverTimestamp(),
      });

      // Set user state
      const newUserProfile = await getUserProfile(firebaseUser.uid);
      if (newUserProfile) {
        setUser(newUserProfile);
        console.log("✅ Registration completed successfully");
      } else {
        throw new Error("Gagal membuat profil user");
      }
    } catch (error: any) {
      console.error("❌ Registration error:", error);

      // Hapus user dari Firebase Auth jika gagal
      if (auth.currentUser) {
        try {
          await auth.currentUser.delete();
          console.log("🗑️ Rollback: Deleted Firebase Auth user");
        } catch (deleteError) {
          console.error("Error deleting user during rollback:", deleteError);
        }
      }

      let errorMessage = "Terjadi kesalahan saat registrasi";

      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Email sudah digunakan";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password terlalu lemah";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Email tidak valid";
      } else {
        errorMessage = error.message || errorMessage;
      }

      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfileData = async (data: Partial<User>) => {
    if (!user) throw new Error("User tidak login");

    try {
      // Pastikan dokumen user ada sebelum update
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        // Buat dokumen jika belum ada
        await createUserProfile(user.uid, {
          email: user.email,
          username: user.username || user.displayName,
          role: user.role,
        });
      }

      await updateDoc(doc(db, "users", user.uid), {
        ...data,
        updatedAt: serverTimestamp(),
      });

      // Update user state dengan data baru
      const updatedProfile = await getUserProfile(user.uid);
      setUser(updatedProfile);
    } catch (error: any) {
      console.error("Error updating user profile:", error);
      throw new Error(error.message || "Terjadi kesalahan saat update profil");
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      console.log("✅ Logout successful");
    } catch (error: any) {
      console.error("❌ Logout error:", error);
      throw new Error(error.message || "Terjadi kesalahan saat logout");
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          console.log("🔄 Auth state changed, user:", firebaseUser.uid);
          const userProfile = await getUserProfile(firebaseUser.uid);
          if (userProfile) {
            setUser(userProfile);
          } else {
            console.log("🔄 Creating profile for existing user...");
            // Create profile if doesn't exist (for existing users)
            await createUserProfile(firebaseUser.uid, {
              email: firebaseUser.email!,
              username:
                firebaseUser.displayName || firebaseUser.email!.split("@")[0],
              role: "user",
            });

            const newUserProfile = await getUserProfile(firebaseUser.uid);
            setUser(newUserProfile);
          }
        } catch (error) {
          console.error("❌ Error fetching user data:", error);
        }
      } else {
        console.log("🔄 No user logged in");
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateUserProfile: updateUserProfileData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
