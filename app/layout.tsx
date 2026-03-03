import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"
import Nav from "@/components/Nav"

const geist = Geist({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Supermarkt Vergelijker",
  description: "Vergelijk real-time supermarktprijzen in Nederland.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body className={`${geist.className} antialiased`}>
        <Nav />
        {children}
      </body>
    </html>
  )
}
