import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import ClientLayout from "./client-layout"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "Project Evaluator",
  description: "A web application to evaluate projects in a systematic way with less input from clients.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-background text-foreground">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
