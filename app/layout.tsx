import type { Metadata } from "next"
import { Syne, DM_Sans } from "next/font/google"
import "./globals.css"
import Nav from "@/components/Nav"

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Supermarkt Vergelijker",
  description: "Vergelijk real-time supermarktprijzen in Nederland.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body className={`${syne.variable} ${dmSans.variable} font-sans antialiased`}>
        <Nav />
        {children}
      </body>
    </html>
  )
}
