"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { signInWithCustomToken } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { LogIn, User, Lock } from "lucide-react"
import { auth, db } from "@/lib/firebase-config"
import { useLanguage } from "@/lib/language-context"

interface SignInProps {
  setUser: (user: any) => void
}

export default function SignIn({ setUser }: SignInProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { t } = useLanguage()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Check if Firebase is initialized
      if (!auth || !db) {
        throw new Error("Firebase is not initialized. Please refresh the page and try again.")
      }

      // Check internet connectivity
      if (!navigator.onLine) {
        throw new Error("No internet connection. Please check your network and try again.")
      }

      // Call the backend to validate and get a Firebase custom token
      try {
        const response = await fetch("https://signinuser-gjn3nhhwfa-uc.a.run.app", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        })

        // Check if the fetch request was successful
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `Server responded with status: ${response.status}`)
        }

        const data = await response.json()

        if (!data.token) {
          throw new Error("Authentication failed: No token received from server")
        }

        // Sign in using the custom token
        const userCredential = await signInWithCustomToken(auth, data.token)
        const user = userCredential.user

        // Fetch user role from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid))
        const userData = userDoc.exists() ? userDoc.data() : {}

        setUser({ uid: user.uid, email: user.email, role: userData.role })

        // Always redirect to landing page regardless of role
        router.push("/landing")
      } catch (fetchError: any) {
        console.error("Fetch error:", fetchError)

        // Handle specific fetch errors
        if (fetchError.message === "Failed to fetch") {
          throw new Error(
            "Unable to connect to authentication service. The service might be down or your network connection might be blocking the request.",
          )
        } else {
          throw fetchError
        }
      }
    } catch (err: any) {
      console.error("Sign-in error:", err)

      // Provide more specific error messages
      if (err.code === "auth/invalid-api-key") {
        setError("Firebase configuration error: Invalid API key. Please check your environment variables.")
      } else if (err.code?.includes("auth/")) {
        setError(`Authentication error: ${err.message}`)
      } else {
        setError(err.message || "Failed to sign in. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterRedirect = () => {
    router.push("/register")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">{t("signIn")}</h2>
        </div>
        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSignIn}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {t("email")}
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder={t("email")}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {t("password")}
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder={t("password")}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <LogIn className="h-5 w-5 text-blue-500 group-hover:text-blue-400" />
                </span>
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {t("signingIn")}
                  </div>
                ) : (
                  t("signIn")
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">{t("or")}</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleRegisterRedirect}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {t("register")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
