"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import ResultatenTabel from "@/components/ResultatenTabel"
import { haalJobOp, type JobResponse } from "@/lib/api"
import { createClient } from "@/lib/supabase/client"

const POLL_INTERVAL_MS = 2000

export default function ResultatenPagina() {
  const { job_id } = useParams<{ job_id: string }>()
  const router = useRouter()
  const [job, setJob] = useState<JobResponse | null>(null)
  const [fout, setFout] = useState<string | null>(null)
  const [lijstNaam, setLijstNaam] = useState("Mijn lijst")
  const [opgeslagen, setOpgeslagen] = useState(false)
  const [gebruiker, setGebruiker] = useState<{ id: string } | null>(null)

  // Haal ingelogde gebruiker op
  useEffect(() => {
    try {
      createClient().auth.getUser().then(({ data }) => {
        setGebruiker(data.user as { id: string } | null)
      })
    } catch {
      // Supabase niet geconfigureerd — doorgaan zonder auth
    }
  }, [])

  // Poll job status
  useEffect(() => {
    let actief = true

    async function poll() {
      try {
        const data = await haalJobOp(job_id)
        if (!actief) return
        setJob(data)
        if (data.status === "bezig") {
          setTimeout(poll, POLL_INTERVAL_MS)
        }
      } catch (err: unknown) {
        if (!actief) return
        setFout(err instanceof Error ? err.message : "Ophalen mislukt")
      }
    }

    poll()
    return () => { actief = false }
  }, [job_id])

  async function slaOp() {
    if (!job?.resultaat || !gebruiker) return
    let supabase: ReturnType<typeof createClient>
    try { supabase = createClient() } catch { return }
    const producten = job.resultaat
      ? "vergelijking" in job.resultaat
        ? job.resultaat.vergelijking.producten.map((p) => p.zoekopdracht)
        : job.resultaat.producten.map((p) => p.zoekopdracht)
      : []

    const { error } = await supabase.from("lijsten").insert({
      user_id: gebruiker.id,
      naam: lijstNaam,
      producten,
      laatste_resultaat: job.resultaat,
      laatste_vergelijking: new Date().toISOString(),
    })

    if (!error) setOpgeslagen(true)
  }

  if (fout) {
    return (
      <div className="container max-w-xl mx-auto px-4 py-16 text-center">
        <p className="text-destructive mb-4">{fout}</p>
        <Button variant="outline" onClick={() => router.push("/")}>Terug</Button>
      </div>
    )
  }

  if (!job || job.status === "bezig") {
    return (
      <div className="container max-w-xl mx-auto px-4 py-16 text-center">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-muted rounded w-3/4 mx-auto" />
          <div className="h-4 bg-muted rounded w-1/2 mx-auto" />
        </div>
        <p className="text-muted-foreground mt-6 text-sm">
          Supermarktprijzen ophalen… even geduld.
        </p>
      </div>
    )
  }

  if (job.status === "fout") {
    return (
      <div className="container max-w-xl mx-auto px-4 py-16 text-center">
        <p className="text-destructive mb-4">{job.fout ?? "Er is een fout opgetreden."}</p>
        <Button variant="outline" onClick={() => router.push("/")}>Terug</Button>
      </div>
    )
  }

  return (
    <main className="container max-w-3xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Vergelijkingsresultaten</h1>
        <Link href="/">
          <Button variant="outline" size="sm">Nieuwe vergelijking</Button>
        </Link>
      </div>

      {job.resultaat && <ResultatenTabel resultaat={job.resultaat} />}

      {/* Lijst opslaan */}
      {gebruiker && job.resultaat && !opgeslagen && (
        <div className="mt-8 rounded-lg border p-4 space-y-3">
          <p className="font-medium text-sm">Lijst opslaan</p>
          <div className="flex gap-2">
            <input
              value={lijstNaam}
              onChange={(e) => setLijstNaam(e.target.value)}
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Naam van de lijst"
            />
            <Button onClick={slaOp} size="sm">Opslaan</Button>
          </div>
        </div>
      )}
      {opgeslagen && (
        <p className="mt-4 text-sm text-green-600">
          Lijst opgeslagen. <Link href="/mijn-lijsten" className="underline">Bekijk je lijsten →</Link>
        </p>
      )}
      {!gebruiker && job.resultaat && (
        <p className="mt-6 text-sm text-muted-foreground text-center">
          <Link href="/login" className="underline">Log in</Link> om deze lijst op te slaan.
        </p>
      )}
    </main>
  )
}
