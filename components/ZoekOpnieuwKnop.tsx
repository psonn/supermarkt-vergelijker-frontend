"use client"

import { useState } from "react"
import { useRouter } from "@/lib/i18n-navigation"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { startVergelijking } from "@/lib/api"
import { useLocale, useTranslations } from "next-intl"

interface Props {
  producten: string[]
  locatie?: string | null
  supermarkten?: string[]
  updateLijstId: string
}

export default function ZoekOpnieuwKnop({ producten, locatie, supermarkten, updateLijstId }: Props) {
  const t = useTranslations("resultatenpagina")
  const router = useRouter()
  const locale = useLocale()
  const [laden, setLaden] = useState(false)
  const [fout, setFout] = useState<string | null>(null)

  async function handleClick() {
    setLaden(true)
    setFout(null)
    try {
      const job = await startVergelijking({
        producten,
        locatie: locatie?.trim() || undefined,
        supermarkten: supermarkten?.length ? supermarkten : undefined,
        lang: locale,
      })
      try {
        if (supermarkten?.length) sessionStorage.setItem("sv_supermarkten", JSON.stringify(supermarkten))
        else sessionStorage.removeItem("sv_supermarkten")
      } catch { /* negeer */ }
      const url = `/resultaten/${job.job_id}?update_lijst_id=${updateLijstId}${locatie?.trim() ? `&locatie=${encodeURIComponent(locatie.trim())}` : ""}`
      router.push(url as "/")
    } catch (err: unknown) {
      setFout(err instanceof Error ? err.message : "Er ging iets mis.")
      setLaden(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button size="sm" className="shrink-0 gap-1.5" onClick={handleClick} disabled={laden}>
        <RefreshCw size={13} strokeWidth={2.5} className={laden ? "animate-spin" : ""} />
        {laden ? t("zoekOpnieuwBezig") : t("zoekOpnieuw")}
      </Button>
      {fout && <p className="text-xs text-destructive">{fout}</p>}
    </div>
  )
}
