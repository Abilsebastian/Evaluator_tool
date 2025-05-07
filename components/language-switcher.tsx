"use client"

import { useState, useEffect, useRef } from "react"
import { useLanguage } from "@/lib/language-context"
import { Globe, Check, ChevronDown } from "lucide-react"

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)

    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  const changeLanguage = (lang: string) => {
    setLanguage(lang)
    setIsOpen(false)
  }

  if (!mounted) return null

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="flex items-center space-x-1 p-2 rounded-md transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover-scale"
        onClick={toggleDropdown}
        aria-label={t("changeLanguage")}
        aria-expanded={isOpen}
        aria-haspopup="true"
        style={{ color: "var(--color-foreground)" }}
      >
        <Globe size={20} />
        <span className="hidden sm:inline text-sm font-medium">{language === "en" ? "EN" : "LV"}</span>
        <ChevronDown size={16} className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-40 rounded-md shadow-lg py-1 z-50 animate-slide-down"
          style={{
            backgroundColor: "var(--color-card)",
            borderColor: "var(--color-border)",
            border: "1px solid var(--color-border)",
          }}
        >
          <button
            className="w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
            onClick={() => changeLanguage("en")}
            style={{ color: "var(--color-foreground)" }}
          >
            <span>English</span>
            {language === "en" && <Check size={16} style={{ color: "var(--color-primary)" }} />}
          </button>
          <button
            className="w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
            onClick={() => changeLanguage("lv")}
            style={{ color: "var(--color-foreground)" }}
          >
            <span>Latviešu</span>
            {language === "lv" && <Check size={16} style={{ color: "var(--color-primary)" }} />}
          </button>
        </div>
      )}
    </div>
  )
}
