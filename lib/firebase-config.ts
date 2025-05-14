"\"use client"

import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// Only initialize Firebase on the client side
let firebaseApp
let firebaseAuth
let firebaseDb

// Initialize Firebase lazily
function initializeFirebase() {
  if (typeof window === "undefined") return { app: null, auth: null, db: null }

  if (!firebaseApp) {
    try {
      // Initialize or get the Firebase app
      firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp()

      // Only initialize auth and db after app is initialized
      firebaseAuth = getAuth(firebaseApp)
      firebaseDb = getFirestore(firebaseApp)
    } catch (error) {
      console.error("Error initializing Firebase:", error)
      return { app: null, auth: null, db: null }
    }
  }

  return { app: firebaseApp, auth: firebaseAuth, db: firebaseDb }
}

// Export functions to get Firebase services
export function getFirebaseApp() {
  const { app } = initializeFirebase()
  return app
}

export function getFirebaseAuth() {
  const { auth } = initializeFirebase()
  return auth
}

export function getFirebaseDb() {
  const { db } = initializeFirebase()
  return db
}

export const db = getFirebaseDb()
export const auth = getFirebaseAuth()
