"use client"

import { useRouter } from "next/navigation"
import { ClipboardList, LogOut } from "lucide-react"
import { auth } from "@/lib/firebase-config"

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

  // Determine the heading based on the current route
  const getHeading = () => {
    if (typeof window === "undefined") return "Evaluator Tool"

    const pathname = window.location.pathname

    switch (pathname) {
      case "/admin-dashboard":
        return "Admin Dashboard"
      case "/create-project":
        return "Create Project"
      case "/user-dashboard":
        return "User Dashboard"
      default:
        return "Evaluator Tool"
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

        {user && (
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">{user.email}</span>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 text-sm text-gray-700 hover:text-red-600 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
