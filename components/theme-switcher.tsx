"use client"

import { useState, useEffect } from "react"
import { Sun, Moon } from "lucide-react"

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState("light")
  const [mounted, setMounted] = useState(false)

  // Only run on client side
  useEffect(() => {
    setMounted(true)
    // Get initial theme from localStorage or default to light
    const savedTheme = localStorage.getItem("theme") || "light"
    setTheme(savedTheme)

    // Apply theme class to document
    document.documentElement.classList.remove("light", "dark")
    document.documentElement.classList.add(savedTheme)
  }, [])

  // Handle theme toggle
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)

    // Save to localStorage
    localStorage.setItem("theme", newTheme)

    // Apply theme class to document
    document.documentElement.classList.remove("light", "dark")
    document.documentElement.classList.add(newTheme)
  }

  // Don't render anything until mounted (to avoid hydration mismatch)
  if (!mounted) return null

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
