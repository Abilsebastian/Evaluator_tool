"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase-config"
import Header from "@/components/header"
import UserManual from "@/components/user-manual"
import { LanguageProvider } from "@/lib/language-context"

export default function HelpPage() {
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        router.push("/")
      }
    })

    return () => unsubscribe()
  }, [router])

  return (
    <LanguageProvider>
      <Header user={null} />
      <UserManual />
    </LanguageProvider>
  )
}
