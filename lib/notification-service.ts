import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { getFirebaseDb } from "@/lib/firebase-config"

interface CreateNotificationParams {
  userId: string
  title: string
  message: string
  link?: string
  type?: "info" | "success" | "warning" | "error"
}

export const createNotification = async ({ userId, title, message, link, type = "info" }: CreateNotificationParams) => {
  try {
    const db = getFirebaseDb()
    if (!db) throw new Error("Database not initialized")

    const notificationsRef = collection(db, "notifications")

    await addDoc(notificationsRef, {
      userId,
      title,
      message,
      link,
      type,
      read: false,
      createdAt: serverTimestamp(),
    })

    return { success: true }
  } catch (error) {
    console.error("Error creating notification:", error)
    return { success: false, error }
  }
}

export const createBulkNotifications = async (notifications: CreateNotificationParams[]) => {
  try {
    const db = getFirebaseDb()
    if (!db) throw new Error("Database not initialized")

    const notificationsRef = collection(db, "notifications")

    const promises = notifications.map((notification) =>
      addDoc(notificationsRef, {
        ...notification,
        read: false,
        createdAt: serverTimestamp(),
      }),
    )

    await Promise.all(promises)

    return { success: true }
  } catch (error) {
    console.error("Error creating bulk notifications:", error)
    return { success: false, error }
  }
}
