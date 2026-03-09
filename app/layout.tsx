import type { Metadata } from "next"
import { Syne, DM_Sans } from "next/font/google"
import Script from "next/script"
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
  metadataBase: new URL("https://www.cheapersupermarkets.com"),
  title: {
    default: "CheaperSupermarkets",
    template: "%s – CheaperSupermarkets",
  },
  description: "Vergelijk real-time prijzen bij AH, Jumbo, Dirk en meer. Vind de goedkoopste supermarkt bij jou in de buurt.",
  openGraph: {
    siteName: "CheaperSupermarkets",
    type: "website",
    locale: "nl_NL",
  },
  twitter: {
    card: "summary_large_image",
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale()

  const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT

  return (
    <html lang={locale}>
      <body className={`${syne.variable} ${dmSans.variable} font-sans antialiased`}>
        {adsenseClient && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
            crossOrigin="anonymous"
            strategy="lazyOnload"
          />
        )}
        {children}
      </body>
    </html>
  )
}
