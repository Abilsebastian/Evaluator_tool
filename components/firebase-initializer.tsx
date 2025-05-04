"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase-config"

interface FirebaseInitializerProps {
  children: React.ReactNode
}

export default function FirebaseInitializer({ children }: FirebaseInitializerProps) {
  const [initialized, setInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      // Try to access Firebase services to ensure they're initialized
      const auth = getFirebaseAuth()
      const db = getFirebaseDb()

      if (auth && db) {
        console.log("Firebase successfully initialized")
        setInitialized(true)
      } else {
        setError("Failed to initialize Firebase")
      }
    } catch (err: any) {
      console.error("Firebase initialization error:", err)
      setError(err.message || "Failed to initialize Firebase")
    }
  }, [])

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md max-w-md w-full">
          <h2 className="text-lg font-semibold mb-2">Firebase Initialization Error</h2>
          <p>{error}</p>
          <p className="mt-4 text-sm">Please check your environment variables and Firebase configuration.</p>
        </div>
      </div>
    )
  }

  if (!initialized) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return <>{children}</>
}
