"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { auth, db } from "@/lib/firebase-config"
import { doc, getDoc } from "firebase/firestore"
import Header from "@/components/header"
import SignIn from "@/components/sign-in"

export default function SignInPage() {
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

          // Redirect based on role
          if (userData.role === "admin") {
            router.push("/admin-dashboard")
          } else {
            router.push("/landing")
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
          setUser(null)
        }
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [router])

  const handleSetUser = (userData: any) => {
    setUser(userData)
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
      <Header user={user} />
      <main className="flex-1">{!user && <SignIn setUser={handleSetUser} />}</main>
    </>
  )
}
