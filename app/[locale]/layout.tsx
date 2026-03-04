import { NextIntlClientProvider } from "next-intl"
import { getMessages } from "next-intl/server"
import Nav from "@/components/Nav"
import Footer from "@/components/Footer"

export default async function LocaleLayout({ children }: { children: React.ReactNode }) {
  const messages = await getMessages()

  return (
    <NextIntlClientProvider messages={messages}>
      <div className="flex flex-col min-h-screen">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </NextIntlClientProvider>
  )
}
