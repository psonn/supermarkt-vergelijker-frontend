"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { startVergelijking } from "@/lib/api"

export default function BoodschappenlijstForm() {
  const router = useRouter()
  const [invoer, setInvoer] = useState("")
  const [locatie, setLocatie] = useState("")
  const [laden, setLaden] = useState(false)
  const [fout, setFout] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFout(null)

    const producten = invoer
      .split("\n")
      .map((r) => r.trim())
      .filter(Boolean)

    if (producten.length === 0) {
      setFout("Voer minimaal één product in.")
      return
    }

    setLaden(true)
    try {
      const job = await startVergelijking({
        producten,
        locatie: locatie.trim() || undefined,
      })
      router.push(`/resultaten/${job.job_id}`)
    } catch (err: unknown) {
      setFout(err instanceof Error ? err.message : "Er ging iets mis.")
      setLaden(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="producten">Boodschappenlijst</Label>
        <textarea
          id="producten"
          value={invoer}
          onChange={(e) => setInvoer(e.target.value)}
          placeholder={"melk\nbrood\neieren\nkaas"}
          rows={6}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
          disabled={laden}
        />
        <p className="text-xs text-muted-foreground">Één product per regel</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="locatie">Locatie <span className="text-muted-foreground">(optioneel)</span></Label>
        <Input
          id="locatie"
          value={locatie}
          onChange={(e) => setLocatie(e.target.value)}
          placeholder="Kalverstraat 1, Amsterdam"
          disabled={laden}
        />
        <p className="text-xs text-muted-foreground">
          Geef een adres op voor supermarkten in de buurt
        </p>
      </div>

      {fout && (
        <p className="text-sm text-destructive">{fout}</p>
      )}

      <Button type="submit" disabled={laden} className="w-full">
        {laden ? "Vergelijking starten…" : "Vergelijk prijzen"}
      </Button>
    </form>
  )
}
