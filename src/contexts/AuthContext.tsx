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
      role?: "user" | "admin";
    }
  ) => {
    try {
      // Gunakan setDoc untuk membuat dokumen baru
      await setDoc(doc(db, "users", userId), {
        ...userData,
        uid: userId,
        displayName: userData.username,
        role: userData.role || "user",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error creating user profile:", error);
      throw error;
    }
  };

  // Fungsi untuk mendapatkan user profile
  const getUserProfile = async (userId: string): Promise<User | null> => {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          uid: userId,
          email: data.email,
          displayName: data.displayName || data.username,
          username: data.username,
          role: data.role || "user",
          photoURL: data.photoURL,
          createdAt:
            data.createdAt?.toDate().toISOString() || new Date().toISOString(),
        } as User;
      }
      return null;
    } catch (error) {
      console.error("Error getting user profile:", error);
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

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;

      // Get user profile from Firestore
      const userProfile = await getUserProfile(firebaseUser.uid);

      if (!userProfile) {
        throw new Error("Profil user tidak ditemukan");
      }

      setUser(userProfile);
    } catch (error: any) {
      console.error("Login error:", error);
      throw new Error(error.message || "Terjadi kesalahan saat login");
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      setLoading(true);

      // Check if username already exists
      const usernameDoc = await getDoc(
        doc(db, "usernames", username.toLowerCase())
      );
      if (usernameDoc.exists()) {
        throw new Error("Username sudah digunakan");
      }

      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;

      // Update profile with username
      await updateProfile(firebaseUser, {
        displayName: username,
      });

      // Create user profile in Firestore menggunakan setDoc
      await createUserProfile(firebaseUser.uid, {
        email,
        username,
        role: "user", // Default role
      });

      // Store username-email mapping
      await setDoc(doc(db, "usernames", username.toLowerCase()), {
        email,
        userId: firebaseUser.uid,
        createdAt: serverTimestamp(),
      });

      // Set user state
      const newUserProfile = await getUserProfile(firebaseUser.uid);
      setUser(newUserProfile);
    } catch (error: any) {
      console.error("Registration error:", error);

      // Hapus user dari Firebase Auth jika gagal
      if (auth.currentUser) {
        await auth.currentUser.delete();
      }

      throw new Error(error.message || "Terjadi kesalahan saat registrasi");
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfileData = async (data: Partial<User>) => {
    if (!user) throw new Error("User tidak login");

    try {
      await updateDoc(doc(db, "users", user.uid), {
        ...data,
        updatedAt: serverTimestamp(),
      });
      setUser((prev) => (prev ? { ...prev, ...data } : null));
    } catch (error: any) {
      throw new Error(error.message || "Terjadi kesalahan saat update profil");
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (error: any) {
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
          const userProfile = await getUserProfile(firebaseUser.uid);
          if (userProfile) {
            setUser(userProfile);
          } else {
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
          console.error("Error fetching user data:", error);
        }
      } else {
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
