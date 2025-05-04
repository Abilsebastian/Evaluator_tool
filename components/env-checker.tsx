"use client"

import { useEffect, useState } from "react"

export default function EnvChecker() {
  const [envStatus, setEnvStatus] = useState<Record<string, boolean>>({})

  useEffect(() => {
    // Check which environment variables are defined
    const envVars = {
      NEXT_PUBLIC_FIREBASE_API_KEY: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      NEXT_PUBLIC_FIREBASE_APP_ID: !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: !!process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    }

    setEnvStatus(envVars)
  }, [])

  return (
    <div className="p-4 bg-white rounded-lg shadow-md max-w-md mx-auto my-8">
      <h2 className="text-lg font-semibold mb-4">Environment Variables Status</h2>
      <ul className="space-y-2">
        {Object.entries(envStatus).map(([key, exists]) => (
          <li key={key} className="flex items-center justify-between">
            <span className="font-mono text-sm">{key}</span>
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${exists ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
            >
              {exists ? "Available" : "Missing"}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm text-gray-600">
        Note: This only checks if the variables are defined, not if they contain valid values.
      </p>
    </div>
  )
}
