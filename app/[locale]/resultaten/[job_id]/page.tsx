"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { useRouter } from "@/lib/i18n-navigation"
import { Link } from "@/lib/i18n-navigation"
import { Button } from "@/components/ui/button"
import { Share2 } from "lucide-react"
import ResultatenTabel from "@/components/ResultatenTabel"
import WinkelwagenLader from "@/components/WinkelwagenLader"
import { haalJobOp, type JobResponse } from "@/lib/api"
import { createClient } from "@/lib/supabase/client"
import { Suspense } from "react"
import { useTranslations } from "next-intl"

const POLL_INTERVAL_MS = 2000

function ResultatenInhoud() {
  const { job_id } = useParams<{ job_id: string }>()
  const router = useRouter()
  const searchParams = useSearchParams()
  const locatie = searchParams.get("locatie") ?? ""
  const updateLijstId = searchParams.get("update_lijst_id") ?? null
  const t = useTranslations("resultatenpagina")

  const [job, setJob] = useState<JobResponse | null>(null)
  const [fout, setFout] = useState<string | null>(null)
  const [lijstNaam, setLijstNaam] = useState("Mijn lijst")
  const [opgeslagen, setOpgeslagen] = useState(false)
  const [opgeslagenLijstId, setOpgeslagenLijstId] = useState<string | null>(null)
  const [gebruiker, setGebruiker] = useState<{ id: string } | null>(null)
  const [gedeeld, setGedeeld] = useState(false)

  useEffect(() => {
    try {
      createClient().auth.getUser().then(({ data }) => {
        setGebruiker(data.user as { id: string } | null)
      })
    } catch {
      // Supabase niet geconfigureerd
    }
  }, [])

  useEffect(() => {
    let actief = true

    async function poll() {
      try {
        const data = await haalJobOp(job_id)
        if (!actief) return
        setJob(data)
        if (data.status === "bezig") setTimeout(poll, POLL_INTERVAL_MS)
      } catch (err: unknown) {
        if (!actief) return
        setFout(err instanceof Error ? err.message : t("ophalenMislukt"))
      }
    }

    poll()
    return () => { actief = false }
  }, [job_id, t])

  // Auto-update bestaande lijst zodra resultaten binnen zijn
  useEffect(() => {
    if (!updateLijstId || !job?.resultaat || job.status !== "klaar") return
    let supabase: ReturnType<typeof createClient>
    try { supabase = createClient() } catch { return }
    supabase.from("lijsten").update({
      laatste_resultaat: job.resultaat,
      laatste_vergelijking: new Date().toISOString(),
    }).eq("id", updateLijstId).then(({ error }) => {
      if (!error) { setOpgeslagen(true); setOpgeslagenLijstId(updateLijstId) }
    })
  }, [job?.status, updateLijstId]) // eslint-disable-line react-hooks/exhaustive-deps

  async function slaOp() {
    if (!job?.resultaat || !gebruiker) return
    let supabase: ReturnType<typeof createClient>
    try { supabase = createClient() } catch { return }

    const producten = "vergelijking" in job.resultaat
      ? job.resultaat.vergelijking.producten.map((p) => p.zoekopdracht)
      : job.resultaat.producten.map((p) => p.zoekopdracht)

    const { error, data } = await supabase.from("lijsten").insert({
      user_id: gebruiker.id,
      naam: lijstNaam,
      producten,
      locatie: locatie || null,
      laatste_resultaat: job.resultaat,
      laatste_vergelijking: new Date().toISOString(),
    }).select("id").single()

    if (!error && data) { setOpgeslagen(true); setOpgeslagenLijstId(data.id) }
  }

  const deel = useCallback(async () => {
    const url = window.location.href
    const title = t("deelTitel")
    try {
      if (navigator.share) {
        await navigator.share({ url, title })
      } else {
        await navigator.clipboard.writeText(url)
        setGedeeld(true)
        setTimeout(() => setGedeeld(false), 2000)
      }
    } catch {
      // geannuleerd of niet ondersteund
    }
  }, [t])

  if (fout) {
    return (
      <div className="container max-w-xl mx-auto px-4 py-16 text-center">
        <p className="text-destructive mb-4">{fout}</p>
        <Button variant="outline" onClick={() => router.push("/")}>{t("terug")}</Button>
      </div>
    )
  }

  if (!job || job.status === "bezig") {
    return <WinkelwagenLader />
  }

  if (job.status === "fout") {
    return (
      <div className="container max-w-xl mx-auto px-4 py-16 text-center">
        <p className="text-destructive mb-4">{job.fout ?? t("fout")}</p>
        <Button variant="outline" onClick={() => router.push("/")}>{t("terug")}</Button>
      </div>
    )
  }

  return (
    <main className="w-full max-w-3xl mx-auto px-3 sm:px-6 py-6 sm:py-12">
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <h1 className="font-display text-xl sm:text-2xl font-bold">{t("titel")}</h1>
        <div className="flex gap-2">
          {updateLijstId && (
            <Link href="/mijn-lijsten">
              <Button variant="ghost" size="sm">← Mijn lijsten</Button>
            </Link>
          )}
          <Button variant="outline" size="sm" onClick={deel} className="gap-1.5">
            <Share2 size={14} strokeWidth={2} />
            {gedeeld ? t("gekopieerd") : t("deel")}
          </Button>
          <Link href="/">
            <Button variant="outline" size="sm">{t("nieuweVergelijking")}</Button>
          </Link>
        </div>
      </div>

      {job.resultaat && <ResultatenTabel resultaat={job.resultaat} />}

      {gebruiker && job.resultaat && !opgeslagen && !updateLijstId && (
        <div className="mt-8 rounded-lg border p-4 space-y-3">
          <p className="font-medium text-sm">{t("lijstOpslaan")}</p>
          {locatie && (
            <p className="text-xs text-muted-foreground">{t("locatieMeegeslagen", { locatie })}</p>
          )}
          <div className="flex gap-2">
            <input
              value={lijstNaam}
              onChange={(e) => setLijstNaam(e.target.value)}
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder={t("lijstNaamPlaceholder")}
            />
            <Button onClick={slaOp} size="sm">{t("opslaan")}</Button>
          </div>
        </div>
      )}
      {opgeslagen && (
        <p className="mt-4 text-sm text-success">
          <Link
            href={opgeslagenLijstId && !updateLijstId ? `/mijn-lijsten/${opgeslagenLijstId}` : "/mijn-lijsten"}
            className="underline"
          >
            {t("lijstOpgeslagen")}
          </Link>
        </p>
      )}
      {!gebruiker && job.resultaat && (
        <p className="mt-6 text-sm text-muted-foreground text-center">
          <Link href="/login" className="underline">Log in</Link>{" "}{t("inloggenVoorOpslaan")}
        </p>
      )}
    </main>
  )
}

export default function ResultatenPagina() {
  return (
    <Suspense>
      <ResultatenInhoud />
    </Suspense>
  )
}
