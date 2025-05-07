"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useLanguage } from "@/lib/language-context"
import { Menu, X, LogOut, User, ChevronDown, Book, MenuIcon } from "lucide-react"
import LanguageSwitcher from "./language-switcher"
import ThemeSwitcher from "./theme-switcher"

interface HeaderProps {
  isAuthPage?: boolean
  toggleSidebar?: () => void
}

export default function Header({ isAuthPage = false, toggleSidebar }: HeaderProps) {
  const { t } = useLanguage()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    setMounted(true)
    // Mock user for demo purposes
    setUser({ email: "demo@example.com", role: "admin" })
  }, [])

  // Close mobile menu when path changes
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  if (!mounted) return null

  const handleSignOut = async () => {
    // Mock sign out
    setUser(null)
    setUserMenuOpen(false)
  }

  // Simplified header for auth pages
  if (isAuthPage) {
    return (
      <header className="fixed top-0 left-0 right-0 h-16 z-40 flex items-center justify-between px-4 border-b bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <Link href="/" className="flex items-center">
          <span className="text-xl font-bold text-blue-600 dark:text-blue-400">LAPAS</span>
          <span className="ml-2 text-xl font-semibold text-gray-800 dark:text-gray-200">{t("evaluator")}</span>
        </Link>

        <div className="flex items-center space-x-4">
          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>
      </header>
    )
  }

  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-40 flex items-center justify-between px-4 border-b bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <div className="flex items-center">
        {/* Sidebar toggle for mobile */}
        <button
          onClick={toggleSidebar}
          className="p-2 mr-2 rounded-md md:hidden text-gray-700 dark:text-gray-300"
          aria-label="Toggle sidebar"
        >
          <MenuIcon size={20} />
        </button>

        <Link href="/" className="flex items-center">
          <span className="text-xl font-bold text-blue-600 dark:text-blue-400">LAPAS</span>
          <span className="ml-2 text-xl font-semibold text-gray-800 dark:text-gray-200">{t("evaluator")}</span>
        </Link>
      </div>

      {/* Desktop navigation */}
      <nav className="hidden md:flex items-center space-x-6">
        <Link
          href="/"
          className={`text-sm font-medium transition-all duration-300 ${
            pathname === "/"
              ? "text-blue-600 dark:text-blue-400"
              : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
          }`}
        >
          {t("home")}
        </Link>
        <Link
          href="/results-dashboard"
          className={`text-sm font-medium transition-all duration-300 ${
            pathname === "/results-dashboard"
              ? "text-blue-600 dark:text-blue-400"
              : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
          }`}
        >
          {t("results")}
        </Link>
        <Link
          href="/help"
          className={`text-sm font-medium transition-all duration-300 ${
            pathname === "/help"
              ? "text-blue-600 dark:text-blue-400"
              : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
          }`}
        >
          {t("help")}
        </Link>
        <Link
          href="/user-manual"
          className={`text-sm font-medium transition-all duration-300 ${
            pathname === "/user-manual"
              ? "text-blue-600 dark:text-blue-400"
              : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
          }`}
        >
          <span className="flex items-center">
            <Book size={16} className="mr-1" />
            {t("userManual")}
          </span>
        </Link>
      </nav>

      {/* User menu and actions */}
      <div className="flex items-center space-x-4">
        <LanguageSwitcher />
        <ThemeSwitcher />

        {user ? (
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center space-x-1 p-2 rounded-md transition-all duration-300 text-gray-700 dark:text-gray-300"
            >
              <User size={20} />
              <span className="hidden md:inline text-sm">{user.email?.split("@")[0]}</span>
              <ChevronDown size={16} />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <div className="px-4 py-2 text-sm border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">
                  {t("signedInAs")} <span className="font-medium">{user.role}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2 text-sm flex items-center transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  <LogOut size={16} className="mr-2" />
                  {t("signOut")}
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/signin"
            className="px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {t("signIn")}
          </Link>
        )}

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-md md:hidden text-gray-700 dark:text-gray-300"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 p-4 border-b md:hidden z-30 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <nav className="flex flex-col space-y-4">
            <Link
              href="/"
              className="text-sm font-medium py-2 transition-all duration-300 text-gray-700 dark:text-gray-300"
            >
              {t("home")}
            </Link>
            <Link
              href="/results-dashboard"
              className="text-sm font-medium py-2 transition-all duration-300 text-gray-700 dark:text-gray-300"
            >
              {t("results")}
            </Link>
            <Link
              href="/help"
              className="text-sm font-medium py-2 transition-all duration-300 text-gray-700 dark:text-gray-300"
            >
              {t("help")}
            </Link>
            <Link
              href="/user-manual"
              className="text-sm font-medium py-2 transition-all duration-300 text-gray-700 dark:text-gray-300"
            >
              <span className="flex items-center">
                <Book size={16} className="mr-1" />
                {t("userManual")}
              </span>
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
