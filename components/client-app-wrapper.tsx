"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Header from "./header"
import Sidebar from "./sidebar"
import Footer from "./footer"
import { LanguageProvider } from "@/lib/language-context"

export default function ClientAppWrapper({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Check if we're on an auth page
  const authPages = ["/signin", "/register", "/reset-password"]
  const isAuthPage = authPages.includes(pathname)

  // Close sidebar when clicking on main content
  const handleMainContentClick = () => {
    if (sidebarOpen) {
      setSidebarOpen(false)
    }
  }

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <LanguageProvider>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar - don't render on auth pages */}
        {!isAuthPage && mounted && <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />}

        {/* Main content */}
        <div className="flex flex-col flex-1 w-full overflow-hidden" onClick={handleMainContentClick}>
          {/* Header */}
          <Header isAuthPage={isAuthPage} toggleSidebar={toggleSidebar} />

          {/* Main content area */}
          <main
            className={`flex-1 overflow-y-auto pt-16 pb-16 transition-all duration-300 ${
              isAuthPage ? "px-4" : sidebarOpen ? "md:pl-64" : "md:pl-20"
            }`}
          >
            <div className={`container mx-auto py-6 ${isAuthPage ? "max-w-md" : ""}`}>{children}</div>
          </main>

          {/* Footer */}
          <Footer />
        </div>
      </div>
    </LanguageProvider>
  )
}
