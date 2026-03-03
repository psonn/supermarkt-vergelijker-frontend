"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"

function LoginFormulier() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") ?? "/mijn-lijsten"

  const [tab, setTab] = useState<"login" | "registreer">("login")
  const [email, setEmail] = useState("")
  const [wachtwoord, setWachtwoord] = useState("")
  const [laden, setLaden] = useState(false)
  const [fout, setFout] = useState<string | null>(null)
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
        setFout("Onjuist e-mailadres of wachtwoord.")
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
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{tab === "login" ? "Inloggen" : "Account aanmaken"}</CardTitle>
          <CardDescription>
            {tab === "login"
              ? "Log in om lijsten op te slaan en te volgen."
              : "Maak een gratis account aan."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6">
            <Button
              variant={tab === "login" ? "default" : "outline"}
              size="sm"
              onClick={() => setTab("login")}
              className="flex-1"
            >
              Inloggen
            </Button>
            <Button
              variant={tab === "registreer" ? "default" : "outline"}
              size="sm"
              onClick={() => setTab("registreer")}
              className="flex-1"
            >
              Registreren
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mailadres</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={laden}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wachtwoord">Wachtwoord</Label>
              <Input
                id="wachtwoord"
                type="password"
                value={wachtwoord}
                onChange={(e) => setWachtwoord(e.target.value)}
                required
                disabled={laden}
                minLength={6}
              />
            </div>

            {fout && <p className="text-sm text-destructive">{fout}</p>}
            {bericht && <p className="text-sm text-green-600">{bericht}</p>}

            <Button type="submit" className="w-full" disabled={laden}>
              {laden ? "Bezig…" : tab === "login" ? "Inloggen" : "Account aanmaken"}
            </Button>
          </form>
        </CardContent>
      </Card>
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
