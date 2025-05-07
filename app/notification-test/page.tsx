"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { createNotification } from "@/lib/notification-service"
import { useLanguage } from "@/lib/language-context"

export default function NotificationTestPage() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [type, setType] = useState<"info" | "success" | "warning" | "error">("info")
  const [link, setLink] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      setResult({
        success: false,
        message: "You must be logged in to create notifications",
      })
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await createNotification({
        userId: user.uid,
        title,
        message,
        type,
        link: link || undefined,
      })

      if (response.success) {
        setResult({
          success: true,
          message: "Notification created successfully!",
        })
        // Clear form
        setTitle("")
        setMessage("")
        setLink("")
        setType("info")
      } else {
        setResult({
          success: false,
          message: "Failed to create notification",
        })
      }
    } catch (error) {
      console.error("Error creating notification:", error)
      setResult({
        success: false,
        message: "An error occurred while creating the notification",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 mt-16">
        <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-4">Notification Test</h1>
          <p className="text-red-500">You must be logged in to use this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">Create Test Notification</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Use this form to create a test notification for your account.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Message
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              rows={3}
              required
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Type
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>

          <div>
            <label htmlFor="link" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Link (optional)
            </label>
            <input
              type="text"
              id="link"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="e.g., /help"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Notification"}
          </button>
        </form>

        {result && (
          <div
            className={`mt-4 p-3 rounded-md ${
              result.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {result.message}
          </div>
        )}
      </div>
    </div>
  )
}
