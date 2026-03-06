import { NextIntlClientProvider } from "next-intl"
import { getMessages } from "next-intl/server"
import { Analytics } from "@vercel/analytics/next"
import Nav from "@/components/Nav"
import Footer from "@/components/Footer"
import GlobalToast from "@/components/GlobalToast"

export default async function LocaleLayout({ children }: { children: React.ReactNode }) {
  const messages = await getMessages()

  return (
    <NextIntlClientProvider messages={messages}>
      <div className="flex flex-col min-h-screen">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
        <GlobalToast />
        <Analytics />
      </div>
    </NextIntlClientProvider>
  )
}
