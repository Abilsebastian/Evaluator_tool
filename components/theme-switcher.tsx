"use client"

import { useState, useEffect } from "react"
import { Sun, Moon } from "lucide-react"

export default function ThemeSwitcher() {
  // Don't set initial state on server
  const [theme, setTheme] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  // Only run on client side
  useEffect(() => {
    // Mark as mounted first
    setMounted(true)

    // Then get the theme from localStorage
    const savedTheme = localStorage.getItem("theme") || "light"
    setTheme(savedTheme)

    // Apply theme class to document
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [])

  // Handle theme toggle
  const toggleTheme = () => {
    if (!mounted) return

    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)

    // Save to localStorage
    localStorage.setItem("theme", newTheme)

    // Apply theme class to document
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  // Don't render anything until mounted (to avoid hydration mismatch)
  if (!mounted) {
    return <div className="w-8 h-8" aria-hidden="true" />
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-md transition-colors"
      aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
    >
      {theme === "light" ? <Moon size={20} className="text-gray-700" /> : <Sun size={20} className="text-yellow-400" />}
    </button>
  )
}
