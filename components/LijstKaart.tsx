"use client"

import { useState } from "react"
import { Link, useRouter } from "@/lib/i18n-navigation"
import { useLocale, useTranslations } from "next-intl"
import { startVergelijking } from "@/lib/api"
import { Bell, Pencil, Trash2, Check, X, Play, BarChart2, Car, Bike, PersonStanding, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import ProductChipInput, { type ChipItem } from "@/components/ProductChipInput"
import LocatieInput from "@/components/LocatieInput"
import PrijsAlertFormulier from "@/components/PrijsAlertFormulier"
import { createClient } from "@/lib/supabase/client"
import type { PrijsAlert } from "@/lib/api"

const ALLE_SUPERMARKTEN = ["Albert Heijn", "Jumbo", "Dirk", "Aldi", "Ekoplaza", "Dekamarkt", "Spar", "Vomar"]
const STRAAL_OPTIES = [1, 2, 5, 10, 25]
const VERVOER_OPTIES = [
  { value: "driving", icon: <Car size={14} strokeWidth={2} /> },
  { value: "cycling", icon: <Bike size={14} strokeWidth={2} /> },
  { value: "walking", icon: <PersonStanding size={14} strokeWidth={2} /> },
] as const

interface Lijst {
  id: string
  naam: string
  producten: string[]
  aangemaakt_op: string
  laatste_vergelijking?: string | null
  locatie?: string | null
  supermarkten_opgeslagen?: string[] | null
  straal_opgeslagen?: number | null
  vervoer_opgeslagen?: string | null
}

interface Props {
  lijst: Lijst
  gebruikerEmail: string
  bestaandeAlert: PrijsAlert | null
  heeft_resultaat?: boolean
  supermarkten?: string[]
}

function groepeerProducten(producten: string[]) {
  const freq: Record<string, number> = {}
  for (const p of producten) freq[p] = (freq[p] ?? 0) + 1
  return Object.entries(freq).map(([naam, aantal]) => ({ naam, aantal }))
}

function chipsNaarProducten(chips: ChipItem[]): string[] {
  return chips.flatMap((c) => Array(c.aantal).fill(c.naam))
}

export default function LijstKaart({ lijst, gebruikerEmail, bestaandeAlert: initieleAlert, heeft_resultaat = false, supermarkten }: Props) {
  const t = useTranslations("lijstKaart")
  const router = useRouter()
  const locale = useLocale()
  const [alertOpen, setAlertOpen] = useState(false)
  const [alert, setAlert] = useState<PrijsAlert | null>(initieleAlert)

  // Actieve filters (gebruikt bij Vergelijk nu, persisteerbaar)
  const initSupermarkten = lijst.supermarkten_opgeslagen?.length
    ? lijst.supermarkten_opgeslagen
    : (supermarkten ?? ALLE_SUPERMARKTEN)
  const initLocatie = lijst.locatie ?? ""
  const initStraal = lijst.straal_opgeslagen ?? 5
  const initVervoer = (lijst.vervoer_opgeslagen as "driving" | "cycling" | "walking") ?? "driving"

  const [actiefLocatie, setActiefLocatie] = useState(initLocatie)
  const [actiefSupermarkten, setActiefSupermarkten] = useState<string[]>(initSupermarkten)
  const [actiefStraal, setActiefStraal] = useState(initStraal)
  const [actiefVervoer, setActiefVervoer] = useState<"driving" | "cycling" | "walking">(initVervoer)

  // Lokale staat naam/producten
  const [naam, setNaam] = useState(lijst.naam)
  const [producten, setProducten] = useState(lijst.producten)

  // Hernoemen
  const [hernoemen, setHernoemen] = useState(false)
  const [nieuweNaam, setNieuweNaam] = useState(lijst.naam)

  // Bewerken (producten + filters)
  const [bewerken, setBewerken] = useState(false)
  const [bewerkChips, setBewerkChips] = useState<ChipItem[]>(groepeerProducten(producten))
  const [filtersOpen, setFiltersOpen] = useState(false)

  // Verwijderen
  const [verwijderConfirm, setVerwijderConfirm] = useState(false)

  const [bezig, setBezig] = useState(false)
  const [fout, setFout] = useState<string | null>(null)
  const [vergelijkBezig, setVergelijkBezig] = useState(false)

  const gegroepeerd = groepeerProducten(producten)

  async function startVergelijkNu() {
    setVergelijkBezig(true)
    const alleGeselecteerd = actiefSupermarkten.length === ALLE_SUPERMARKTEN.length
    try {
      const job = await startVergelijking({
        producten,
        locatie: actiefLocatie.trim() || undefined,
        straal: actiefLocatie.trim() ? actiefStraal : undefined,
        vervoer: actiefLocatie.trim() ? actiefVervoer : undefined,
        supermarkten: alleGeselecteerd ? undefined : actiefSupermarkten,
        lang: locale,
      })
      try {
        sessionStorage.setItem("sv_supermarkten", JSON.stringify(actiefSupermarkten))
      } catch { /* negeer */ }
      const url = heeft_resultaat
        ? `/resultaten/${job.job_id}?update_lijst_id=${lijst.id}${actiefLocatie.trim() ? `&locatie=${encodeURIComponent(actiefLocatie.trim())}` : ""}`
        : `/resultaten/${job.job_id}${actiefLocatie.trim() ? `?locatie=${encodeURIComponent(actiefLocatie.trim())}` : ""}`
      router.push(url)
    } catch {
      setFout(t("foutVergelijking"))
      setVergelijkBezig(false)
    }
  }

  async function slaHernoemingOp() {
    if (!nieuweNaam.trim() || nieuweNaam.trim() === naam) { setHernoemen(false); return }
    setBezig(true)
    try {
      const supabase = createClient()
      await supabase.from("lijsten").update({ naam: nieuweNaam.trim() }).eq("id", lijst.id)
      setNaam(nieuweNaam.trim())
      setHernoemen(false)
    } catch { setFout(t("foutNaam")) }
    setBezig(false)
  }

  async function slaBewerkingenOp() {
    const nieuweProducten = chipsNaarProducten(bewerkChips)
    if (nieuweProducten.length === 0) return
    setBezig(true)
    try {
      const supabase = createClient()
      await supabase.from("lijsten").update({
        producten: nieuweProducten,
        locatie: actiefLocatie.trim() || null,
        supermarkten: actiefSupermarkten,
        straal: actiefStraal,
        vervoer: actiefVervoer,
      }).eq("id", lijst.id)
      setProducten(nieuweProducten)
      setBewerken(false)
      setFiltersOpen(false)
    } catch { setFout(t("foutOpslaan")) }
    setBezig(false)
  }

  async function verwijder() {
    setBezig(true)
    try {
      const supabase = createClient()
      await supabase.from("lijsten").delete().eq("id", lijst.id)
      router.refresh()
    } catch { setFout(t("foutVerwijderen")); setBezig(false) }
  }

  function annuleerBewerken() {
    setBewerken(false)
    setFiltersOpen(false)
    setBewerkChips(groepeerProducten(producten))
    setActiefLocatie(initLocatie)
    setActiefSupermarkten(initSupermarkten)
    setActiefStraal(initStraal)
    setActiefVervoer(initVervoer)
  }

  function handleOpgeslagen(nieuw: PrijsAlert) { setAlert(nieuw); setAlertOpen(false) }
  function handleAlertVerwijderd() { setAlert(null); setAlertOpen(false) }

  return (
    <Card id={`lijst-${lijst.id}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {hernoemen ? (
              <div className="flex items-center gap-1.5">
                <Input
                  value={nieuweNaam}
                  onChange={(e) => setNieuweNaam(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") slaHernoemingOp(); if (e.key === "Escape") setHernoemen(false) }}
                  className="h-7 text-sm font-semibold"
                  autoFocus
                  disabled={bezig}
                  maxLength={100}
                />
                <button type="button" onClick={slaHernoemingOp} disabled={bezig} className="text-primary hover:opacity-70" aria-label={t("opslaan")}>
                  <Check size={15} strokeWidth={2.5} />
                </button>
                <button type="button" onClick={() => setHernoemen(false)} className="text-muted-foreground hover:opacity-70" aria-label={t("hernoemAnnuleer")}>
                  <X size={15} strokeWidth={2.5} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 group">
                <CardTitle className="text-base truncate">{naam}</CardTitle>
                <button
                  type="button"
                  onClick={() => { setNieuweNaam(naam); setHernoemen(true) }}
                  className="opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity text-muted-foreground"
                  title={t("hernoemen")}
                  aria-label={t("hernoemLabel", { naam })}
                >
                  <Pencil size={12} strokeWidth={2} />
                </button>
              </div>
            )}
            <CardDescription>
              {t("productenTelling", { count: gegroepeerd.length })} ·{" "}
              {new Date(lijst.aangemaakt_op).toLocaleDateString(locale)}
            </CardDescription>
          </div>

          <button
            type="button"
            onClick={() => setAlertOpen((v) => !v)}
            title={alert ? t("alertActief") : t("alertInstellen")}
            className={`mt-0.5 transition-opacity ${alert ? "opacity-100 text-primary" : "opacity-40 hover:opacity-70"}`}
          >
            <Bell size={18} strokeWidth={2} fill={alert ? "currentColor" : "none"} />
          </button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Producten of bewerkmode */}
        {bewerken ? (
          <div className="space-y-3">
            <ProductChipInput waarde={bewerkChips} onChange={setBewerkChips} disabled={bezig} />

            {/* Filters uitklappen */}
            <button
              type="button"
              onClick={() => setFiltersOpen((v) => !v)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {filtersOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              {t("filtersLabel")} {filtersOpen ? t("filtersVerbergen") : t("filtersBewerken")}
            </button>

            {filtersOpen && (
              <div className="space-y-3 pl-1 border-l-2 border-muted ml-1">
                {/* Locatie */}
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">{t("locatieLabel")}</p>
                  <LocatieInput waarde={actiefLocatie} onChange={setActiefLocatie} disabled={bezig} />
                </div>

                {/* Supermarkten */}
                <div className="space-y-1.5">
                  <p className="text-xs text-muted-foreground font-medium">{t("supermarktenLabel")}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {ALLE_SUPERMARKTEN.map((sm) => {
                      const actief = actiefSupermarkten.includes(sm)
                      return (
                        <button
                          key={sm}
                          type="button"
                          disabled={bezig}
                          onClick={() => setActiefSupermarkten((prev) =>
                            prev.includes(sm)
                              ? prev.length > 1 ? prev.filter((s) => s !== sm) : prev
                              : [...prev, sm]
                          )}
                          className={`px-2.5 py-1 rounded text-xs border transition-colors ${
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

                {/* Straal + vervoer (alleen als locatie ingevuld) */}
                {actiefLocatie.trim() && (
                  <div className="flex gap-3 items-end">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground font-medium">{t("straalLabel")}</p>
                      <select
                        value={actiefStraal}
                        onChange={(e) => setActiefStraal(Number(e.target.value))}
                        disabled={bezig}
                        className="rounded border border-input bg-background px-2 py-1.5 text-xs"
                      >
                        {STRAAL_OPTIES.map((km) => (
                          <option key={km} value={km}>{km} km</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground font-medium">{t("vervoerLabel")}</p>
                      <div className="flex gap-1">
                        {VERVOER_OPTIES.map(({ value, icon }) => (
                          <button
                            key={value}
                            type="button"
                            disabled={bezig}
                            onClick={() => setActiefVervoer(value)}
                            className={`p-1.5 rounded border transition-colors ${
                              actiefVervoer === value
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background border-input hover:bg-muted"
                            }`}
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <Button size="sm" onClick={slaBewerkingenOp} disabled={bezig || bewerkChips.length === 0}>
                <Check size={13} strokeWidth={2.5} className="mr-1" />{t("opslaan")}
              </Button>
              <Button size="sm" variant="ghost" onClick={annuleerBewerken}>
                {t("annuleren")}
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {gegroepeerd.map((p) => p.aantal > 1 ? `${p.naam} ×${p.aantal}` : p.naam).join(", ")}
          </p>
        )}

        {/* Alert samenvatting */}
        {alert && !alertOpen && !bewerken && (
          <p className="text-xs text-muted-foreground">
            Alert: {t(`alertFreq${alert.frequentie.charAt(0).toUpperCase()}${alert.frequentie.slice(1)}`)} ·{" "}
            {alert.drempel_procent === 0 ? t("alertElkeDaling") : `≥ ${alert.drempel_procent}%`} ·{" "}
            {alert.email}
          </p>
        )}

        {fout && <p className="text-xs text-destructive">{fout}</p>}

        {/* Actieknoppen */}
        {!bewerken && (
          <div className="flex flex-wrap items-center gap-2">
            {heeft_resultaat && (
              <Link href={`/mijn-lijsten/${lijst.id}`}>
                <Button size="sm" variant="outline" className="gap-1.5">
                  <BarChart2 size={13} strokeWidth={2} />
                  {t("resultaten")}
                </Button>
              </Link>
            )}
            <Button size="sm" className="gap-1.5" onClick={startVergelijkNu} disabled={vergelijkBezig || bezig}>
              <Play size={12} strokeWidth={2.5} fill="currentColor" />
              {vergelijkBezig ? t("vergelijkBezig") : t("vergelijkNu")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => { setBewerkChips(groepeerProducten(producten)); setBewerken(true) }}
            >
              <Pencil size={13} strokeWidth={2} className="mr-1" />{t("bewerken")}
            </Button>

            {verwijderConfirm ? (
              <div className="flex items-center gap-1.5 ml-auto">
                <span className="text-xs text-muted-foreground">{t("zekerWeten")}</span>
                <Button size="sm" variant="destructive" onClick={verwijder} disabled={bezig}>
                  <Trash2 size={13} strokeWidth={2} className="mr-1" />{t("jaVerwijder")}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setVerwijderConfirm(false)}>
                  <X size={13} strokeWidth={2} />
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                onClick={() => setVerwijderConfirm(true)}
                className="ml-auto text-muted-foreground hover:text-destructive transition-colors"
                title={t("verwijderenLabel")}
              >
                <Trash2 size={15} strokeWidth={2} />
              </Button>
            )}
          </div>
        )}

        {/* Prijsalert formulier */}
        {alertOpen && (
          <div className="pt-3 border-t space-y-2">
            <p className="text-sm font-medium">{t("prijsalertTitel")}</p>
            <p className="text-xs text-muted-foreground">
              {t("prijsalertTekst")}
            </p>
            <PrijsAlertFormulier
              lijstId={lijst.id}
              gebruikerEmail={gebruikerEmail}
              bestaandeAlert={alert}
              onOpgeslagen={handleOpgeslagen}
              onVerwijderd={handleAlertVerwijderd}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
