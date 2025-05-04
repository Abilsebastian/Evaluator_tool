"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { FirebaseProvider } from "./firebase-provider"
import { onAuthStateChanged } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase-config"
import { useRouter } from "next/navigation"

export default function ClientAppWrapper({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Check if we're in the browser
    if (typeof window === "undefined") return

    // Check if Firebase is initialized
    if (!auth || !db) {
      setError("Firebase is not initialized")
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        if (firebaseUser) {
          try {
            // Fetch user role from Firestore
            const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
            const userData = userDoc.exists() ? userDoc.data() : {}

            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              role: userData.role,
            })
          } catch (error) {
            console.error("Error fetching user data:", error)
            setUser(null)
          }
        } else {
          setUser(null)
        }
        setLoading(false)
      },
      (error) => {
        console.error("Auth state change error:", error)
        setError(`Authentication error: ${error.message}`)
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [router])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-4 gap-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md max-w-md w-full">
          <h2 className="text-lg font-semibold mb-2">Error</h2>
          <p>{error}</p>
          <p className="mt-4 text-sm">Please check your environment variables and make sure they are correctly set.</p>
        </div>
      </div>
    )
  }

  return <FirebaseProvider>{children}</FirebaseProvider>
}
