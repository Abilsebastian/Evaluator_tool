"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import Header from "./header"
import Sidebar from "./sidebar"
import Footer from "./footer"
import { LanguageProvider } from "@/lib/language-context"
import { ThemeProvider } from "@/lib/theme-context"
import { NotificationProvider } from "@/lib/notification-context"

// Auth pages where we don't want to show the sidebar
const authPages = ["/signin", "/register", "/reset-password"]

export default function ClientAppWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = authPages.includes(pathname)
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <ThemeProvider>
      <LanguageProvider>
        <NotificationProvider>
          <div className="flex min-h-screen flex-col">
            {!isAuthPage && <Header />}
            <div className={`flex flex-1 ${isAuthPage ? "" : "pt-16"}`}>
              {!isAuthPage && <Sidebar />}
              <main className={`flex-1 ${isAuthPage ? "" : "p-4 md:p-6 lg:p-8"}`}>{children}</main>
            </div>
            {!isAuthPage && <Footer />}
          </div>
        </NotificationProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}
