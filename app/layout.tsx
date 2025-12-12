import type React from "react"
import type { Metadata, Viewport } from "next"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

export const metadata: Metadata = {
  title: "WOD Maker - Sports Utility App",
  description:
    "Complete sports utility app with stopwatch, tabata timer, strength training, and workout program builder",
  generator: "v0.app",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "WOD Maker",
  },
  icons: {
    icon: [
      {
        url: "/icon-192x192.jpg",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/icon-512x512.jpg",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: "/apple-touch-icon.jpg",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0a0a0a",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
