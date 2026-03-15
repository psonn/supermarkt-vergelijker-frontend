"use client"

import React, { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useRouter } from "@/lib/i18n-navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ShoppingCart, MapPin, Car, Bike, PersonStanding } from "lucide-react"
import ProductChipInput, { type ChipItem } from "@/components/ProductChipInput"
import LocatieInput, { type OpgeslagenAdres } from "@/components/LocatieInput"
import { startVergelijking } from "@/lib/api"
import { createClient } from "@/lib/supabase/client"
import { useTranslations, useLocale } from "next-intl"
import { laadVoorkeuren, slaVoorkeurenOp } from "@/lib/voorkeuren"

const ALLE_SUPERMARKTEN = ["Albert Heijn", "Jumbo", "Dirk", "Aldi", "Ekoplaza", "Dekamarkt", "Spar", "Vomar"]
const STRAAL_OPTIES = [1, 2, 5, 10, 25]

export default function BoodschappenlijstForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useTranslations("form")
  const locale = useLocale()

  const VERVOER_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
    driving: { label: t("auto"), icon: <Car size={16} strokeWidth={2} /> },
    cycling: { label: t("fiets"), icon: <Bike size={16} strokeWidth={2} /> },
    walking: { label: t("lopen"), icon: <PersonStanding size={16} strokeWidth={2} /> },
  }

  const [chips, setChips] = useState<ChipItem[]>([])
  const [locatie, setLocatie] = useState("")
  const [straal, setStraal] = useState(5)
  const [vervoer, setVervoer] = useState<"driving" | "walking" | "cycling">("driving")
  const [supermarkten, setSupermarkten] = useState<string[]>(ALLE_SUPERMARKTEN)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [laden, setLaden] = useState(false)
  const [fout, setFout] = useState<string | null>(null)
  const [gebruikerProducten, setGebruikerProducten] = useState<string[]>([])

  const [opgeslaanLijsten, setOpgeslaanLijsten] = useState<{ id: string; naam: string; producten: string[]; locatie?: string | null }[]>([])
  const [opgeslagenAdressen, setOpgeslagenAdressen] = useState<OpgeslagenAdres[]>([])
  const [gebruikerId, setGebruikerId] = useState<string | null>(null)
  const [adresOpslaanNaam, setAdresOpslaanNaam] = useState("")
  const [adresOpslaanOpen, setAdresOpslaanOpen] = useState(false)
  const [adresOpgeslagen, setAdresOpgeslagen] = useState(false)

  useEffect(() => {
    const param = searchParams.get("producten")
    let gevuldeChips: ChipItem[] = []
    if (param) {
      const namen = param.split("\n").map((r) => r.trim()).filter(Boolean)
      const freq: Record<string, number> = {}
      for (const naam of namen) freq[naam] = (freq[naam] ?? 0) + 1
      gevuldeChips = Object.entries(freq).map(([naam, aantal]) => ({ naam, aantal }))
      setChips(gevuldeChips)
    }
    const locatieParam = searchParams.get("locatie")
    let gevuldeLocatie = ""
    if (locatieParam) {
      gevuldeLocatie = locatieParam
      setLocatie(locatieParam)
    } else {
      // Auto-fill met opgeslagen GPS-locatie
      try {
        const opgeslagen = localStorage.getItem("sv_gps_locatie")
        if (opgeslagen) { gevuldeLocatie = opgeslagen; setLocatie(opgeslagen) }
      } catch { /* localStorage niet beschikbaar */ }
    }

    // Autostart: direct vergelijking starten vanuit e-maillink
    if (searchParams.get("autostart") === "1" && gevuldeChips.length > 0) {
      const producten = gevuldeChips.flatMap((c) => Array(c.aantal).fill(c.naam))
      setLaden(true)
      import("@/lib/api").then(({ startVergelijking }) =>
        startVergelijking({
          producten,
          locatie: gevuldeLocatie.trim() || undefined,
          lang: locale,
        }).then((job) => {
          try { sessionStorage.setItem("sv_supermarkten", JSON.stringify(ALLE_SUPERMARKTEN)) } catch { /* negeer */ }
          const url = gevuldeLocatie.trim()
            ? `/resultaten/${job.job_id}?locatie=${encodeURIComponent(gevuldeLocatie.trim())}`
            : `/resultaten/${job.job_id}`
          router.push(url as "/")
        }).catch((err: unknown) => {
          setFout(err instanceof Error ? err.message : "Er ging iets mis.")
          setLaden(false)
        })
      )
    }
  }, [])

  useEffect(() => {
    try {
      const supabase = createClient()
      supabase.auth.getUser().then(async ({ data: { user } }) => {
        if (!user) return
        setGebruikerId(user.id)

        const [{ data: lijsten }, { data: adressen }] = await Promise.all([
          supabase
            .from("lijsten")
            .select("id, naam, producten, locatie")
            .eq("user_id", user.id)
            .order("aangemaakt_op", { ascending: false })
            .limit(20),
          supabase
            .from("adressen")
            .select("id, naam, adres")
            .eq("user_id", user.id)
            .order("aangemaakt_op", { ascending: false }),
        ])

        if (lijsten) {
          setOpgeslaanLijsten(lijsten)
          const frequentie: Record<string, number> = {}
          for (const lijst of lijsten) {
            for (const product of lijst.producten ?? []) {
              frequentie[product] = (frequentie[product] ?? 0) + 1
            }
          }
          setGebruikerProducten(
            Object.entries(frequentie)
              .sort((a, b) => b[1] - a[1])
              .map(([naam]) => naam)
          )
        }

        if (adressen) setOpgeslagenAdressen(adressen)
      })
    } catch {
      // Supabase niet geconfigureerd
    }
  }, [])

  // Laad opgeslagen voorkeuren (alleen als geen URL-params de filters overschrijven)
  useEffect(() => {
    const heeftUrlFilters = searchParams.get("producten") !== null
    if (heeftUrlFilters) return // URL-params hebben voorrang
    laadVoorkeuren().then((v) => {
      if (!v) return
      if (v.supermarkten.length > 0) setSupermarkten(v.supermarkten)
      setStraal(v.straal)
      setVervoer(v.vervoer)
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function slaAdresOp() {
    if (!locatie.trim() || !adresOpslaanNaam.trim() || !gebruikerId) return
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from("adressen")
        .insert({ user_id: gebruikerId, naam: adresOpslaanNaam.trim(), adres: locatie.trim() })
        .select("id, naam, adres")
        .single()
      if (data) {
        setOpgeslagenAdressen((prev) => [data, ...prev])
        setAdresOpslaanOpen(false)
        setAdresOpslaanNaam("")
        setAdresOpgeslagen(true)
        setTimeout(() => setAdresOpgeslagen(false), 2000)
      }
    } catch { /* negeer */ }
  }

  async function verwijderAdres(id: string) {
    try {
      const supabase = createClient()
      await supabase.from("adressen").delete().eq("id", id)
      setOpgeslagenAdressen((prev) => prev.filter((a) => a.id !== id))
    } catch { /* negeer */ }
  }

  function laadLijst(lijst: { producten: string[]; locatie?: string | null }) {
    const freq: Record<string, number> = {}
    for (const naam of lijst.producten) freq[naam] = (freq[naam] ?? 0) + 1
    setChips(Object.entries(freq).map(([naam, aantal]) => ({ naam, aantal })))
    if (lijst.locatie) setLocatie(lijst.locatie)
  }

  function handleLocatieChange(nieuw: string) {
    setLocatie(nieuw)
    setAdresOpgeslagen(false)
    if (!nieuw.trim()) setAdresOpslaanOpen(false)
  }

  function handleGpsSuccess(adres: string) {
    try {
      localStorage.setItem("sv_gps_locatie", adres)
    } catch { /* negeer */ }
  }

  function toggleSupermarkt(naam: string) {
    setSupermarkten((prev) =>
      prev.includes(naam)
        ? prev.length > 1 ? prev.filter((s) => s !== naam) : prev
        : [...prev, naam]
    )
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFout(null)

    if (chips.length === 0) {
      setFout(t("foutMinProduct"))
      return
    }

    const producten = chips.flatMap((c) => Array(c.aantal).fill(c.naam))
    const alleGeselecteerd = supermarkten.length === ALLE_SUPERMARKTEN.length

    setLaden(true)
    try {
      const job = await startVergelijking({
        producten,
        locatie: locatie.trim() || undefined,
        straal: locatie.trim() ? straal : undefined,
        vervoer: locatie.trim() ? vervoer : undefined,
        supermarkten: alleGeselecteerd ? undefined : supermarkten,
        lang: locale,
      })
      try { sessionStorage.setItem("sv_supermarkten", JSON.stringify(supermarkten)) } catch { /* negeer */ }
      // Sla filters op als voorkeur voor volgende keer
      slaVoorkeurenOp({ supermarkten, straal, vervoer })
      const resultatenUrl = locatie.trim()
        ? `/resultaten/${job.job_id}?locatie=${encodeURIComponent(locatie.trim())}`
        : `/resultaten/${job.job_id}`
      router.push(resultatenUrl as "/")
    } catch (err: unknown) {
      setFout(err instanceof Error ? err.message : "Er ging iets mis.")
      setLaden(false)
    }
  }

  const isAlOpgeslagen = locatie.trim()
    ? opgeslagenAdressen.some((a) => a.adres === locatie.trim())
    : false

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Bestaande lijsten als startpunt */}
      {opgeslaanLijsten.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">{t("bestaandeLijst")}</p>
          <div className="flex flex-wrap gap-1.5">
            {opgeslaanLijsten.slice(0, 6).map((lijst) => (
              <button
                key={lijst.id}
                type="button"
                disabled={laden}
                onClick={() => laadLijst(lijst)}
                className="px-2.5 py-1 rounded-md border border-input bg-background hover:bg-muted text-xs text-muted-foreground hover:text-foreground transition-colors truncate max-w-[160px]"
                title={lijst.naam}
              >
                {lijst.naam}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label>{t("boodschappenlijst")}</Label>
        <ProductChipInput
          waarde={chips}
          onChange={setChips}
          gebruikerProducten={gebruikerProducten}
          disabled={laden}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="locatie">
          {t("locatie")} <span className="text-muted-foreground font-normal">{t("optioneel")}</span>
        </Label>
        <LocatieInput
          waarde={locatie}
          onChange={handleLocatieChange}
          disabled={laden}
          opgeslagenAdressen={opgeslagenAdressen}
          onGpsSuccess={handleGpsSuccess}
        />

        {gebruikerId && locatie.trim() && !isAlOpgeslagen && !adresOpgeslagen && (
          <div>
            {adresOpslaanOpen ? (
              <div className="flex gap-2 mt-1">
                <input
                  type="text"
                  value={adresOpslaanNaam}
                  onChange={(e) => setAdresOpslaanNaam(e.target.value)}
                  placeholder={t("adresNaamPlaceholder")}
                  className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); slaAdresOp() } }}
                  autoFocus
                />
                <Button type="button" size="sm" onClick={slaAdresOp} disabled={!adresOpslaanNaam.trim()}>
                  {t("opslaan")}
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => setAdresOpslaanOpen(false)}>
                  {t("annuleer")}
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAdresOpslaanOpen(true)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <span className="inline-flex items-center gap-1"><MapPin size={11} strokeWidth={2.2} />{t("adresOpslaan")}</span>
              </button>
            )}
          </div>
        )}
        {adresOpgeslagen && (
          <p className="text-xs text-success">{t("adresOpgeslagen")}</p>
        )}

        <p className="text-xs text-muted-foreground">{t("locatieHint")}</p>
      </div>

      {/* Filters */}
      <div className="rounded-md border">
        <button
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-muted/50 transition-colors rounded-md"
        >
          <span>{t("filters")}</span>
          <span className="text-muted-foreground text-xs flex items-center gap-2">
            {supermarkten.length < ALLE_SUPERMARKTEN.length && (
              <span className="text-primary">
                {t("aantalSupermarkten", { count: supermarkten.length, total: ALLE_SUPERMARKTEN.length })}
              </span>
            )}
            {filtersOpen ? "▲" : "▼"}
          </span>
        </button>

        {filtersOpen && (
          <div className="px-4 pb-4 space-y-4 border-t pt-3">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">{t("supermarkten")}</Label>
              <div className="flex flex-wrap gap-2">
                {ALLE_SUPERMARKTEN.map((sm) => {
                  const actief = supermarkten.includes(sm)
                  return (
                    <button
                      key={sm}
                      type="button"
                      onClick={() => toggleSupermarkt(sm)}
                      disabled={laden}
                      className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                        actief
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background border-input hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      {sm}
                    </button>
                  )
                })}
              </div>
            </div>

            {locatie.trim() && (
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">{t("straal")}</Label>
                  <select
                    value={straal}
                    onChange={(e) => setStraal(Number(e.target.value))}
                    disabled={laden}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {STRAAL_OPTIES.map((km) => (
                      <option key={km} value={km}>{km} {t("km")}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">{t("vervoer")}</Label>
                  <div className="flex gap-1">
                    {(["driving", "cycling", "walking"] as const).map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setVervoer(v)}
                        disabled={laden}
                        title={VERVOER_LABELS[v].label}
                        className={`flex-1 py-2 rounded-md border transition-colors flex items-center justify-center ${
                          vervoer === v
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background border-input hover:bg-muted"
                        }`}
                      >
                        {VERVOER_LABELS[v].icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {fout && <p className="text-sm text-destructive">{fout}</p>}

      <Button type="submit" disabled={laden} className="w-full font-semibold text-base py-5 shadow-sm">
        {laden ? t("bezig") : <span className="inline-flex items-center gap-2"><ShoppingCart size={18} strokeWidth={2.2} />{t("vergelijk")}</span>}
      </Button>
    </form>
  )
}
