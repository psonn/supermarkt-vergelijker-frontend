"use client"

import { useEffect, useState } from "react"
import { useRouter, Link } from "@/lib/i18n-navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle, Check } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useTranslations, useLocale } from "next-intl"

function Sectie({
  titel,
  children,
}: {
  titel: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden">
      <div
        className="h-[3px]"
        style={{
          background:
            "linear-gradient(90deg, oklch(0.50 0.19 152), oklch(0.62 0.17 185), oklch(0.72 0.20 50))",
        }}
      />
      <div className="p-6">
        <h2 className="font-display font-bold text-base mb-5">{titel}</h2>
        {children}
      </div>
    </div>
  )
}

function Foutbox({ tekst }: { tekst: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-lg bg-destructive/8 border border-destructive/20 px-3.5 py-2.5 text-sm text-destructive">
      <AlertCircle size={14} className="mt-px shrink-0" />
      <span>{tekst}</span>
    </div>
  )
}

function Succesbox({ tekst }: { tekst: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-lg bg-emerald-50 border border-emerald-200 px-3.5 py-2.5 text-sm text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-800 dark:text-emerald-300">
      <Check size={14} className="mt-px shrink-0" strokeWidth={2.5} />
      <span>{tekst}</span>
    </div>
  )
}

export default function ProfielPagina() {
  const t = useTranslations("profiel")
  const locale = useLocale()
  const router = useRouter()

  const [huidigeEmail, setHuidigeEmail] = useState("")
  const [nieuweEmail, setNieuweEmail] = useState("")
  const [emailLaden, setEmailLaden] = useState(false)
  const [emailFout, setEmailFout] = useState<string | null>(null)
  const [emailSucces, setEmailSucces] = useState(false)

  const [wachtwoordNieuw, setWachtwoordNieuw] = useState("")
  const [wachtwoordBevestig, setWachtwoordBevestig] = useState("")
  const [wachtwoordLaden, setWachtwoordLaden] = useState(false)
  const [wachtwoordFout, setWachtwoordFout] = useState<string | null>(null)
  const [wachtwoordSucces, setWachtwoordSucces] = useState(false)

  const [verwijderBevestig, setVerwijderBevestig] = useState(false)
  const [verwijderLaden, setVerwijderLaden] = useState(false)
  const [verwijderFout, setVerwijderFout] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace("/login?redirect=/profiel" as never)
        return
      }
      setHuidigeEmail(data.user.email ?? "")
    })
  }, [router])

  async function handleEmailWijzigen(e: React.FormEvent) {
    e.preventDefault()
    setEmailFout(null)
    setEmailSucces(false)
    if (!nieuweEmail || nieuweEmail === huidigeEmail) return
    setEmailLaden(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ email: nieuweEmail })
    if (error) {
      setEmailFout(error.message)
    } else {
      setEmailSucces(true)
      setNieuweEmail("")
    }
    setEmailLaden(false)
  }

  async function handleWachtwoordWijzigen(e: React.FormEvent) {
    e.preventDefault()
    setWachtwoordFout(null)
    setWachtwoordSucces(false)
    if (wachtwoordNieuw.length < 6) {
      setWachtwoordFout(t("wachtwoordFoutKort"))
      return
    }
    if (wachtwoordNieuw !== wachtwoordBevestig) {
      setWachtwoordFout(t("wachtwoordFoutOngelijk"))
      return
    }
    setWachtwoordLaden(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: wachtwoordNieuw })
    if (error) {
      setWachtwoordFout(error.message)
    } else {
      setWachtwoordSucces(true)
      setWachtwoordNieuw("")
      setWachtwoordBevestig("")
    }
    setWachtwoordLaden(false)
  }

  async function handleVerwijderen() {
    if (!verwijderBevestig) {
      setVerwijderBevestig(true)
      return
    }
    setVerwijderFout(null)
    setVerwijderLaden(true)
    const resp = await fetch("/api/account", { method: "DELETE" })
    if (!resp.ok) {
      const data = await resp.json().catch(() => ({}))
      setVerwijderFout(data.error ?? t("verwijderFout"))
      setVerwijderLaden(false)
      setVerwijderBevestig(false)
      return
    }
    // Uitloggen en doorsturen naar home
    await createClient().auth.signOut()
    localStorage.setItem("sv_toast_pending", t("verwijderSucces"))
    window.location.href = locale === "en" ? "/en" : "/"
  }

  return (
    <main className="container max-w-2xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Link
          href="/mijn-lijsten"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          ← {t("terug")}
        </Link>
        <h1 className="text-2xl font-bold font-display mt-2">{t("titel")}</h1>
        {huidigeEmail && (
          <p className="text-sm text-muted-foreground mt-1">{huidigeEmail}</p>
        )}
      </div>

      <div className="space-y-5">
        {/* E-mail wijzigen */}
        <Sectie titel={t("emailSectie")}>
          <form onSubmit={handleEmailWijzigen} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="nieuw-email"
                className="block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground"
              >
                {t("emailNieuwLabel")}
              </label>
              <Input
                id="nieuw-email"
                type="email"
                value={nieuweEmail}
                onChange={(e) => setNieuweEmail(e.target.value)}
                required
                disabled={emailLaden}
                placeholder={huidigeEmail || t("emailPlaceholder")}
                className="h-10 bg-background"
                autoComplete="email"
              />
            </div>
            {emailFout && <Foutbox tekst={emailFout} />}
            {emailSucces && <Succesbox tekst={t("emailVerzonden")} />}
            <Button
              type="submit"
              variant="outline"
              className="font-semibold h-9 text-sm"
              disabled={emailLaden || !nieuweEmail || nieuweEmail === huidigeEmail}
            >
              {emailLaden ? t("bezig") : t("emailKnop")}
            </Button>
          </form>
        </Sectie>

        {/* Wachtwoord wijzigen */}
        <Sectie titel={t("wachtwoordSectie")}>
          <form onSubmit={handleWachtwoordWijzigen} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="wachtwoord-nieuw"
                className="block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground"
              >
                {t("wachtwoordNieuwLabel")}
              </label>
              <Input
                id="wachtwoord-nieuw"
                type="password"
                value={wachtwoordNieuw}
                onChange={(e) => setWachtwoordNieuw(e.target.value)}
                required
                disabled={wachtwoordLaden}
                placeholder="minimaal 6 tekens"
                className="h-10 bg-background"
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="wachtwoord-bevestig"
                className="block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground"
              >
                {t("wachtwoordBevestigLabel")}
              </label>
              <Input
                id="wachtwoord-bevestig"
                type="password"
                value={wachtwoordBevestig}
                onChange={(e) => setWachtwoordBevestig(e.target.value)}
                required
                disabled={wachtwoordLaden}
                placeholder="••••••••"
                className="h-10 bg-background"
                autoComplete="new-password"
              />
            </div>
            {wachtwoordFout && <Foutbox tekst={wachtwoordFout} />}
            {wachtwoordSucces && <Succesbox tekst={t("wachtwoordGewijzigd")} />}
            <Button
              type="submit"
              variant="outline"
              className="font-semibold h-9 text-sm"
              disabled={wachtwoordLaden || !wachtwoordNieuw || !wachtwoordBevestig}
            >
              {wachtwoordLaden ? t("bezig") : t("wachtwoordKnop")}
            </Button>
          </form>
        </Sectie>

        {/* Gevaarlijke zone */}
        <div className="bg-card rounded-2xl border border-destructive/30 shadow-sm overflow-hidden">
          <div className="h-[3px] bg-destructive/60" />
          <div className="p-6">
            <h2 className="font-display font-bold text-base mb-1 text-destructive">
              {t("gevarenzone")}
            </h2>
            <p className="text-sm text-muted-foreground mb-5">{t("verwijderTekst")}</p>
            {verwijderFout && <div className="mb-4"><Foutbox tekst={verwijderFout} /></div>}
            {verwijderBevestig ? (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-destructive">{t("verwijderBevestigVraag")}</p>
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    className="font-semibold h-9 text-sm"
                    onClick={handleVerwijderen}
                    disabled={verwijderLaden}
                  >
                    {verwijderLaden ? t("bezig") : t("verwijderBevestigKnop")}
                  </Button>
                  <Button
                    variant="outline"
                    className="font-semibold h-9 text-sm"
                    onClick={() => setVerwijderBevestig(false)}
                    disabled={verwijderLaden}
                  >
                    {t("annuleer")}
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                className="font-semibold h-9 text-sm border-destructive/40 text-destructive hover:bg-destructive/5 hover:text-destructive"
                onClick={handleVerwijderen}
              >
                {t("verwijderKnop")}
              </Button>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
