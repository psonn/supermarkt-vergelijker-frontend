"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

export default function FeedbackPagina() {
  const [bericht, setBericht] = useState("")
  const [bezig, setBezig] = useState(false)
  const [verstuurd, setVerstuurd] = useState(false)
  const [fout, setFout] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!bericht.trim()) return
    setBezig(true)
    setFout(null)
    try {
      const resp = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "app", bericht: bericht.trim() }),
      })
      if (!resp.ok) throw new Error()
      setVerstuurd(true)
    } catch {
      setFout("Er ging iets mis. Probeer het opnieuw.")
    }
    setBezig(false)
  }

  return (
    <main className="container max-w-lg mx-auto px-4 py-16">
      <h1 className="font-display text-2xl font-bold mb-2">Feedback</h1>
      <p className="text-muted-foreground mb-8">
        Heb je een fout gevonden, een suggestie, of iets anders? Laat het ons weten.
      </p>

      {verstuurd ? (
        <div className="succesbox">
          <Check size={18} className="shrink-0" strokeWidth={2.5} />
          <p className="text-sm font-medium">Bedankt voor je feedback! We nemen het mee.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={bericht}
            onChange={(e) => setBericht(e.target.value)}
            placeholder="Beschrijf je feedback..."
            rows={5}
            disabled={bezig}
            className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {fout && <p className="text-sm text-destructive">{fout}</p>}
          <Button type="submit" disabled={bezig || !bericht.trim()} className="w-full">
            {bezig ? "Versturen…" : "Verstuur feedback"}
          </Button>
        </form>
      )}
    </main>
  )
}
