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

        {/* Wagentje boven het spoor */}
        <div className="absolute wagen-container" style={{ top: "-38px" }}>
          <div className="wagen-stuitert text-primary">
            <WinkelwagenSVG />
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

function WinkelwagenSVG() {
  return (
    <svg
      width="56"
      height="44"
      viewBox="0 0 56 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {/* Stang */}
      <path
        d="M4 7 L4 16 L16 16"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Karrenlichaam */}
      <path d="M16 12 L46 12 L41 30 L21 30 Z" fill="currentColor" />
      {/* Producten */}
      <rect x="22" y="15" width="8" height="10" rx="2" fill="white" fillOpacity="0.45" />
      <rect x="32" y="17" width="7" height="8" rx="2" fill="white" fillOpacity="0.45" />
      {/* Wielen */}
      <circle cx="25" cy="37" r="5" fill="currentColor" />
      <circle cx="39" cy="37" r="5" fill="currentColor" />
      <circle cx="25" cy="37" r="2.5" fill="white" fillOpacity="0.35" />
      <circle cx="39" cy="37" r="2.5" fill="white" fillOpacity="0.35" />
    </svg>
  )
}
