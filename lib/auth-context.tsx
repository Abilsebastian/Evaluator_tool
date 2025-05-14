"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase-config"

type User = {
  uid: string
  email: string | null
  role?: string
} | null

type AuthContextType = {
  user: User
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return

    // Get Firebase auth
    const auth = getFirebaseAuth()
    if (!auth) {
      console.error("Firebase auth is not available")
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get Firebase db
          const db = getFirebaseDb()
          if (!db) {
            console.error("Firebase db is not available")
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
            })
            setLoading(false)
            return
          }

          // Get user role from Firestore
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
          const userData = userDoc.exists() ? userDoc.data() : {}

          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            role: userData.role || "user",
          })
        } catch (error) {
          console.error("Error fetching user data:", error)
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
          })
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const auth = getFirebaseAuth()
    if (!auth) {
      throw new Error("Firebase auth is not available")
    }

    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error: any) {
      console.error("Sign in error:", error)
      throw new Error(error.message || "Failed to sign in")
    }
  }

  const signUp = async (email: string, password: string) => {
    const auth = getFirebaseAuth()
    if (!auth) {
      throw new Error("Firebase auth is not available")
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password)
    } catch (error: any) {
      console.error("Sign up error:", error)
      throw new Error(error.message || "Failed to sign up")
    }
  }

  const signOut = async () => {
    const auth = getFirebaseAuth()
    if (!auth) {
      throw new Error("Firebase auth is not available")
    }

    try {
      await firebaseSignOut(auth)
      // Clear any cached user data
      setUser(null)
    } catch (error: any) {
      console.error("Sign out error:", error)
      throw new Error(error.message || "Failed to sign out")
    }
  }

  return <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export default AuthProvider
