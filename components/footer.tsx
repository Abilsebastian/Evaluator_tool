"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

export default function Footer() {
  // Use state to track if this is a duplicate footer
  const [isDuplicate, setIsDuplicate] = useState(false)
  const pathname = usePathname()
  const isRootPage = pathname === "/"

  useEffect(() => {
    // Check if there's already a footer with this data attribute in the DOM
    const footers = document.querySelectorAll("footer[data-app-footer]")

    // If this is the second+ footer being mounted, don't render it
    if (footers.length > 1) {
      setIsDuplicate(true)
    }
  }, [])

  // Don't render anything if this is a duplicate or on the root page
  if (isDuplicate || isRootPage) return null

  return (
    <footer data-app-footer className="w-full border-t border-border py-4 bg-background mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center">
            <div className="w-6 h-6 relative">
              <svg viewBox="0 0 40 40" className="w-full h-full text-purple-700 dark:text-purple-500">
                <path
                  fill="currentColor"
                  d="M20,0 C25,0 30,5 30,15 C30,25 25,30 20,30 C15,30 10,25 10,15 C10,5 15,0 20,0 Z M20,5 C17.5,5 15,8 15,15 C15,22 17.5,25 20,25 C22.5,25 25,22 25,15 C25,8 22.5,5 20,5 Z"
                />
                <path fill="currentColor" d="M15,20 L5,30 L5,35 L15,25 L15,20 Z M25,20 L35,30 L35,35 L25,25 L25,20 Z" />
              </svg>
            </div>
            <p className="ml-2 text-sm text-muted-foreground">
              © {new Date().getFullYear()}{" "}
              <span className="font-medium text-purple-700 dark:text-purple-500">LAPAS</span> Project Evaluator
            </p>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <a href="/help" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Help
            </a>
            <a
              href="https://www.lapas.lv"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              LAPAS.lv
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
