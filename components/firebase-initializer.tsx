"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { getFirebaseApp } from "@/lib/firebase-config"

export default function FirebaseInitializer({ children }: { children: React.ReactNode }) {
  const [initialized, setInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return

    try {
      // Initialize Firebase
      const app = getFirebaseApp()
      if (app) {
        console.log("Firebase initialized successfully")
        setInitialized(true)
      } else {
        setError("Failed to initialize Firebase")
      }
    } catch (err: any) {
      console.error("Firebase initialization error:", err)
      setError(err.message || "Failed to initialize Firebase")
    }
  }, [])

  // Show error message if initialization failed
  if (error && typeof window !== "undefined") {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md max-w-md w-full">
          <h2 className="text-lg font-semibold mb-2">Firebase Initialization Error</h2>
          <p>{error}</p>
          <p className="mt-4 text-sm">Please check your environment variables and Firebase configuration.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Refresh Page
          </button>
        </div>
      </div>
    )
  }

  // Show loading spinner while initializing
  if (!initialized && typeof window !== "undefined") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-500 border-l-transparent border-r-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg">Initializing application...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
