"use client"

import { Suspense, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Link } from "@/lib/i18n-navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle, Check } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useTranslations } from "next-intl"

function LoginFormulier() {
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") ?? "/mijn-lijsten"
  const t = useTranslations("login")

  const [tab, setTab] = useState<"login" | "registreer">("login")
  const [resetModus, setResetModus] = useState(false)
  const [email, setEmail] = useState("")
  const [wachtwoord, setWachtwoord] = useState("")
  const [laden, setLaden] = useState(false)
  const foutParam = searchParams.get("fout")
  const [fout, setFout] = useState<string | null>(
    foutParam === "bevestiging-mislukt" ? t("foutBevestigingMislukt") : null
  )
  const [bericht, setBericht] = useState<string | null>(null)

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setFout(null)
    setBericht(null)
    setLaden(true)
    const supabase = createClient()
    const redirectTo = `${window.location.origin}/auth/callback?next=/auth/reset-wachtwoord`
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
    if (error) {
      setFout(error.message)
    } else {
      setBericht(t("resetVerzonden"))
    }
    setLaden(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFout(null)
    setBericht(null)
    setLaden(true)

    const supabase = createClient()

    if (tab === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password: wachtwoord })
      if (error) {
        if (error.message.toLowerCase().includes("email not confirmed")) {
          setFout(t("foutNietBevestigd"))
        } else {
          setFout(t("foutOnjuist"))
        }
      } else {
        localStorage.setItem("sv_toast_pending", t("toastIngelogd"))
        window.location.href = redirect
        return
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password: wachtwoord,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      })
      if (error) {
        setFout(error.message)
      } else {
        setBericht(t("bevestigEmail"))
      }
    }

    setLaden(false)
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 dot-grid" />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -right-40 w-[480px] h-[480px] rounded-full"
        style={{ background: "radial-gradient(circle, oklch(0.50 0.19 152 / 0.09), transparent 65%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -left-20 w-[360px] h-[360px] rounded-full"
        style={{ background: "radial-gradient(circle, oklch(0.62 0.17 200 / 0.06), transparent 65%)" }}
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

          <div className="p-7">
            {!resetModus && (
              <div className="flex border-b border-border mb-7">
                {(["login", "registreer"] as const).map((t_tab) => (
                  <button
                    key={t_tab}
                    type="button"
                    onClick={() => { setTab(t_tab); setFout(null); setBericht(null) }}
                    className={`flex-1 pb-3 text-sm font-semibold transition-colors relative ${
                      tab === t_tab ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t_tab === "login" ? t("inloggen") : t("registreren")}
                    {tab === t_tab && (
                      <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-primary rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {resetModus ? (
              <form onSubmit={handleReset} className="space-y-4">
                <p className="text-sm text-muted-foreground">{t("resetSubtitel")}</p>
                <div className="space-y-1.5">
                  <label htmlFor="email-reset" className="label-section">
                    {t("emailLabel")}
                  </label>
                  <Input
                    id="email-reset"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={laden}
                    placeholder={t("emailPlaceholder")}
                    className="h-10 bg-background"
                    autoComplete="email"
                    autoFocus
                  />
                </div>
                {fout && (
                  <div className="flex items-start gap-2.5 rounded-lg bg-destructive/8 border border-destructive/20 px-3.5 py-2.5 text-sm text-destructive">
                    <AlertCircle size={14} className="mt-px shrink-0" />
                    <span>{fout}</span>
                  </div>
                )}
                {bericht && (
                  <div className="flex items-start gap-2.5 rounded-lg bg-emerald-50 border border-emerald-200 px-3.5 py-2.5 text-sm text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-800 dark:text-emerald-300">
                    <Check size={14} className="mt-px shrink-0" strokeWidth={2.5} />
                    <span>{bericht}</span>
                  </div>
                )}
                <Button type="submit" className="w-full font-semibold h-10 font-display tracking-wide" disabled={laden || !!bericht}>
                  {laden ? t("bezig") : t("resetKnop")}
                </Button>
                <button type="button" onClick={() => { setResetModus(false); setFout(null); setBericht(null) }} className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors text-center mt-1">
                  {t("terugNaarInloggen")}
                </button>
              </form>
            ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="label-section"
                >
                  {t("emailLabel")}
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={laden}
                  placeholder={t("emailPlaceholder")}
                  className="h-10 bg-background"
                  autoComplete="email"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="wachtwoord"
                  className="label-section"
                >
                  {t("wachtwoordLabel")}
                </label>
                <Input
                  id="wachtwoord"
                  type="password"
                  value={wachtwoord}
                  onChange={(e) => setWachtwoord(e.target.value)}
                  required
                  disabled={laden}
                  minLength={6}
                  placeholder={t("wachtwoordPlaceholder")}
                  className="h-10 bg-background"
                  autoComplete={tab === "login" ? "current-password" : "new-password"}
                />
              </div>

              {tab === "login" && (
                <div className="flex justify-end">
                  <button type="button" onClick={() => { setResetModus(true); setFout(null); setBericht(null) }} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                    {t("wachtwoordVergeten")}
                  </button>
                </div>
              )}

              {fout && (
                <div className="flex items-start gap-2.5 rounded-lg bg-destructive/8 border border-destructive/20 px-3.5 py-2.5 text-sm text-destructive">
                  <AlertCircle size={14} className="mt-px shrink-0" />
                  <span>{fout}</span>
                </div>
              )}

              {bericht && (
                <div className="flex items-start gap-2.5 rounded-lg bg-emerald-50 border border-emerald-200 px-3.5 py-2.5 text-sm text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-800 dark:text-emerald-300">
                  <Check size={14} className="mt-px shrink-0" strokeWidth={2.5} />
                  <span>{bericht}</span>
                </div>
              )}

              <Button
                type="submit"
                className="w-full font-semibold h-10 font-display tracking-wide mt-1"
                disabled={laden}
              >
                {laden ? t("bezig") : tab === "login" ? t("inloggenKnop") : t("registrerenKnop")}
              </Button>
            </form>
            )}

            {!resetModus && tab === "registreer" && (
              <p className="text-xs text-muted-foreground text-center mt-5 leading-relaxed">
                {t("voorwaardenTekst")}{" "}
                <Link href="/algemene-voorwaarden" className="underline underline-offset-2 hover:text-foreground transition-colors">
                  {t("voorwaardenLink")}
                </Link>
                .
              </p>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-5">
          <Link
            href="/"
            className="hover:text-primary transition-colors hover:underline underline-offset-2"
          >
            {t("terug")}
          </Link>
        </p>
      </div>
    </main>
  )
}

export default function LoginPagina() {
  return (
    <Suspense>
      <LoginFormulier />
    </Suspense>
  )
}
