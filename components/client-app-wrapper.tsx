"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { FirebaseProvider } from "./firebase-provider"
import { LanguageProvider } from "@/lib/language-context"
import { ThemeProvider } from "@/lib/theme-context"
import Header from "./header"
import Footer from "./footer"
import Sidebar from "./sidebar"

export default function ClientAppWrapper({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <FirebaseProvider>
      <LanguageProvider>
        <ThemeProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <div className="flex flex-1">
              <Sidebar />
              <main className="flex-1 ml-16 md:ml-64 pt-16">{children}</main>
            </div>
            <Footer />
          </div>
        </ThemeProvider>
      </LanguageProvider>
    </FirebaseProvider>
  )
}
