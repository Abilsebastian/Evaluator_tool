import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Footer from "@/components/footer"
import ClientAppWrapper from "@/components/client-app-wrapper"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "LAPAS Evaluation Tool",
  description:
    "A web application to evaluate and display the results in a systematic way with less input from clients.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col bg-gray-50`}>
        <ClientAppWrapper>
          {children}
          <Footer />
        </ClientAppWrapper>
      </body>
    </html>
  )
}
