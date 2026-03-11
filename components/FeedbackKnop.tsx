"use client"

import { useState } from "react"
import { Flag, Check } from "lucide-react"

interface Props {
  productZoekterm: string
  productNaam: string
  supermarkt: string
}

export default function FeedbackKnop({ productZoekterm, productNaam, supermarkt }: Props) {
  const [open, setOpen] = useState(false)
  const [bericht, setBericht] = useState("")
  const [bezig, setBezig] = useState(false)
  const [verstuurd, setVerstuurd] = useState(false)

  async function verstuur() {
    setBezig(true)
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "match",
          product_zoekterm: productZoekterm,
          product_naam: productNaam,
          supermarkt,
          bericht: bericht.trim() || undefined,
        }),
      })
      setVerstuurd(true)
      setOpen(false)
    } catch {
      // stil falen
    }
    setBezig(false)
  }

  if (verstuurd) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600">
        <Check size={10} strokeWidth={2.5} />bedankt
      </span>
    )
  }

  return (
    <span className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title="Verkeerd product melden"
        className="text-muted-foreground/40 hover:text-muted-foreground transition-colors"
      >
        <Flag size={11} strokeWidth={2} />
      </button>

      {open && (
        <div className="absolute z-50 left-0 top-5 w-56 rounded-lg border bg-popover shadow-lg p-3 space-y-2 text-xs">
          <p className="font-medium text-foreground">Verkeerd product?</p>
          <p className="text-muted-foreground leading-snug">
            <span className="font-medium">{supermarkt}:</span> {productNaam}
          </p>
          <textarea
            value={bericht}
            onChange={(e) => setBericht(e.target.value)}
            placeholder="Optioneel: wat klopt er niet?"
            rows={2}
            className="w-full rounded border border-input bg-background px-2 py-1.5 text-xs resize-none focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={verstuur}
              disabled={bezig}
              className="flex-1 rounded bg-primary text-primary-foreground px-2 py-1 font-medium hover:opacity-90 disabled:opacity-50"
            >
              {bezig ? "…" : "Melden"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded px-2 py-1 text-muted-foreground hover:bg-muted"
            >
              Annuleer
            </button>
          </div>
        </div>
      )}
    </span>
  )
}
