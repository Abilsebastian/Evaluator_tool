"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  type Timestamp,
  limit,
} from "firebase/firestore"
import { getFirebaseDb } from "@/lib/firebase-config"
import { useAuth } from "@/lib/auth-context"

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  link?: string
  read: boolean
  createdAt: Timestamp
  type: "info" | "success" | "warning" | "error"
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (notificationId: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  loading: boolean
  error: string | null
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  loading: true,
  error: null,
})

export const useNotifications = () => useContext(NotificationContext)

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      setNotifications([])
      setLoading(false)
      return
    }

    setLoading(true)

    try {
      const db = getFirebaseDb()
      if (!db) {
        setError("Database not initialized")
        setLoading(false)
        return
      }

      // Create a query against the collection
      const notificationsRef = collection(db, "notifications")
      const q = query(
        notificationsRef,
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc"),
        limit(50), // Limit to the 50 most recent notifications
      )

      // Set up real-time listener
      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const notificationsList: Notification[] = []
          querySnapshot.forEach((doc) => {
            notificationsList.push({ id: doc.id, ...doc.data() } as Notification)
          })
          setNotifications(notificationsList)
          setLoading(false)
          setError(null)
        },
        (err) => {
          console.error("Error fetching notifications:", err)
          setError("Failed to load notifications")
          setLoading(false)
        },
      )

      // Clean up listener on unmount
      return () => unsubscribe()
    } catch (err) {
      console.error("Error setting up notifications listener:", err)
      setError("Failed to set up notifications")
      setLoading(false)
    }
  }, [user])

  const markAsRead = async (notificationId: string) => {
    try {
      const db = getFirebaseDb()
      if (!db) throw new Error("Database not initialized")

      const notificationRef = doc(db, "notifications", notificationId)
      await updateDoc(notificationRef, {
        read: true,
      })
    } catch (err) {
      console.error("Error marking notification as read:", err)
      setError("Failed to update notification")
    }
  }

  const markAllAsRead = async () => {
    try {
      const db = getFirebaseDb()
      if (!db) throw new Error("Database not initialized")

      // Update all unread notifications for this user
      const promises = notifications
        .filter((notification) => !notification.read)
        .map((notification) => {
          const notificationRef = doc(db, "notifications", notification.id)
          return updateDoc(notificationRef, { read: true })
        })

      await Promise.all(promises)
    } catch (err) {
      console.error("Error marking all notifications as read:", err)
      setError("Failed to update notifications")
    }
  }

  const unreadCount = notifications.filter((notification) => !notification.read).length

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        loading,
        error,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}
