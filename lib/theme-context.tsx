"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

type Theme = "light" | "dark" | "vibrant" | "midnight" | "emerald" | "sunset"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  isChangingTheme: boolean
  availableThemes: {
    id: Theme
    name: string
    description: string
  }[]
}

const defaultThemes = [
  {
    id: "light" as Theme,
    name: "Light",
    description: "Clean and bright",
  },
  {
    id: "dark" as Theme,
    name: "Dark",
    description: "Easy on the eyes",
  },
  {
    id: "vibrant" as Theme,
    name: "Vibrant",
    description: "Bold purple accents",
  },
  {
    id: "midnight" as Theme,
    name: "Midnight",
    description: "Deep blue tones",
  },
  {
    id: "emerald" as Theme,
    name: "Emerald",
    description: "Fresh green theme",
  },
  {
    id: "sunset" as Theme,
    name: "Sunset",
    description: "Warm orange hues",
  },
]

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light")
  const [isChangingTheme, setIsChangingTheme] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Update the theme
  const setTheme = (newTheme: Theme) => {
    setIsChangingTheme(true)
    setThemeState(newTheme)

    // Save to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", newTheme)
    }

    // Apply theme class to document
    document.documentElement.classList.remove("light", "dark", "vibrant", "midnight", "emerald", "sunset")
    document.documentElement.classList.add(newTheme)

    // Reset changing state after a short delay
    setTimeout(() => {
      setIsChangingTheme(false)
    }, 300)
  }

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    setMounted(true)

    const savedTheme = localStorage.getItem("theme") as Theme | null

    if (savedTheme && defaultThemes.some((t) => t.id === savedTheme)) {
      setTheme(savedTheme)
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark")
    }
  }, [])

  // Provide a value object with the theme and setter
  const value = {
    theme,
    setTheme,
    isChangingTheme,
    availableThemes: defaultThemes,
  }

  // Avoid rendering with SSR
  if (!mounted) {
    return <>{children}</>
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
