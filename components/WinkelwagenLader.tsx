"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import GoogleAd from "@/components/GoogleAd"

const ALLE_SUPERMARKTEN = ["Albert Heijn", "Jumbo", "Dirk", "Aldi", "Ekoplaza", "Dekamarkt", "Spar"]

/** Logo rijdt over een track als laadanimatie. */
export default function WinkelwagenLader() {
  const t = useTranslations("lader")
  const [supermarkten, setSupermarkten] = useState<string[]>(ALLE_SUPERMARKTEN)

  useEffect(() => {
    try {
      const opgeslagen = sessionStorage.getItem("sv_supermarkten")
      if (opgeslagen) {
        const parsed = JSON.parse(opgeslagen) as string[]
        if (Array.isArray(parsed) && parsed.length > 0) setSupermarkten(parsed)
      }
    } catch { /* negeer */ }
  }, [])

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-24 px-4">
      {/* Tekst */}
      <div className="text-center space-y-1.5">
        <p className="font-display text-xl font-bold text-foreground">{t("ophalen")}</p>
        <p className="text-sm text-muted-foreground">
          {t("subtitel", { count: supermarkten.length })}
        </p>
      </div>

      {/* Track + logo */}
      <div className="relative w-72">
        {/* Spoorrail */}
        <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-primary track-vult" />
        </div>

        {/* Logo boven het spoor */}
        <div className="absolute wagen-container" style={{ top: "-76px" }}>
          <div className="wagen-stuitert">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-transparant.png"
              alt=""
              aria-hidden
              style={{ height: "68px", width: "80px", objectFit: "contain", imageRendering: "auto" }}
            />
          </div>
        </div>
      </div>

      {/* Supermarkt-pills */}
      <div className="flex gap-2.5 flex-wrap justify-center">
        {supermarkten.map((sm, i) => (
          <span
            key={sm}
            className="pill-verschijnt text-xs text-muted-foreground px-3 py-1 rounded-full border border-border/70 bg-card shadow-sm"
            style={{ animationDelay: `${300 + i * 120}ms` }}
          >
            {sm}
          </span>
        ))}
      </div>

      {/* Google AdSense */}
      {process.env.NEXT_PUBLIC_ADSENSE_SLOT_LADER && (
        <div className="w-full max-w-lg mx-auto mt-2">
          <GoogleAd
            slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_LADER}
            format="horizontal"
            className="min-h-[90px]"
          />
        </div>
      )}
    </div>
  )
}
