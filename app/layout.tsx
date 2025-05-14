import type React from "react"
import type { Metadata } from "next"
import { Inter, Poppins } from "next/font/google"
import "./globals.css"
import ClientLayout from "./client-layout"

// Load fonts with explicit display strategy
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap", // Ensures text remains visible during font loading
})

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
})

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
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <head>
        {/* Cross-browser meta tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />

        {/* Preload fonts to avoid FOUT (Flash of Unstyled Text) */}
        <link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-background text-foreground font-sans">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
