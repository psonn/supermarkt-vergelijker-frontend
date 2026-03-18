"use client"

import { useState } from "react"
import { Flag, Check } from "lucide-react"
import { useTranslations } from "next-intl"

interface Props {
  productZoekterm: string
  productNaam: string
  supermarkt: string
}

export default function FeedbackKnop({ productZoekterm, productNaam, supermarkt }: Props) {
  const t = useTranslations("feedback")
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
      <span className="inline-flex items-center gap-0.5 text-[10px] text-success">
        <Check size={10} strokeWidth={2.5} />{t("meldBedankt")}
      </span>
    )
  }

  return (
    <span className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title={t("meldKnopLabel")}
        className="text-muted-foreground/60 hover:text-destructive transition-colors"
      >
        <Flag size={12} strokeWidth={2} />
      </button>

      {open && (
        <div className="absolute z-50 left-0 top-5 w-56 rounded-lg border bg-popover shadow-lg p-3 space-y-2 text-xs">
          <p className="font-medium text-foreground">{t("meldTitel")}</p>
          <p className="text-muted-foreground leading-snug">
            <span className="font-medium">{supermarkt}:</span> {productNaam}
          </p>
          <textarea
            value={bericht}
            onChange={(e) => setBericht(e.target.value)}
            placeholder={t("meldPlaceholder")}
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
              {bezig ? t("meldBezig") : t("melden")}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded px-2 py-1 text-muted-foreground hover:bg-muted"
            >
              {t("annuleer")}
            </button>
          </div>
        </div>
      )}
    </span>
  )
}
