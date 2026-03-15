"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import GoogleAd from "@/components/GoogleAd"

const ALLE_SUPERMARKTEN = ["Albert Heijn", "Jumbo", "Dirk", "Aldi", "Ekoplaza", "Dekamarkt", "Spar"]

const LOGO: Record<string, string> = {
  "Albert Heijn": "/logos/ah.png",
  "Jumbo":        "/logos/jumbo.png",
  "Dirk":         "/logos/dirk.png",
  "Aldi":         "/logos/aldi.png",
  "Ekoplaza":     "/logos/ekoplaza.png",
  "Dekamarkt":    "/logos/dekamarkt.png",
  "Spar":         "/logos/spar.png",
  "Vomar":        "/logos/vomar.png",
}

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

      {/* Supermarkt-logo's */}
      <div className="flex gap-3 flex-wrap justify-center">
        {supermarkten.map((sm, i) => (
          <span
            key={sm}
            className="pill-verschijnt flex items-center justify-center rounded-xl border border-border/70 bg-card shadow-sm p-2"
            style={{ animationDelay: `${300 + i * 120}ms` }}
          >
            {LOGO[sm] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={LOGO[sm]} alt={sm} title={sm} width={40} height={40} style={{ objectFit: "contain", height: "32px", width: "auto" }} />
            ) : (
              <span className="text-xs text-muted-foreground px-1">{sm}</span>
            )}
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
