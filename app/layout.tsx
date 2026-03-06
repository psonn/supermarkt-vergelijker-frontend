import type { Metadata } from "next"
import { Syne, DM_Sans } from "next/font/google"
import "./globals.css"
import { getLocale } from "next-intl/server"

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
  metadataBase: new URL("https://www.aisupersaver.nl"),
  title: {
    default: "SupermarktVergelijker",
    template: "%s – SupermarktVergelijker",
  },
  description: "Vergelijk real-time prijzen bij AH, Jumbo, Dirk en meer. Vind de goedkoopste supermarkt bij jou in de buurt.",
  openGraph: {
    siteName: "SupermarktVergelijker",
    type: "website",
    locale: "nl_NL",
  },
  twitter: {
    card: "summary_large_image",
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale()

  return (
    <html lang={locale}>
      <body className={`${syne.variable} ${dmSans.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
