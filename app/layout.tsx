import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import ClientAppWrapper from "@/components/client-app-wrapper"
import { LanguageProvider } from "@/lib/language-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "LAPAS Evaluator Tool",
  description:
    "A web application to evaluate and display the results in a systematic way with less input from clients.",
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LanguageProvider>
          <ClientAppWrapper>{children}</ClientAppWrapper>
        </LanguageProvider>
      </body>
    </html>
  )
}
