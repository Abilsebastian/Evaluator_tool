import type { Notification } from "./notification-context"

// Mock notifications for testing
const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "Welcome",
    message: "Welcome to the LAPAS Evaluation Tool",
    type: "info",
    timestamp: new Date(),
    read: false,
  },
  {
    id: "2",
    title: "New Project",
    message: "You have been assigned to a new project",
    type: "success",
    timestamp: new Date(Date.now() - 3600000), // 1 hour ago
    read: true,
  },
]

// Mock function to get notifications
export function getNotifications(): Notification[] {
  return [...mockNotifications]
}

// Mock function to subscribe to notifications
export function onNotificationsChange(callback: (notifications: Notification[]) => void) {
  // Initially call with mock data
  callback(getNotifications())

  // Return unsubscribe function
  return () => {
    // Cleanup logic would go here in a real implementation
  }
}

// Mock function to add a notification
export function addNotification(notification: Omit<Notification, "id" | "timestamp" | "read">) {
  const newNotification: Notification = {
    ...notification,
    id: Math.random().toString(36).substring(2, 9),
    timestamp: new Date(),
    read: false,
  }

  mockNotifications.push(newNotification)
  return newNotification
}

export const createNotification = async (notificationData: any) => {
  // In a real implementation, this function would interact with a backend service
  // to persist the notification data.
  console.log("Creating notification:", notificationData)

  // Simulate success
  return { success: true }
}
