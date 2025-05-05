"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "@/lib/theme-context"
import { useLanguage } from "@/lib/language-context"
import {
  ChevronLeft,
  ChevronRight,
  Home,
  Settings,
  Users,
  BarChart2,
  PlusCircle,
  HelpCircle,
  Palette,
} from "lucide-react"

// Define fallback themes in case the context isn't available
const fallbackThemes = {
  light: {
    label: { en: "Light", lv: "Gaišs" },
    colors: { primary: "#3b82f6" },
  },
  dark: {
    label: { en: "Dark", lv: "Tumšs" },
    colors: { primary: "#1e40af" },
  },
  blue: {
    label: { en: "Blue", lv: "Zils" },
    colors: { primary: "#2563eb" },
  },
  green: {
    label: { en: "Green", lv: "Zaļš" },
    colors: { primary: "#10b981" },
  },
  purple: {
    label: { en: "Purple", lv: "Violets" },
    colors: { primary: "#8b5cf6" },
  },
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const themeContext = useTheme()
  const theme = themeContext?.theme || "light"
  const setTheme = themeContext?.setTheme || (() => {})
  const languageContext = useLanguage()
  const language = languageContext?.language || "en"
  const pathname = usePathname()

  // Check if mobile on mount and when window resizes
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setCollapsed(true)
      }
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)

    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  const toggleSidebar = () => {
    setCollapsed(!collapsed)
  }

  const isActive = (path: string) => {
    return pathname === path
  }

  // Safe translation function
  const translate = (key: string): string => {
    // Fallback translations for critical UI elements
    const fallbackTranslations: Record<string, Record<string, string>> = {
      en: {
        home: "Home",
        adminDashboard: "Admin Dashboard",
        projectAssignments: "Project Assignments",
        createProject: "Create Project",
        resultsDashboard: "Results Dashboard",
        help: "Help",
        theme: "Theme",
      },
      lv: {
        home: "Sākums",
        adminDashboard: "Administratora Panelis",
        projectAssignments: "Projektu Piešķiršana",
        createProject: "Izveidot Projektu",
        resultsDashboard: "Rezultātu Panelis",
        help: "Palīdzība",
        theme: "Tēma",
      },
    }

    try {
      // Try to use the context's translation function if available
      if (languageContext && typeof languageContext.t === "function") {
        return languageContext.t(key as any)
      }

      // Fall back to our local translations if context translation fails
      return fallbackTranslations[language][key] || key
    } catch (error) {
      // Ultimate fallback to the key itself
      console.error("Translation error:", error)
      return fallbackTranslations[language][key] || key
    }
  }

  // Get theme label safely
  const getThemeLabel = (themeName: string, lang: string): string => {
    try {
      // Try to get from context themes
      const themes = themeContext?.themes || fallbackThemes
      const themeData = themes[themeName as keyof typeof themes]

      if (themeData && themeData.label && themeData.label[lang as keyof typeof themeData.label]) {
        return themeData.label[lang as keyof typeof themeData.label]
      }

      // Fallback to our local themes
      if (fallbackThemes[themeName as keyof typeof fallbackThemes]?.label?.[lang as "en" | "lv"]) {
        return fallbackThemes[themeName as keyof typeof fallbackThemes].label[lang as "en" | "lv"]
      }

      // Ultimate fallback
      return themeName.charAt(0).toUpperCase() + themeName.slice(1)
    } catch (error) {
      console.error("Theme label error:", error)
      return themeName.charAt(0).toUpperCase() + themeName.slice(1)
    }
  }

  // Get theme color safely
  const getThemeColor = (themeName: string): string => {
    try {
      // Try to get from context themes
      const themes = themeContext?.themes || fallbackThemes
      const themeData = themes[themeName as keyof typeof themes]

      if (themeData && themeData.colors && themeData.colors.primary) {
        return themeData.colors.primary
      }

      // Fallback to our local themes
      if (fallbackThemes[themeName as keyof typeof fallbackThemes]?.colors?.primary) {
        return fallbackThemes[themeName as keyof typeof fallbackThemes].colors.primary
      }

      // Ultimate fallback
      return "#3b82f6" // Default blue
    } catch (error) {
      console.error("Theme color error:", error)
      return "#3b82f6" // Default blue
    }
  }

  // Get available themes
  const getThemes = () => {
    try {
      return themeContext?.themes || fallbackThemes
    } catch (error) {
      console.error("Themes error:", error)
      return fallbackThemes
    }
  }

  const themes = getThemes()

  return (
    <>
      {/* Mobile overlay when sidebar is open */}
      {isMobile && !collapsed && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-20" onClick={() => setCollapsed(true)} />
      )}

      <div
        className={`sidebar fixed top-16 left-0 h-[calc(100vh-64px)] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-30 transition-all duration-300 ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Toggle button */}
          <button
            onClick={toggleSidebar}
            className="absolute -right-3 top-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full p-1 shadow-md"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>

          {/* Navigation links */}
          <nav className="flex-1 py-4 overflow-y-auto">
            <ul className="space-y-2 px-2">
              <li>
                <Link
                  href="/"
                  className={`flex items-center p-2 rounded-lg ${
                    isActive("/")
                      ? "bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <Home size={20} />
                  {!collapsed && <span className="ml-3">{translate("home")}</span>}
                </Link>
              </li>
              <li>
                <Link
                  href="/admin-dashboard"
                  className={`flex items-center p-2 rounded-lg ${
                    isActive("/admin-dashboard")
                      ? "bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <Settings size={20} />
                  {!collapsed && <span className="ml-3">{translate("adminDashboard")}</span>}
                </Link>
              </li>
              <li>
                <Link
                  href="/project-assignments"
                  className={`flex items-center p-2 rounded-lg ${
                    isActive("/project-assignments")
                      ? "bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <Users size={20} />
                  {!collapsed && <span className="ml-3">{translate("projectAssignments")}</span>}
                </Link>
              </li>
              <li>
                <Link
                  href="/create-project"
                  className={`flex items-center p-2 rounded-lg ${
                    isActive("/create-project")
                      ? "bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <PlusCircle size={20} />
                  {!collapsed && <span className="ml-3">{translate("createProject")}</span>}
                </Link>
              </li>
              <li>
                <Link
                  href="/results-dashboard"
                  className={`flex items-center p-2 rounded-lg ${
                    isActive("/results-dashboard")
                      ? "bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <BarChart2 size={20} />
                  {!collapsed && <span className="ml-3">{translate("resultsDashboard")}</span>}
                </Link>
              </li>
              <li>
                <Link
                  href="/help"
                  className={`flex items-center p-2 rounded-lg ${
                    isActive("/help")
                      ? "bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <HelpCircle size={20} />
                  {!collapsed && <span className="ml-3">{translate("help")}</span>}
                </Link>
              </li>
            </ul>
          </nav>

          {/* Theme selection */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            {!collapsed && (
              <h3 className="text-sm font-medium mb-2 flex items-center">
                <Palette size={16} className="mr-2" />
                {translate("theme")}
              </h3>
            )}
            <div className={`flex ${collapsed ? "flex-col items-center" : "flex-wrap"} gap-2`}>
              {Object.keys(themes).map((themeName) => (
                <button
                  key={themeName}
                  onClick={() => setTheme(themeName)}
                  className={`${collapsed ? "p-2" : "px-3 py-2"} rounded-lg flex items-center ${
                    theme === themeName ? "ring-2 ring-primary-500" : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                  title={getThemeLabel(themeName, language)}
                  aria-label={getThemeLabel(themeName, language)}
                >
                  <span
                    className="w-5 h-5 rounded-full"
                    style={{
                      backgroundColor: getThemeColor(themeName),
                      border: "1px solid rgba(0,0,0,0.1)",
                    }}
                  ></span>
                  {!collapsed && <span className="text-sm ml-2">{getThemeLabel(themeName, language)}</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
