"use client"

import { useTranslations } from "next-intl"
import GoogleAd from "@/components/GoogleAd"

const SUPERMARKTEN = ["Albert Heijn", "Jumbo", "Dirk", "Aldi", "Ekoplaza", "Dekamarkt", "Spar"]

/** Flat-UI winkelwagentje dat over een track rijdt als laadanimatie. */
export default function WinkelwagenLader() {
  const t = useTranslations("lader")

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-10 px-4">
      {/* Tekst */}
      <div className="text-center space-y-1.5">
        <p className="font-display text-xl font-bold text-foreground">{t("ophalen")}</p>
        <p className="text-sm text-muted-foreground">
          {t("subtitel", { count: SUPERMARKTEN.length })}
        </p>
      </div>

      {/* Track + winkelwagentje */}
      <div className="relative w-72">
        {/* Spoorrail */}
        <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-primary track-vult" />
        </div>

        {/* Logo boven het spoor */}
        <div className="absolute wagen-container" style={{ top: "-76px" }}>
          <div className="wagen-stuitert">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-transparant.svg" alt="" aria-hidden style={{ height: "68px", width: "auto" }} />
          </div>
        </div>
      </div>

      {/* Supermarkt-pills — met werkende fade-in animatie */}
      <div className="flex gap-2.5 flex-wrap justify-center">
        {SUPERMARKTEN.map((sm, i) => (
          <span
            key={sm}
            className="pill-verschijnt text-xs text-muted-foreground px-3 py-1 rounded-full border border-border/70 bg-card shadow-sm"
            style={{ animationDelay: `${300 + i * 120}ms` }}
          >
            {sm}
          </span>
        ))}
      </div>

      {/* Google AdSense — alleen zichtbaar als NEXT_PUBLIC_ADSENSE_CLIENT ingesteld is */}
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
