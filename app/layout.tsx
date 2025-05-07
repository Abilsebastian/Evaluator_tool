import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter, Poppins } from "next/font/google"
import ClientAppWrapper from "@/components/client-app-wrapper"

// Load Inter font
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

// Load Poppins font
const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
})

export const metadata: Metadata = {
  title: "LAPAS Evaluator Tool",
  description:
    "A web application to evaluate and display the results in a systematic way with less input from clients.",
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${poppins.variable}`}>
      <body className={inter.className}>
        <ClientAppWrapper>{children}</ClientAppWrapper>
      </body>
    </html>
  )
}
