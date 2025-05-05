// This file should NOT have "use client" directive as it's just configuration

import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// Initialize Firebase
let app
let auth
let db

// We need to make sure this code only runs on the client side
if (typeof window !== "undefined") {
  try {
    // Check if all required environment variables are present
    const requiredEnvVars = [
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    ]

    if (requiredEnvVars.some((env) => !env)) {
      console.error("Missing required Firebase environment variables")
    } else {
      // Initialize Firebase
      app = !getApps().length ? initializeApp(firebaseConfig) : getApp()

      // Initialize Firebase services
      auth = getAuth(app)
      db = getFirestore(app)

      console.log("Firebase initialized successfully")
    }
  } catch (error) {
    console.error("Firebase initialization error:", error)
  }
}

export { app, auth, db }

export const getFirebaseAuth = () => {
  if (!auth && typeof window !== "undefined") {
    try {
      app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
      auth = getAuth(app)
    } catch (error) {
      console.error("Error initializing Firebase auth:", error)
    }
  }
  return auth
}

export const getFirebaseDb = () => {
  if (!db && typeof window !== "undefined") {
    try {
      app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
      db = getFirestore(app)
    } catch (error) {
      console.error("Error initializing Firebase db:", error)
    }
  }
  return db
}
