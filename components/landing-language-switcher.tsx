"use client"

import { useState, useEffect, useRef } from "react"
import { Globe, Check, ChevronDown, RefreshCw } from "lucide-react"
import { createPortal } from "react-dom"
import type { Language } from "@/lib/translations"

export default function LandingLanguageSwitcher() {
  const [language, setLanguageState] = useState<Language>("en")
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isChanging, setIsChanging] = useState(false)
  const [lastChanged, setLastChanged] = useState<Date | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [dropdownStyles, setDropdownStyles] = useState({
    top: 0,
    left: 0,
    width: 0,
  })

  useEffect(() => {
    setMounted(true)

    // Try to get the language from localStorage
    try {
      const savedLanguage = localStorage.getItem("language") as Language
      if (savedLanguage && (savedLanguage === "en" || savedLanguage === "lv")) {
        setLanguageState(savedLanguage)

        // Check if this was a recent change (within last 5 seconds)
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

    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Update dropdown position when it opens or window resizes
  useEffect(() => {
    const updatePosition = () => {
      if (buttonRef.current && isOpen) {
        const rect = buttonRef.current.getBoundingClientRect()
        const scrollTop = window.scrollY || document.documentElement.scrollTop

        setDropdownStyles({
          top: rect.bottom + scrollTop,
          left: Math.max(0, rect.left),
          width: Math.min(160, window.innerWidth - 20),
        })
      }
    }

    updatePosition()
    window.addEventListener("resize", updatePosition)
    window.addEventListener("scroll", updatePosition)

    return () => {
      window.removeEventListener("resize", updatePosition)
      window.removeEventListener("scroll", updatePosition)
    }
  }, [isOpen])

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  const changeLanguage = (lang: Language) => {
    if (lang === language) {
      setIsOpen(false)
      return
    }

    setIsChanging(true)

    // Update local state
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

    setIsOpen(false)

    // Force a hard reload to ensure all components update
    setTimeout(() => {
      window.location.reload()
    }, 300)
  }

  if (!mounted) return null

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        className={`flex items-center space-x-1 p-2 rounded-md transition-all duration-300 
          ${isChanging ? "bg-blue-100 dark:bg-blue-900" : "hover:bg-gray-100 dark:hover:bg-gray-700"} 
          active:bg-gray-200 dark:active:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40
          ${lastChanged ? "ring-2 ring-green-500 dark:ring-green-400" : ""}`}
        onClick={toggleDropdown}
        aria-label="Change language"
        aria-expanded={isOpen}
        aria-haspopup="true"
        disabled={isChanging}
      >
        {isChanging ? (
          <RefreshCw size={20} className="text-blue-600 dark:text-blue-400 animate-spin" />
        ) : (
          <Globe size={20} className="text-blue-600 dark:text-blue-400" />
        )}
        <span className="text-sm font-medium">{language === "en" ? "EN" : "LV"}</span>
        <ChevronDown size={16} className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />

        {lastChanged && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
        )}
      </button>

      {isOpen &&
        mounted &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed min-w-[160px] rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 ring-1 ring-black/5 dark:ring-white/10 z-[9999]"
            style={{
              top: `${dropdownStyles.top}px`,
              left: `${dropdownStyles.left}px`,
              width: `${dropdownStyles.width}px`,
            }}
          >
            <button
              className="w-full text-left px-4 py-3 text-sm flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                // Direct approach without using the changeLanguage function
                try {
                  localStorage.setItem("language", "en")
                  window.location.href = window.location.pathname
                } catch (error) {
                  console.error("Error changing language:", error)
                }
              }}
            >
              <span>English</span>
              {language === "en" && <Check size={16} className="text-blue-600 dark:text-blue-400" />}
            </button>
            <button
              className="w-full text-left px-4 py-3 text-sm flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                // Direct approach without using the changeLanguage function
                try {
                  localStorage.setItem("language", "lv")
                  window.location.href = window.location.pathname
                } catch (error) {
                  console.error("Error changing language:", error)
                }
              }}
            >
              <span>Latviešu</span>
              {language === "lv" && <Check size={16} className="text-blue-600 dark:text-blue-400" />}
            </button>
          </div>,
          document.body,
        )}
    </div>
  )
}
