"\"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { type Language, type TranslationKey, getTranslation } from "./translations"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: TranslationKey, replacements?: Record<string, string>) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Try to get the language from localStorage, default to English
  const [language, setLanguageState] = useState<Language>("en")

  useEffect(() => {
    // Only access localStorage on the client side
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage && (savedLanguage === "en" || savedLanguage === "lv")) {
      setLanguageState(savedLanguage)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("language", lang)
  }

  const t = (key: TranslationKey, replacements?: Record<string, string>) => {
    return getTranslation(language, key, replacements)
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
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
