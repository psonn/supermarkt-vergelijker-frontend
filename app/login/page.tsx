"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"

function LoginFormulier() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") ?? "/mijn-lijsten"

  const [tab, setTab] = useState<"login" | "registreer">("login")
  const [email, setEmail] = useState("")
  const [wachtwoord, setWachtwoord] = useState("")
  const [laden, setLaden] = useState(false)
  const foutParam = searchParams.get("fout")
  const [fout, setFout] = useState<string | null>(
    foutParam === "bevestiging-mislukt"
      ? "De bevestigingslink is verlopen of ongeldig. Probeer opnieuw in te loggen of een nieuw account aan te maken."
      : null
  )
  const [bericht, setBericht] = useState<string | null>(null)

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
          setFout("Bevestig eerst je e-mailadres via de link die we je hebben gestuurd.")
        } else {
          setFout("Onjuist e-mailadres of wachtwoord.")
        }
      } else {
        router.push(redirect)
        router.refresh()
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
        setBericht("Controleer je e-mail om je account te bevestigen.")
      }
    }

    setLaden(false)
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
      {/* Achtergrond */}
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
        {/* Brand mark */}
        <div className="text-center mb-7">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground text-xl shadow-md group-hover:scale-105 transition-transform duration-200">
              🛒
            </div>
            <span className="font-display font-bold text-lg tracking-tight">
              Supermarkt<span className="text-primary">Vergelijker</span>
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-card rounded-2xl border border-border/60 shadow-2xl overflow-hidden">
          {/* Kleuraccent bovenaan */}
          <div
            className="h-[3px]"
            style={{
              background:
                "linear-gradient(90deg, oklch(0.50 0.19 152), oklch(0.62 0.17 185), oklch(0.72 0.20 50))",
            }}
          />

          <div className="p-7">
            {/* Underline tab-switcher */}
            <div className="flex border-b border-border mb-7">
              {(["login", "registreer"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => { setTab(t); setFout(null); setBericht(null) }}
                  className={`flex-1 pb-3 text-sm font-semibold transition-colors relative ${
                    tab === t ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t === "login" ? "Inloggen" : "Registreren"}
                  {tab === t && (
                    <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-primary rounded-full" />
                  )}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground"
                >
                  E-mailadres
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={laden}
                  placeholder="jij@voorbeeld.nl"
                  className="h-10 bg-background"
                  autoComplete="email"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="wachtwoord"
                  className="block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground"
                >
                  Wachtwoord
                </label>
                <Input
                  id="wachtwoord"
                  type="password"
                  value={wachtwoord}
                  onChange={(e) => setWachtwoord(e.target.value)}
                  required
                  disabled={laden}
                  minLength={6}
                  placeholder="••••••••"
                  className="h-10 bg-background"
                  autoComplete={tab === "login" ? "current-password" : "new-password"}
                />
              </div>

              {fout && (
                <div className="flex items-start gap-2.5 rounded-lg bg-destructive/8 border border-destructive/20 px-3.5 py-2.5 text-sm text-destructive">
                  <span className="mt-px shrink-0">⚠</span>
                  <span>{fout}</span>
                </div>
              )}

              {bericht && (
                <div className="flex items-start gap-2.5 rounded-lg bg-emerald-50 border border-emerald-200 px-3.5 py-2.5 text-sm text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-800 dark:text-emerald-300">
                  <span className="mt-px shrink-0">✓</span>
                  <span>{bericht}</span>
                </div>
              )}

              <Button
                type="submit"
                className="w-full font-semibold h-10 font-display tracking-wide mt-1"
                disabled={laden}
              >
                {laden
                  ? "Bezig…"
                  : tab === "login"
                  ? "Inloggen →"
                  : "Account aanmaken →"}
              </Button>
            </form>

            {tab === "registreer" && (
              <p className="text-xs text-muted-foreground text-center mt-5 leading-relaxed">
                Door te registreren ga je akkoord met onze{" "}
                <Link href="/algemene-voorwaarden" className="underline underline-offset-2 hover:text-foreground transition-colors">
                  algemene voorwaarden
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
            ← Terug naar de vergelijker
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
