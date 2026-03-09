"use client"

import { useEffect, useState } from "react"
import { Link, useRouter, usePathname } from "@/lib/i18n-navigation"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useTranslations, useLocale } from "next-intl"

export default function Nav() {
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale()
  const t = useTranslations("nav")
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    try {
      const supabase = createClient()
      supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null))
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_, session) => {
        setEmail(session?.user?.email ?? null)
      })
      return () => subscription.unsubscribe()
    } catch {
      // Supabase niet geconfigureerd
    }
  }, [])

  async function uitloggen() {
    await createClient().auth.signOut()
    localStorage.setItem("sv_toast_pending", t("toastUitgelogd"))
    window.location.href = locale === "en" ? "/en" : "/"
  }

  function schakelTaal() {
    const nieuweLang = locale === "nl" ? "en" : "nl"
    router.replace(pathname, { locale: nieuweLang })
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-background/90 backdrop-blur-md">
      <div className="container max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="CheaperSupermarkets logo" className="h-8 w-auto group-hover:scale-105 transition-transform duration-200" />
          <span className="hidden sm:inline font-display font-bold text-[15px] tracking-tight">
            Cheaper<span className="text-primary">Supermarkets</span>
          </span>
          <span className="hidden sm:inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 tracking-wide">
            {t("beta")}
          </span>
        </Link>

        <nav className="flex items-center gap-1.5">
          {/* Taalschakelaar */}
          <button
            onClick={schakelTaal}
            className="text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted tracking-widest uppercase"
            title={t("taalLabel")}
          >
            {locale === "nl" ? "EN" : "NL"}
          </button>

          {email ? (
            <>
              <Link href="/mijn-lijsten">
                <Button variant="ghost" size="sm" className="text-sm font-medium">
                  <span className="hidden sm:inline">{t("lijsten")}</span>
                  <span className="sm:hidden">{t("lijstenKort")}</span>
                </Button>
              </Link>
              <Link href="/profiel">
                <Button variant="ghost" size="sm" className="text-sm font-medium">
                  <span className="hidden sm:inline">{t("profiel")}</span>
                  <span className="sm:hidden">{t("profielKort")}</span>
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={uitloggen}
                className="text-sm font-medium border-border/60"
              >
                <span className="hidden sm:inline">{t("uitloggen")}</span>
                <span className="sm:hidden">{t("uitloggenKort")}</span>
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button size="sm" variant="outline" className="text-sm font-medium border-border/60">
                {t("inloggen")}
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
