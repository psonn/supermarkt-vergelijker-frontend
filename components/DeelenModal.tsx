"use client"

import { useEffect, useState, useCallback } from "react"
import { X, LinkIcon, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"

interface Props {
  open: boolean
  onClose: () => void
  shareImagePath: string // bv. "/api/share-image/job/abc123"
  deelUrl?: string       // standaard: window.location.href
}


export default function DeelenModal({ open, onClose, shareImagePath, deelUrl }: Props) {
  const t = useTranslations("deelModal")
  const [afbeeldingLaden, setAfbeeldingLaden] = useState(true)
  const [afbeeldingFout, setAfbeeldingFout] = useState(false)
  const [gekopieerd, setGekopieerd] = useState(false)
  const [bezig, setBezig] = useState(false)

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

  // Deelt afbeelding + link + tekst via native share sheet
  const natiefDelen = useCallback(async () => {
    setBezig(true)
    const blob = await haalAfbeelding()
    const url = deelUrl ?? window.location.href
    const tekst = `${t("deelTekst")}\n${url}`
    try {
      if (blob) {
        const file = new File([blob], "vergelijking.png", { type: "image/png" })
        await navigator.share({ files: [file], text: tekst })
      } else {
        await navigator.share({ url, text: tekst })
      }
    } catch {
      // Geannuleerd of niet ondersteund
    }
    setBezig(false)
  }, [haalAfbeelding, deelUrl])

  const kopieerLink = useCallback(async () => {
    const url = deelUrl ?? window.location.href
    await navigator.clipboard.writeText(url)
    setGekopieerd(true)
    setTimeout(() => setGekopieerd(false), 2000)
  }, [deelUrl])

  if (!open) return null

  const huidigUrl = typeof window !== "undefined" ? (deelUrl ?? window.location.href) : ""

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4"
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
          <span className="font-display font-bold text-base">{t("titel")}</span>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 -mr-1"
            aria-label={t("sluiten")}
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
                alt={t("afbeeldingAlt")}
                className="w-full h-full object-contain"
                onLoad={() => setAfbeeldingLaden(false)}
                onError={() => { setAfbeeldingLaden(false); setAfbeeldingFout(true) }}
                style={{ display: afbeeldingLaden ? "none" : "block" }}
              />
            )}
            {afbeeldingFout && (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
                {t("afbeeldingFout")}
              </div>
            )}
          </div>

          {/* Acties */}
          <div className="flex flex-col gap-2">
            <Button
              className="w-full gap-2"
              onClick={natiefDelen}
              disabled={bezig}
            >
              <Smartphone size={16} strokeWidth={2} />
              {bezig ? t("laden") : t("deel")}
            </Button>
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={kopieerLink}
            >
              <LinkIcon size={15} strokeWidth={2} />
              {gekopieerd ? t("gekopieerd") : t("linkKopieren")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
