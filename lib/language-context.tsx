"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { type Language, type TranslationKey, getTranslation } from "./translations"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: TranslationKey, replacements?: Record<string, string>) => string
  lastChanged: Date | null
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Default to English
  const [language, setLanguageState] = useState<Language>("en")
  const [lastChanged, setLastChanged] = useState<Date | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Get language from localStorage
    try {
      const savedLanguage = localStorage.getItem("language") as Language
      if (savedLanguage && (savedLanguage === "en" || savedLanguage === "lv")) {
        setLanguageState(savedLanguage)

        // Check if this was a recent change
        const lastChangedTime = localStorage.getItem("language_changed_at")
        if (lastChangedTime) {
          const changeTime = new Date(lastChangedTime)
          const now = new Date()
          if (now.getTime() - changeTime.getTime() < 5000) {
            setLastChanged(changeTime)
            // Clear the timestamp after 3 seconds
            setTimeout(() => setLastChanged(null), 3000)
          }
        }
      }
    } catch (error) {
      console.error("Error reading language from localStorage:", error)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    if (lang !== language) {
      setLanguageState(lang)

      // Save to localStorage with timestamp
      try {
        const now = new Date()
        localStorage.setItem("language", lang)
        localStorage.setItem("language_changed_at", now.toISOString())
        setLastChanged(now)
      } catch (error) {
        console.error("Error saving language to localStorage:", error)
      }
    }
  }

  const t = (key: TranslationKey, replacements?: Record<string, string>) => {
    return getTranslation(language, key, replacements)
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, lastChanged }}>{children}</LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}

export function useTranslation() {
  const { t } = useLanguage()
  return { t }
}
