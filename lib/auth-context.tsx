"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User as FirebaseUser,
} from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { getFirebaseDb } from "@/lib/firebase-config"

interface UserData {
  uid: string
  email: string | null
  role: string
  displayName?: string | null
  photoURL?: string | null
}

interface AuthContextType {
  user: UserData | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  signIn: async () => {},
  signOut: async () => {},
})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const auth = getAuth()

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get additional user data from Firestore
          const userData = await getUserData(firebaseUser)
          setUser(userData)
        } catch (err) {
          console.error("Error fetching user data:", err)
          // Still set basic user info even if additional data fetch fails
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            role: "user", // Default role
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          })
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const getUserData = async (firebaseUser: FirebaseUser): Promise<UserData> => {
    const db = getFirebaseDb()
    if (!db) throw new Error("Database not initialized")

    // Try to get user data from Firestore
    const userRef = doc(db, "users", firebaseUser.uid)
    const userSnap = await getDoc(userRef)

    if (userSnap.exists()) {
      const userData = userSnap.data()
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        role: userData.role || "user",
        displayName: firebaseUser.displayName || userData.displayName,
        photoURL: firebaseUser.photoURL || userData.photoURL,
      }
    }

    // If no additional data in Firestore, return basic info
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      role: "user", // Default role
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setError(null)
      setLoading(true)
      const auth = getAuth()
      await signInWithEmailAndPassword(auth, email, password)
    } catch (err: any) {
      console.error("Sign in error:", err)
      setError(err.message || "Failed to sign in")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setError(null)
      const auth = getAuth()
      await firebaseSignOut(auth)
    } catch (err: any) {
      console.error("Sign out error:", err)
      setError(err.message || "Failed to sign out")
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
