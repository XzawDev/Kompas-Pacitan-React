"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { User, AuthContextType } from "@/lib/types";
import {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
} from "@/lib/firestoreService";

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

      // Create user profile in Firestore
      await createUserProfile(firebaseUser.uid, {
        email,
        username,
        role: "user", // Default role
      });

      // Store username-email mapping
      await setDoc(doc(db, "usernames", username.toLowerCase()), {
        email,
        userId: firebaseUser.uid,
      });

      // Set user state
      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: username,
        username,
        role: "user",
        createdAt: new Date().toISOString(),
      });
    } catch (error: any) {
      throw new Error(error.message || "Terjadi kesalahan saat registrasi");
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfileData = async (data: Partial<User>) => {
    if (!user) throw new Error("User tidak login");

    try {
      await updateUserProfile(user.uid, data);
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

            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email!,
              displayName:
                firebaseUser.displayName || firebaseUser.email!.split("@")[0],
              username:
                firebaseUser.displayName || firebaseUser.email!.split("@")[0],
              role: "user",
              createdAt: new Date().toISOString(),
            });
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
