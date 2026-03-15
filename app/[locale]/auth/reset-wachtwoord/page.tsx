"use client"

import { useState } from "react"
import { Link } from "@/lib/i18n-navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check, AlertCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useTranslations } from "next-intl"

export default function ResetWachtwoordPagina() {
  const t = useTranslations("resetWachtwoord")
  const [wachtwoord, setWachtwoord] = useState("")
  const [bevestig, setBevestig] = useState("")
  const [laden, setLaden] = useState(false)
  const [fout, setFout] = useState<string | null>(null)
  const [opgeslagen, setOpgeslagen] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFout(null)

    if (wachtwoord.length < 6) {
      setFout(t("foutKort"))
      return
    }
    if (wachtwoord !== bevestig) {
      setFout(t("foutOngelijk"))
      return
    }

    setLaden(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: wachtwoord })
    if (error) {
      setFout(error.message)
      setLaden(false)
    } else {
      document.cookie = "sv_recovery_pending=; max-age=0; path=/"
      setOpgeslagen(true)
      setTimeout(() => { window.location.href = "/" }, 2500)
    }
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 dot-grid" />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -right-40 w-[480px] h-[480px] rounded-full"
        style={{ background: "radial-gradient(circle, oklch(0.50 0.19 152 / 0.09), transparent 65%)" }}
      />

      <div className="w-full max-w-sm relative animate-fade-up">
        <div className="text-center mb-7">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="CheaperSupermarkets logo" className="h-10 w-auto group-hover:scale-105 transition-transform duration-200" />
            <span className="font-display font-bold text-lg tracking-tight">
              Cheaper<span className="text-primary">Supermarkets</span>
            </span>
          </Link>
        </div>

        <div className="bg-card rounded-2xl border border-border/60 shadow-2xl overflow-hidden">
          <div
            className="h-[3px]"
            style={{
              background:
                "linear-gradient(90deg, oklch(0.50 0.19 152), oklch(0.62 0.17 185), oklch(0.72 0.20 50))",
            }}
          />
          <div className="p-7 space-y-5">
            <div>
              <h1 className="font-display font-bold text-xl">{t("titel")}</h1>
              <p className="text-sm text-muted-foreground mt-1">{t("subtitel")}</p>
            </div>

            {opgeslagen ? (
              <div className="space-y-4">
                <div className="flex items-start gap-2.5 rounded-lg bg-emerald-50 border border-emerald-200 px-3.5 py-2.5 text-sm text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-800 dark:text-emerald-300">
                  <Check size={14} className="mt-px shrink-0" strokeWidth={2.5} />
                  <span>{t("opgeslagen")}</span>
                </div>
                <Link href="/">
                  <Button className="w-full font-semibold h-10 font-display tracking-wide">
                    {t("naarApp")}
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="wachtwoord" className="label-section">
                    {t("label")}
                  </label>
                  <Input
                    id="wachtwoord"
                    type="password"
                    value={wachtwoord}
                    onChange={(e) => setWachtwoord(e.target.value)}
                    required
                    disabled={laden}
                    placeholder={t("placeholder")}
                    className="h-10 bg-background"
                    autoComplete="new-password"
                    autoFocus
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="bevestig" className="label-section">
                    {t("bevestigLabel")}
                  </label>
                  <Input
                    id="bevestig"
                    type="password"
                    value={bevestig}
                    onChange={(e) => setBevestig(e.target.value)}
                    required
                    disabled={laden}
                    placeholder={t("placeholder")}
                    className="h-10 bg-background"
                    autoComplete="new-password"
                  />
                </div>

                {fout && (
                  <div className="flex items-start gap-2.5 rounded-lg bg-destructive/8 border border-destructive/20 px-3.5 py-2.5 text-sm text-destructive">
                    <AlertCircle size={14} className="mt-px shrink-0" />
                    <span>{fout}</span>
                  </div>
                )}

                <Button type="submit" className="w-full font-semibold h-10 font-display tracking-wide" disabled={laden}>
                  {laden ? t("bezig") : t("knop")}
                </Button>
              </form>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-5">
          <Link href="/login" className="hover:text-primary transition-colors hover:underline underline-offset-2">
            ← Login
          </Link>
        </p>
      </div>
    </main>
  )
}
