"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { auth, db } from "@/lib/firebase-config"

// Create context
const FirebaseContext = createContext<{
  auth: any
  db: any
  initialized: boolean
  error: string | null
}>({
  auth: null,
  db: null,
  initialized: false,
  error: null,
})

export function useFirebase() {
  return useContext(FirebaseContext)
}

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [initialized, setInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      // Check if Firebase is initialized
      if (auth && db) {
        setInitialized(true)
      } else {
        setError("Firebase failed to initialize")
      }
    } catch (err: any) {
      console.error("Firebase initialization error:", err)
      setError(err.message || "Failed to initialize Firebase")
    }
  }, [])

  return <FirebaseContext.Provider value={{ auth, db, initialized, error }}>{children}</FirebaseContext.Provider>
}
