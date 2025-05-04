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
    // Initialize Firebase
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp()

    // Initialize Firebase services
    auth = getAuth(app)
    db = getFirestore(app)

    console.log("Firebase initialized successfully")
  } catch (error) {
    console.error("Firebase initialization error:", error)
  }
}

export { app, auth, db }

export const getFirebaseAuth = () => auth
export const getFirebaseDb = () => db
