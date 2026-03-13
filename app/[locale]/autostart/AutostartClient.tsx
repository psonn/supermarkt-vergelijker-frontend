"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useRouter } from "@/lib/i18n-navigation"
import { startVergelijking } from "@/lib/api"
import { useLocale } from "next-intl"

const ALLE_SUPERMARKTEN = ["Albert Heijn", "Jumbo", "Dirk", "Aldi", "Ekoplaza", "Dekamarkt", "Spar", "Vomar"]

export default function AutostartClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const locale = useLocale()

  useEffect(() => {
    const productParam = searchParams.get("producten")
    if (!productParam) {
      router.replace("/")
      return
    }

    const namen = productParam.split("\n").map((s) => s.trim()).filter(Boolean)
    const freq: Record<string, number> = {}
    for (const naam of namen) freq[naam] = (freq[naam] ?? 0) + 1
    const producten = Object.entries(freq).flatMap(([naam, aantal]) => Array(aantal).fill(naam))

    const locatie = searchParams.get("locatie") || undefined
    const supermarktenParam = searchParams.get("supermarkten")
    const supermarkten = supermarktenParam
      ? supermarktenParam.split(",").map((s) => s.trim()).filter(Boolean)
      : undefined
    const updateLijstId = searchParams.get("update_lijst_id") || undefined

    const alleGeselecteerd = !supermarkten || supermarkten.length === ALLE_SUPERMARKTEN.length

    startVergelijking({
      producten,
      locatie,
      supermarkten: alleGeselecteerd ? undefined : supermarkten,
      lang: locale,
    })
      .then((job) => {
        try {
          sessionStorage.setItem(
            "sv_supermarkten",
            JSON.stringify(supermarkten ?? ALLE_SUPERMARKTEN)
          )
        } catch { /* ignore */ }

        const zoekParams = new URLSearchParams()
        if (locatie) zoekParams.set("locatie", encodeURIComponent(locatie))
        if (updateLijstId) zoekParams.set("update_lijst_id", updateLijstId)
        const qs = zoekParams.toString()
        router.replace(`/resultaten/${job.job_id}${qs ? `?${qs}` : ""}` as "/")
      })
      .catch(() => {
        router.replace("/")
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-muted-foreground text-sm">Vergelijking starten…</p>
      </div>
    </main>
  )
}
