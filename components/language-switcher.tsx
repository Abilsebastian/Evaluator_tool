"use client"

import { useState, useRef, useEffect } from "react"
import { useLanguage } from "@/lib/language-context"
import { Globe, Check, ChevronDown } from "lucide-react"

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  const changeLanguage = (lang: "en" | "lv") => {
    setLanguage(lang)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="flex items-center space-x-1 text-sm text-gray-700 hover:text-blue-600 transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Globe className="h-4 w-4" />
        <span>{t("language")}</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-10 py-1">
          <button
            onClick={() => changeLanguage("en")}
            className="flex items-center justify-between w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <span>English</span>
            {language === "en" && <Check className="h-4 w-4 text-blue-600" />}
          </button>
          <button
            onClick={() => changeLanguage("lv")}
            className="flex items-center justify-between w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <span>Latviešu</span>
            {language === "lv" && <Check className="h-4 w-4 text-blue-600" />}
          </button>
        </div>
      )}
    </div>
  )
}
