"use client"

import type React from "react"

import { useEffect, useState } from "react"
import FirebaseInitializer from "./firebase-initializer"
import dynamic from "next/dynamic"

// Dynamically import components that depend on Firebase
const AuthProvider = dynamic(() => import("@/lib/auth-context").then((mod) => mod.default || mod.AuthProvider), {
  ssr: false,
})

const LanguageProvider = dynamic(() => import("@/lib/language-context").then((mod) => mod.LanguageProvider), {
  ssr: false,
})

const Header = dynamic(() => import("@/components/header"), {
  ssr: false,
})

const Footer = dynamic(() => import("@/components/footer"), {
  ssr: false,
})

export default function ClientSideWrapper({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Don't render anything on the server
  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-500 border-l-transparent border-r-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg">Loading application...</p>
        </div>
      </div>
    )
  }

  return (
    <FirebaseInitializer>
      <AuthProvider>
        <LanguageProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 w-full pt-16">{children}</main>
            <Footer />
          </div>
        </LanguageProvider>
      </AuthProvider>
    </FirebaseInitializer>
  )
}
