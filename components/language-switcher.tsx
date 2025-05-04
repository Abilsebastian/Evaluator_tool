"use client"

import { useLanguage } from "@/lib/language-context"
import { Globe } from "lucide-react"

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage()

  return (
    <div className="relative group">
      <button className="flex items-center space-x-1 text-sm text-gray-700 hover:text-blue-600 transition-colors">
        <Globe className="h-4 w-4" />
        <span>{t("language")}</span>
      </button>
      <div className="absolute right-0 mt-1 w-36 bg-white rounded-md shadow-lg overflow-hidden z-20 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-300">
        <div className="absolute -top-2 left-0 right-0 h-2 bg-transparent"></div>
        <div className="py-1">
          <button
            onClick={() => setLanguage("en")}
            className={`flex items-center w-full px-4 py-2 text-sm ${
              language === "en" ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <span>{t("english")}</span>
            {language === "en" && (
              <svg className="h-4 w-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>
          <button
            onClick={() => setLanguage("lv")}
            className={`flex items-center w-full px-4 py-2 text-sm ${
              language === "lv" ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <span>{t("latvian")}</span>
            {language === "lv" && (
              <svg className="h-4 w-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
