"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Bell } from "lucide-react"
import { createPortal } from "react-dom"
import { useNotifications, type Notification } from "@/lib/notification-context"
import { useLanguage } from "@/lib/language-context"
import { formatDistanceToNow } from "date-fns"
import { enUS, lv } from "date-fns/locale"

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications()
  const { t, currentLanguage } = useLanguage()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [mounted, setMounted] = useState(false)
  const [dropdownStyles, setDropdownStyles] = useState({
    top: 0,
    left: 0,
    width: 320,
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  // Format relative time based on current language
  const formatRelativeTime = (date: Date) => {
    return formatDistanceToNow(date, {
      addSuffix: true,
      locale: currentLanguage === "lv" ? lv : enUS,
    })
  }

  // Update dropdown position when it opens or window resizes
  useEffect(() => {
    const updatePosition = () => {
      if (buttonRef.current && isOpen) {
        const rect = buttonRef.current.getBoundingClientRect()
        const scrollTop = window.scrollY || document.documentElement.scrollTop

        // Calculate position to ensure dropdown is visible
        const rightEdge = rect.right
        const windowWidth = window.innerWidth

        // Position dropdown to the left if it would overflow right edge
        const left = rightEdge - 320 > 0 ? rightEdge - 320 : 10

        setDropdownStyles({
          top: rect.bottom + scrollTop,
          left: left,
          width: Math.min(320, windowWidth - 20),
        })
      }
    }

    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    updatePosition()
    document.addEventListener("mousedown", handleClickOutside)
    window.addEventListener("resize", updatePosition)
    window.addEventListener("scroll", updatePosition)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      window.removeEventListener("resize", updatePosition)
      window.removeEventListener("scroll", updatePosition)
    }
  }, [isOpen])

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification.id)
    }

    // If there's a link, navigate to it
    if (notification.link) {
      window.location.href = notification.link
    }

    setIsOpen(false)
  }

  const handleMarkAllAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await markAllAsRead()
  }

  // Get notification type color
  const getTypeColor = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "bg-green-500"
      case "warning":
        return "bg-yellow-500"
      case "error":
        return "bg-red-500"
      default:
        return "bg-blue-500"
    }
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        className="notifications-button p-2 rounded-full transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700 relative hover-scale focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        onClick={toggleDropdown}
        aria-label={t("notifications")}
        style={{ color: "var(--color-foreground)" }}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs text-white bg-red-500 rounded-full animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen &&
        mounted &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed rounded-md shadow-lg py-1 z-[9999]"
            style={{
              backgroundColor: "var(--color-card)",
              borderColor: "var(--color-border)",
              border: "1px solid var(--color-border)",
              top: `${dropdownStyles.top}px`,
              left: `${dropdownStyles.left}px`,
              width: `${dropdownStyles.width}px`,
              maxHeight: "80vh",
              overflowY: "auto",
            }}
          >
            <div
              className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center"
              style={{ borderColor: "var(--color-border)" }}
            >
              <h3 className="text-sm font-medium" style={{ color: "var(--color-foreground)" }}>
                {t("notifications")}
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs font-medium hover:underline transition-all duration-300"
                  style={{ color: "var(--color-primary)" }}
                >
                  {t("markAllAsRead")}
                </button>
              )}
            </div>

            {loading ? (
              <div className="px-4 py-8 text-center">
                <div className="inline-block w-6 h-6 border-2 border-t-transparent border-primary-500 rounded-full animate-spin"></div>
                <p className="mt-2 text-sm" style={{ color: "var(--color-mutedForeground)" }}>
                  {t("loadingNotifications")}
                </p>
              </div>
            ) : notifications.length > 0 ? (
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-800 transition-all duration-300 cursor-pointer ${
                      notification.read ? "" : "bg-primary-50 dark:bg-primary-900 bg-opacity-30"
                    }`}
                    style={{
                      borderColor: "var(--color-border)",
                      backgroundColor: notification.read
                        ? ""
                        : `color-mix(in srgb, var(--color-primary) 5%, var(--color-background))`,
                    }}
                  >
                    <div className="flex items-start">
                      <div
                        className={`w-2 h-2 rounded-full mt-1.5 mr-2 flex-shrink-0 ${getTypeColor(notification.type)}`}
                      ></div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <p className="text-sm font-medium" style={{ color: "var(--color-foreground)" }}>
                            {notification.title}
                          </p>
                          <span
                            className="text-xs whitespace-nowrap ml-2"
                            style={{ color: "var(--color-mutedForeground)" }}
                          >
                            {notification.createdAt && formatRelativeTime(notification.createdAt.toDate())}
                          </span>
                        </div>
                        <p className="text-xs mt-1" style={{ color: "var(--color-mutedForeground)" }}>
                          {notification.message}
                        </p>
                        {notification.link && (
                          <p className="text-xs mt-1 underline" style={{ color: "var(--color-primary)" }}>
                            {t("clickToView")}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-4 py-6 text-sm text-center" style={{ color: "var(--color-mutedForeground)" }}>
                <div className="flex flex-col items-center">
                  <Bell size={24} className="mb-2 opacity-40" />
                  <p>{t("noNotifications")}</p>
                  <p className="text-xs mt-1">{t("notificationsWillAppearHere")}</p>
                </div>
              </div>
            )}
          </div>,
          document.body,
        )}
    </div>
  )
}
