"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useLanguage } from "@/lib/language-context"
import {
  Home,
  BarChart3,
  Users,
  Settings,
  HelpCircle,
  FileText,
  PlusCircle,
  ChevronRight,
  ChevronLeft,
} from "lucide-react"

interface SidebarProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const { t } = useLanguage()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    setMounted(true)
    // Mock user for demo purposes
    setUser({ role: "admin" })
  }, [])

  if (!mounted) return null

  const isAdmin = user?.role === "admin"

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const navItems = [
    {
      name: t("home"),
      href: "/",
      icon: Home,
      roles: ["user", "admin", "evaluator"],
    },
    {
      name: t("results"),
      href: "/results-dashboard",
      icon: BarChart3,
      roles: ["user", "admin", "evaluator"],
    },
    {
      name: t("createProject"),
      href: "/create-project",
      icon: PlusCircle,
      roles: ["admin"],
    },
    {
      name: t("users"),
      href: "/project-assignments",
      icon: Users,
      roles: ["admin"],
    },
    {
      name: t("settings"),
      href: "/settings",
      icon: Settings,
      roles: ["user", "admin", "evaluator"],
    },
    {
      name: t("help"),
      href: "/help",
      icon: HelpCircle,
      roles: ["user", "admin", "evaluator"],
    },
    {
      name: t("userManual"),
      href: "/user-manual",
      icon: FileText,
      roles: ["user", "admin", "evaluator"],
    },
  ]

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 flex flex-col pt-16 transition-all duration-300 transform bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 ${
        isOpen ? "w-64" : "w-20"
      } ${isOpen ? "translate-x-0" : "-translate-x-0"}`}
    >
      <div className="flex items-center justify-end p-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems
          .filter((item) => item.roles.includes(user?.role || "guest"))
          .map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-4 py-3 rounded-md transition-all duration-300 ${
                  isActive
                    ? "bg-blue-50 dark:bg-blue-900 dark:bg-opacity-30 text-blue-600 dark:text-blue-400"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <item.icon size={20} className={`${isOpen ? "mr-3" : "mx-auto"}`} />
                {isOpen && <span>{item.name}</span>}
              </Link>
            )
          })}
      </nav>
    </aside>
  )
}
