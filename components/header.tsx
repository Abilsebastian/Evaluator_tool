"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Menu, X, User, LogOut } from "lucide-react"

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { user, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [isDuplicate, setIsDuplicate] = useState(false)
  const userButtonRef = useRef<HTMLButtonElement>(null)
  const [dropdownStyles, setDropdownStyles] = useState({
    top: 0,
    left: 0,
    width: 192,
  })

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)

    // Check if there's already a header with this data attribute in the DOM
    const headers = document.querySelectorAll("header[data-app-header]")

    // If this is the second+ header being mounted, don't render it
    if (headers.length > 1) {
      setIsDuplicate(true)
    }
  }, [])

  // Update dropdown position when it opens or window resizes
  useEffect(() => {
    const updatePosition = () => {
      if (userButtonRef.current && userMenuOpen) {
        const rect = userButtonRef.current.getBoundingClientRect()
        const scrollTop = window.scrollY || document.documentElement.scrollTop

        // Calculate position to ensure dropdown is visible
        const rightEdge = rect.right
        const windowWidth = window.innerWidth

        // Position dropdown to the left if it would overflow right edge
        const left = rightEdge - 192 > 0 ? rightEdge - 192 : 10

        setDropdownStyles({
          top: rect.bottom + scrollTop,
          left: left,
          width: Math.min(192, windowWidth - 20),
        })
      }
    }

    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (userButtonRef.current && !userButtonRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }

    if (userMenuOpen) {
      updatePosition()
      document.addEventListener("mousedown", handleClickOutside)
      window.addEventListener("resize", updatePosition)
      window.addEventListener("scroll", updatePosition)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      window.removeEventListener("resize", updatePosition)
      window.removeEventListener("scroll", updatePosition)
    }
  }, [userMenuOpen])

  // Check if we're on an auth page
  const authPages = ["/signin", "/register", "/reset-password"]
  const isAuthPage = authPages.includes(pathname)
  const isRootPage = pathname === "/"

  // Don't render header on auth pages, root page, or if it's a duplicate
  if (isAuthPage || isRootPage || !mounted || isDuplicate) {
    return null
  }

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      await signOut()
      setUserMenuOpen(false)
      window.location.href = "/signin"
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <>
      {/* Header spacer to prevent content from being hidden under the fixed header */}
      <div className="h-16 w-full"></div>

      <header
        data-app-header
        className="absolute top-0 left-0 right-0 h-16 z-50 bg-background border-b border-border shadow-sm"
      >
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/landing" className="flex items-center">
              {/* LAPAS-inspired logo */}
              <div className="w-8 h-8 relative">
                <svg viewBox="0 0 40 40" className="w-full h-full text-purple-700 dark:text-purple-500">
                  <path
                    fill="currentColor"
                    d="M20,0 C25,0 30,5 30,15 C30,25 25,30 20,30 C15,30 10,25 10,15 C10,5 15,0 20,0 Z M20,5 C17.5,5 15,8 15,15 C15,22 17.5,25 20,25 C22.5,25 25,22 25,15 C25,8 22.5,5 20,5 Z"
                  />
                  <path
                    fill="currentColor"
                    d="M15,20 L5,30 L5,35 L15,25 L15,20 Z M25,20 L35,30 L35,35 L25,25 L25,20 Z"
                  />
                </svg>
              </div>
              <div className="flex flex-col ml-2">
                <span className="text-sm font-bold text-purple-700 dark:text-purple-500">LAPAS</span>
                <span className="text-xs text-gray-600 dark:text-gray-400">Project Evaluator</span>
              </div>
            </Link>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {user && (
              <>
                <Link
                  href="/landing"
                  className={`text-sm font-medium transition-colors ${
                    pathname === "/landing"
                      ? "text-purple-700 dark:text-purple-500"
                      : "text-foreground hover:text-purple-700 dark:hover:text-purple-500"
                  }`}
                >
                  Dashboard
                </Link>
                {user.role === "admin" && (
                  <>
                    <Link
                      href="/admin-dashboard"
                      className={`text-sm font-medium transition-colors ${
                        pathname === "/admin-dashboard"
                          ? "text-purple-700 dark:text-purple-500"
                          : "text-foreground hover:text-purple-700 dark:hover:text-purple-500"
                      }`}
                    >
                      Admin
                    </Link>
                    <Link
                      href="/results-dashboard"
                      className={`text-sm font-medium transition-colors ${
                        pathname === "/results-dashboard"
                          ? "text-purple-700 dark:text-purple-500"
                          : "text-foreground hover:text-purple-700 dark:hover:text-purple-500"
                      }`}
                    >
                      Results
                    </Link>
                  </>
                )}
                <Link
                  href="/help"
                  className={`text-sm font-medium transition-colors ${
                    pathname === "/help"
                      ? "text-purple-700 dark:text-purple-500"
                      : "text-foreground hover:text-purple-700 dark:hover:text-purple-500"
                  }`}
                >
                  Help
                </Link>
              </>
            )}
          </nav>

          {/* User menu */}
          <div className="flex items-center">
            {user ? (
              <div className="relative">
                <button
                  ref={userButtonRef}
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-purple-500/40 rounded-md p-1"
                >
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                    <User className="h-4 w-4 text-purple-700 dark:text-purple-400" />
                  </div>
                  <span className="hidden md:block text-sm font-medium">{user.email?.split("@")[0]}</span>
                </button>

                {userMenuOpen &&
                  mounted &&
                  typeof document !== "undefined" &&
                  createPortal(
                    <div
                      className="fixed rounded-md shadow-lg z-[9999] bg-card border border-border overflow-hidden"
                      style={{
                        top: `${dropdownStyles.top}px`,
                        left: `${dropdownStyles.left}px`,
                        width: `${dropdownStyles.width}px`,
                      }}
                    >
                      <div className="py-1">
                        <button
                          onClick={handleSignOut}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-muted flex items-center text-destructive"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign out
                        </button>
                      </div>
                    </div>,
                    document.body,
                  )}
              </div>
            ) : (
              <Link
                href="/signin"
                className="px-4 py-2 rounded-md text-sm font-medium bg-purple-700 hover:bg-purple-800 text-white"
              >
                Sign In
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              className="ml-4 p-2 rounded-md md:hidden focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/20 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)}></div>

          {/* Menu */}
          <div className="fixed top-16 inset-x-0 z-50 bg-background border-b border-border md:hidden shadow-md">
            <nav className="max-w-7xl mx-auto px-4 py-3 flex flex-col space-y-3">
              {user ? (
                <>
                  <Link
                    href="/landing"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      pathname === "/landing"
                        ? "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-400"
                        : "hover:bg-muted"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  {user.role === "admin" && (
                    <>
                      <Link
                        href="/admin-dashboard"
                        className={`px-3 py-2 rounded-md text-sm font-medium ${
                          pathname === "/admin-dashboard"
                            ? "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-400"
                            : "hover:bg-muted"
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Admin
                      </Link>
                      <Link
                        href="/results-dashboard"
                        className={`px-3 py-2 rounded-md text-sm font-medium ${
                          pathname === "/results-dashboard"
                            ? "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-400"
                            : "hover:bg-muted"
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Results
                      </Link>
                    </>
                  )}
                  <Link
                    href="/help"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      pathname === "/help"
                        ? "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-400"
                        : "hover:bg-muted"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Help
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="px-3 py-2 rounded-md text-sm font-medium text-left hover:bg-muted text-destructive flex items-center"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </button>
                </>
              ) : (
                <Link
                  href="/signin"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-muted"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
              )}
            </nav>
          </div>
        </>
      )}
    </>
  )
}
