"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import type { PrijsAlert } from "@/lib/api"
import { useTranslations } from "next-intl"

interface Props {
  lijstId: string
  gebruikerEmail: string
  bestaandeAlert?: PrijsAlert | null
  onOpgeslagen?: (alert: PrijsAlert) => void
  onVerwijderd?: () => void
}

export default function PrijsAlertFormulier({
  lijstId,
  gebruikerEmail,
  bestaandeAlert,
  onOpgeslagen,
  onVerwijderd,
}: Props) {
  const t = useTranslations("prijsAlert")

  const DREMPEL_OPTIES = [
    { label: t("drempelElkeDaling"), value: 0 },
    { label: t("drempel2"), value: 2 },
    { label: t("drempel5"), value: 5 },
    { label: t("drempel10"), value: 10 },
  ]

  const FREQUENTIE_OPTIES = [
    { label: t("freqMeteen"), value: "meteen" as const },
    { label: t("freqDagelijks"), value: "dagelijks" as const },
    { label: t("freqWekelijks"), value: "wekelijks" as const },
    { label: t("freqMaandelijks"), value: "maandelijks" as const },
  ]

  const DAGEN_WEEK = [t("dagMa"), t("dagDi"), t("dagWo"), t("dagDo"), t("dagVr"), t("dagZa"), t("dagZo")]

  const [email, setEmail] = useState(bestaandeAlert?.email ?? gebruikerEmail)
  const [drempel, setDrempel] = useState(bestaandeAlert?.drempel_procent ?? 5)
  const [frequentie, setFrequentie] = useState<PrijsAlert["frequentie"]>(
    bestaandeAlert?.frequentie ?? "dagelijks"
  )
  const [checkDag, setCheckDag] = useState<number>(bestaandeAlert?.check_dag ?? 0)
  const [checkUur, setCheckUur] = useState(bestaandeAlert?.check_uur ?? 8)
  const [laden, setLaden] = useState(false)
  const [fout, setFout] = useState<string | null>(null)

  const toonDag = frequentie === "wekelijks" || frequentie === "maandelijks"
  const toonUur = frequentie !== "meteen"

  async function opslaan(e: React.FormEvent) {
    e.preventDefault()
    setFout(null)
    setLaden(true)

    try {
      const supabase = createClient()

      // user_id is verplicht voor de RLS-policy
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Niet ingelogd")

      const data = {
        user_id: user.id,
        lijst_id: lijstId,
        email: email.trim(),
        drempel_procent: drempel,
        frequentie,
        check_dag: toonDag ? checkDag : null,
        check_uur: toonUur ? checkUur : 0,
        actief: true,
      }

      if (bestaandeAlert) {
        const { data: updated, error } = await supabase
          .from("prijsalerts")
          .update(data)
          .eq("id", bestaandeAlert.id)
          .select()
          .single()
        if (error) throw new Error(error.message)
        onOpgeslagen?.(updated as PrijsAlert)
      } else {
        const { data: created, error } = await supabase
          .from("prijsalerts")
          .insert(data)
          .select()
          .single()
        if (error) throw new Error(error.message)
        onOpgeslagen?.(created as PrijsAlert)
      }
    } catch (err: unknown) {
      setFout(err instanceof Error ? err.message : "Opslaan mislukt")
    } finally {
      setLaden(false)
    }
  }

  async function verwijderen() {
    if (!bestaandeAlert) return
    setLaden(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("prijsalerts")
        .delete()
        .eq("id", bestaandeAlert.id)
      if (error) throw error
      onVerwijderd?.()
    } catch (err: unknown) {
      setFout(err instanceof Error ? err.message : "Verwijderen mislukt")
    } finally {
      setLaden(false)
    }
  }

  return (
    <form onSubmit={opslaan} className="space-y-4 pt-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* E-mailadres */}
        <div className="sm:col-span-2 space-y-1.5">
          <label htmlFor={`email-${lijstId}`} className="label-section">{t("emailLabel")}</label>
          <Input
            id={`email-${lijstId}`}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={laden}
          />
        </div>

        {/* Drempel */}
        <div className="space-y-1.5">
          <label className="label-section">{t("drempelLabel")}</label>
          <div className="flex flex-wrap gap-2">
            {DREMPEL_OPTIES.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setDrempel(opt.value)}
                disabled={laden}
                className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                  drempel === opt.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-input hover:bg-muted"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Frequentie */}
        <div className="space-y-1.5">
          <label className="label-section">{t("frequentieLabel")}</label>
          <div className="flex flex-wrap gap-2">
            {FREQUENTIE_OPTIES.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setFrequentie(opt.value)}
                disabled={laden}
                className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                  frequentie === opt.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-input hover:bg-muted"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dag (wekelijks / maandelijks) */}
        {toonDag && (
          <div className="space-y-1.5">
            <label htmlFor={`dag-${lijstId}`} className="label-section">
              {frequentie === "wekelijks" ? t("dagLabelWekelijks") : t("dagLabelMaandelijks")}
            </label>
            {frequentie === "wekelijks" ? (
              <select
                id={`dag-${lijstId}`}
                value={checkDag}
                onChange={(e) => setCheckDag(Number(e.target.value))}
                disabled={laden}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {DAGEN_WEEK.map((dag, i) => (
                  <option key={i} value={i}>{dag}</option>
                ))}
              </select>
            ) : (
              <Input
                id={`dag-${lijstId}`}
                type="number"
                min={1}
                max={31}
                value={checkDag}
                onChange={(e) => setCheckDag(Number(e.target.value))}
                disabled={laden}
              />
            )}
          </div>
        )}

        {/* Tijdstip */}
        {toonUur && (
          <div className="space-y-1.5">
            <label htmlFor={`uur-${lijstId}`} className="label-section">{t("tijdstipLabel")}</label>
            <select
              id={`uur-${lijstId}`}
              value={checkUur}
              onChange={(e) => setCheckUur(Number(e.target.value))}
              disabled={laden}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>
                  {String(i).padStart(2, "0")}:00
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {fout && <p className="text-sm text-destructive">{fout}</p>}

      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={laden}>
          {laden ? t("bezig") : bestaandeAlert ? t("bijwerken") : t("instellen")}
        </Button>
        {bestaandeAlert && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={laden}
            onClick={verwijderen}
          >
            {t("verwijderen")}
          </Button>
        )}
      </div>
    </form>
  )
}
