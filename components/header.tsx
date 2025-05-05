"use client"

import { useRouter } from "next/navigation"
import { ClipboardList, LogOut, Home, HelpCircle } from "lucide-react"
import { auth } from "@/lib/firebase-config"
import { useLanguage } from "@/lib/language-context"
import LanguageSwitcher from "./language-switcher"
import Link from "next/link"

interface HeaderProps {
  user: {
    uid?: string
    email?: string
    role?: string
  } | null
  onLogout?: () => void
}

export default function Header({ user, onLogout }: HeaderProps) {
  const router = useRouter()
  const { t } = useLanguage()

  // Determine the heading based on the current route
  const getHeading = () => {
    if (typeof window === "undefined") return "Evaluator Tool"

    const pathname = window.location.pathname

    switch (pathname) {
      case "/admin-dashboard":
        return t("adminDashboard")
      case "/create-project":
        return t("createNewProject")
      case "/user-dashboard":
        return "User Dashboard"
      default:
        return "LAPAS Evaluator Tool"
    }
  }

  // Handle logout
  const handleLogout = async () => {
    if (onLogout) {
      onLogout()
    } else if (auth) {
      try {
        await auth.signOut()
        router.push("/") // Redirect to the landing page after logout
      } catch (error) {
        console.error("Error signing out:", error)
      }
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <ClipboardList className="h-6 w-6 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-800">{getHeading()}</h1>
        </div>

        <div className="flex items-center space-x-4">
          {user && (
            <Link
              href="/help"
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
            >
              <HelpCircle className="h-4 w-4 mr-1" />
              <span>{t("userManual")}</span>
            </Link>
          )}

          <LanguageSwitcher />

          <button
            onClick={() => router.push("/landing")}
            className="flex items-center space-x-1 text-sm text-gray-700 hover:text-blue-600 transition-colors"
          >
            <Home className="h-4 w-4" />
            <span>{t("home")}</span>
          </button>

          {user && (
            <>
              <span className="text-sm text-gray-600">{user.email}</span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-sm text-gray-700 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>{t("logout")}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
