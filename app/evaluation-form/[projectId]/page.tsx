"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { auth, db } from "@/lib/firebase-config"
import { doc, getDoc } from "firebase/firestore"
import Header from "@/components/header"
import EvaluationForm from "@/components/evaluation-form"

export default function EvaluationFormPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
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
          router.push("/")
        }
      } else {
        setUser(null)
        router.push("/")
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  const handleLogout = async () => {
    try {
      await auth.signOut()
      setUser(null)
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
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
        {user ? (
          <EvaluationForm user={user} />
        ) : (
          <div className="container mx-auto px-4 py-8">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              Please sign in to access this page.
            </div>
          </div>
        )}
      </main>
    </>
  )
}
