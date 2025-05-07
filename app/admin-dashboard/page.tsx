"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { auth, db } from "@/lib/firebase-config"
import { doc, getDoc } from "firebase/firestore"
import Header from "@/components/header"
import AdminDashboard from "@/components/admin-dashboard"
import { onAuthStateChanged } from "firebase/auth"

export default function AdminDashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if auth is initialized before using onAuthStateChanged
    if (!auth) {
      console.error("Firebase auth is not initialized")
      setLoading(false)
      router.push("/")
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Check if db is initialized
          if (!db) {
            console.error("Firebase db is not initialized")
            setLoading(false)
            router.push("/")
            return
          }

          // Fetch user role from Firestore
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
          const userData = userDoc.exists() ? userDoc.data() : {}

          if (userData.role !== "admin") {
            // Redirect non-admin users
            router.push("/landing")
            return
          }

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
      if (auth) {
        await auth.signOut()
        setUser(null)
        router.push("/")
      }
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
        {user?.role === "admin" ? (
          <AdminDashboard user={user} />
        ) : (
          <div className="container mx-auto px-4 py-8">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              You don't have permission to access this page.
            </div>
          </div>
        )}
      </main>
    </>
  )
}
