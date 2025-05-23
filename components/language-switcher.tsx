"use client"

import { useState, useEffect, useRef } from "react"
import { Globe, Check, ChevronDown } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import type { Language } from "@/lib/translations"
import { createPortal } from "react-dom"

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [dropdownStyles, setDropdownStyles] = useState({
    top: 0,
    left: 0,
    width: 0,
  })

  useEffect(() => {
    setMounted(true)

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
    // Direct localStorage update for immediate effect
    try {
      localStorage.setItem("language", lang)
    } catch (error) {
      console.error("Error saving language to localStorage:", error)
    }

    // Close dropdown
    setIsOpen(false)

    // Force page reload to apply language change
    window.location.reload()
  }

  if (!mounted) return null

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        className="flex items-center space-x-1 p-2 rounded-md transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        onClick={toggleDropdown}
        aria-label="Change language"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Globe size={20} className="text-blue-600 dark:text-blue-400" />
        <span className="text-sm font-medium">{language === "en" ? "EN" : "LV"}</span>
        <ChevronDown size={16} className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
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
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <button
              className="w-full text-left px-4 py-3 text-sm flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                changeLanguage("en")
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
                changeLanguage("lv")
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
