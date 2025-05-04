"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase-config"
import SignIn from "@/components/sign-in"
import Header from "@/components/header"
import EnvChecker from "@/components/env-checker"

export default function Home() {
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

            // Always redirect to landing page regardless of role
            router.push("/landing")
          } catch (error) {
            console.error("Error fetching user data:", error)
            setError("Error fetching user data. Please try again.")
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

  const handleLogout = async () => {
    try {
      if (auth) {
        await auth.signOut()
        setUser(null)
        router.push("/")
      }
    } catch (error: any) {
      console.error("Error signing out:", error)
      setError(`Error signing out: ${error.message}`)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <>
      <Header user={user} onLogout={handleLogout} />
      <main className="flex-1">
        {!user && <SignIn setUser={setUser} />}
        {error && (
          <div className="container mx-auto px-4 py-8">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              <p>{error}</p>
            </div>
            <EnvChecker />
          </div>
        )}
      </main>
    </>
  )
}
