"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// Define theme types
export type ThemeName = "light" | "dark" | "blue" | "green" | "purple"

interface ThemeData {
  label: {
    en: string
    lv: string
  }
  colors: {
    primary: string
    [key: string]: string
  }
}

export const themes: Record<ThemeName, ThemeData> = {
  light: {
    label: { en: "Light", lv: "Gaišs" },
    colors: {
      primary: "#3b82f6",
      background: "#ffffff",
      text: "#1f2937",
    },
  },
  dark: {
    label: { en: "Dark", lv: "Tumšs" },
    colors: {
      primary: "#60a5fa",
      background: "#1f2937",
      text: "#f9fafb",
    },
  },
  blue: {
    label: { en: "Blue", lv: "Zils" },
    colors: {
      primary: "#2563eb",
      background: "#eff6ff",
      text: "#1e3a8a",
    },
  },
  green: {
    label: { en: "Green", lv: "Zaļš" },
    colors: {
      primary: "#10b981",
      background: "#ecfdf5",
      text: "#064e3b",
    },
  },
  purple: {
    label: { en: "Purple", lv: "Violets" },
    colors: {
      primary: "#8b5cf6",
      background: "#f5f3ff",
      text: "#5b21b6",
    },
  },
}

interface ThemeContextType {
  theme: ThemeName
  setTheme: (theme: ThemeName) => void
  themes: typeof themes
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Try to get the theme from localStorage, default to system preference or light
  const [theme, setThemeState] = useState<ThemeName>("light")

  useEffect(() => {
    // Only access localStorage on the client side
    try {
      const savedTheme = localStorage.getItem("theme") as ThemeName
      if (savedTheme && Object.keys(themes).includes(savedTheme)) {
        setThemeState(savedTheme)
      } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        setThemeState("dark")
      }
    } catch (error) {
      console.error("Error accessing localStorage:", error)
    }
  }, [])

  // Apply theme to document
  useEffect(() => {
    try {
      // Update data-theme attribute
      document.documentElement.setAttribute("data-theme", theme)

      // Update dark mode class
      if (theme === "dark") {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
      }

      // Save to localStorage
      localStorage.setItem("theme", theme)
    } catch (error) {
      console.error("Error applying theme:", error)
    }
  }, [theme])

  const setTheme = (newTheme: ThemeName) => {
    try {
      setThemeState(newTheme)
    } catch (error) {
      console.error("Error setting theme:", error)
    }
  }

  return <ThemeContext.Provider value={{ theme, setTheme, themes }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  return context
}
