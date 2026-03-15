"use client"

import { useEffect, useState, useCallback } from "react"
import { X, Download, Link, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Props {
  open: boolean
  onClose: () => void
  shareImagePath: string // bv. "/api/share-image/job/abc123"
  deelUrl?: string       // standaard: window.location.href
}

const PLATFORMS = [
  {
    naam: "WhatsApp",
    kleur: "#25D366",
    fg: "#fff",
    href: (url: string, tekst: string) =>
      `https://wa.me/?text=${encodeURIComponent(tekst + "\n" + url)}`,
    icon: (
      <svg viewBox="0 0 24 24" width={20} height={20} fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
  },
  {
    naam: "Facebook",
    kleur: "#1877F2",
    fg: "#fff",
    href: (url: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    icon: (
      <svg viewBox="0 0 24 24" width={20} height={20} fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    naam: "X",
    kleur: "#000",
    fg: "#fff",
    href: (url: string, tekst: string) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(tekst)}&url=${encodeURIComponent(url)}`,
    icon: (
      <svg viewBox="0 0 24 24" width={20} height={20} fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    naam: "Telegram",
    kleur: "#0088cc",
    fg: "#fff",
    href: (url: string, tekst: string) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(tekst)}`,
    icon: (
      <svg viewBox="0 0 24 24" width={20} height={20} fill="currentColor">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
  },
  {
    naam: "Signal",
    kleur: "#2592E9",
    fg: "#fff",
    href: (url: string, tekst: string) =>
      `sgnl://share?text=${encodeURIComponent(tekst + " " + url)}`,
    icon: (
      <svg viewBox="0 0 24 24" width={20} height={20} fill="currentColor">
        <path d="M11.999 0C5.373 0 0 5.372 0 11.999 0 18.626 5.372 24 11.999 24 18.626 24 24 18.627 24 12 24 5.373 18.628 0 11.999 0zm4.934 7.26l-1.433 6.754c-.105.464-.378.578-.765.358l-2.116-1.558-.98 1.048c-.107.116-.195.215-.4.215l-.138-.006.21-2.975 5.424-4.897c.235-.21-.054-.326-.364-.116l-6.7 4.22-2.886-.9c-.63-.194-.643-.63.13-.931l11.248-4.335c.528-.194.991.13.77.923z" />
      </svg>
    ),
  },
  {
    naam: "TikTok",
    kleur: "#010101",
    fg: "#fff",
    href: null, // geen web share link — alleen download
    icon: (
      <svg viewBox="0 0 24 24" width={20} height={20} fill="currentColor">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
      </svg>
    ),
  },
  {
    naam: "Instagram",
    kleur: "#E1306C",
    fg: "#fff",
    href: null, // geen web share link — alleen download
    icon: (
      <svg viewBox="0 0 24 24" width={20} height={20} fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
]

export default function DeelenModal({ open, onClose, shareImagePath, deelUrl }: Props) {
  const [afbeeldingLaden, setAfbeeldingLaden] = useState(true)
  const [afbeeldingFout, setAfbeeldingFout] = useState(false)
  const [gekopieerd, setGekopieerd] = useState(false)
  const [bezig, setBezig] = useState(false)
  const [kanNatief, setKanNatief] = useState(false)

  useEffect(() => {
    setKanNatief(typeof navigator !== "undefined" && typeof navigator.share === "function")
  }, [])

  // Escape key + scroll lock
  useEffect(() => {
    if (!open) return
    const orig = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", handler)
    return () => {
      document.body.style.overflow = orig
      document.removeEventListener("keydown", handler)
    }
  }, [open, onClose])

  const haalAfbeelding = useCallback(async (): Promise<Blob | null> => {
    try {
      const resp = await fetch(shareImagePath)
      if (!resp.ok) return null
      return await resp.blob()
    } catch {
      return null
    }
  }, [shareImagePath])

  // Deelt altijd de afbeelding — geen stille fallback naar link-only
  const natiefDelen = useCallback(async () => {
    setBezig(true)
    const blob = await haalAfbeelding()
    try {
      if (blob) {
        const file = new File([blob], "vergelijking.png", { type: "image/png" })
        await navigator.share({
          files: [file],
          title: "CheaperSupermarkets vergelijking",
        })
      } else {
        // Alleen als de afbeelding niet geladen kon worden: deel link
        await navigator.share({
          url: deelUrl ?? window.location.href,
          title: "CheaperSupermarkets vergelijking",
        })
      }
    } catch {
      // Geannuleerd of niet ondersteund
    }
    setBezig(false)
  }, [haalAfbeelding, deelUrl])

  // Opent de afbeelding in een nieuw tabblad — long-press (mobiel) of rechtermuisknop (desktop) om op te slaan
  const slaOp = useCallback(() => {
    window.open(shareImagePath, "_blank", "noopener,noreferrer")
  }, [shareImagePath])

  const kopieerLink = useCallback(async () => {
    const url = deelUrl ?? window.location.href
    await navigator.clipboard.writeText(url)
    setGekopieerd(true)
    setTimeout(() => setGekopieerd(false), 2000)
  }, [deelUrl])

  if (!open) return null

  const deelTekst = "Bekijk mijn supermarktprijsvergelijking via CheaperSupermarkets!"
  const huidigUrl = typeof window !== "undefined" ? (deelUrl ?? window.location.href) : ""

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(3px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full sm:w-[480px] rounded-t-2xl sm:rounded-2xl bg-background shadow-2xl overflow-hidden"
        style={{ maxHeight: "92dvh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
          <span className="font-display font-bold text-base">Deel je vergelijking</span>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 -mr-1"
            aria-label="Sluiten"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Afbeelding preview — lang indrukken op mobiel om op te slaan */}
          <div className="relative rounded-xl overflow-hidden border border-border/60 bg-muted/30" style={{ aspectRatio: "4/5" }}>
            {afbeeldingLaden && !afbeeldingFout && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            {!afbeeldingFout && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={shareImagePath}
                alt="Vergelijkingsafbeelding"
                className="w-full h-full object-contain"
                onLoad={() => setAfbeeldingLaden(false)}
                onError={() => { setAfbeeldingLaden(false); setAfbeeldingFout(true) }}
                style={{ display: afbeeldingLaden ? "none" : "block" }}
              />
            )}
            {afbeeldingFout && (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
                Afbeelding kon niet worden geladen
              </div>
            )}
          </div>

          {/* Natief delen — deelt de afbeelding zelf */}
          {kanNatief && (
            <Button
              className="w-full gap-2"
              onClick={natiefDelen}
              disabled={bezig}
            >
              <Smartphone size={16} strokeWidth={2} />
              {bezig ? "Laden…" : "Deel afbeelding via app"}
            </Button>
          )}

          {/* Platform knoppen */}
          <div>
            <p className="text-xs text-muted-foreground font-medium mb-2.5 uppercase tracking-wider">Delen via platform</p>
            <div className="grid grid-cols-4 gap-2">
              {PLATFORMS.map((p) => {
                const href = p.href ? p.href(huidigUrl, deelTekst) : null
                return (
                  <button
                    key={p.naam}
                    onClick={() => {
                      if (href) {
                        window.open(href, "_blank", "noopener,noreferrer")
                      } else {
                        slaOp()
                      }
                    }}
                    title={href ? `Deel op ${p.naam}` : `Opslaan voor ${p.naam}`}
                    className="flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-xl hover:opacity-90 active:scale-95 transition-all"
                    style={{ background: p.kleur, color: p.fg }}
                  >
                    {p.icon}
                    <span className="text-[10px] font-semibold">{p.naam}</span>
                  </button>
                )
              })}
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">
              Instagram &amp; TikTok: sla de afbeelding op en post hem in de app.
            </p>
          </div>

          {/* Opslaan + Link */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={slaOp}
            >
              <Download size={15} strokeWidth={2} />
              Afbeelding opslaan
            </Button>
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={kopieerLink}
            >
              <Link size={15} strokeWidth={2} />
              {gekopieerd ? "Gekopieerd!" : "Link kopiëren"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
