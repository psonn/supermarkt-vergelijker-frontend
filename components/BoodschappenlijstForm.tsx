"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import ProductChipInput, { type ChipItem } from "@/components/ProductChipInput"
import LocatieInput, { type OpgeslagenAdres } from "@/components/LocatieInput"
import { startVergelijking } from "@/lib/api"
import { createClient } from "@/lib/supabase/client"

const ALLE_SUPERMARKTEN = ["Albert Heijn", "Jumbo", "Dirk", "Aldi", "Ekoplaza", "Dekamarkt", "Spar"]
const STRAAL_OPTIES = [1, 2, 5, 10, 25]

const VERVOER_LABELS: Record<string, { label: string; icon: string }> = {
  driving: { label: "Auto", icon: "🚗" },
  cycling: { label: "Fiets", icon: "🚲" },
  walking: { label: "Lopen", icon: "🚶" },
}

export default function BoodschappenlijstForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [chips, setChips] = useState<ChipItem[]>([])
  const [locatie, setLocatie] = useState("")
  const [straal, setStraal] = useState(5)
  const [vervoer, setVervoer] = useState<"driving" | "walking" | "cycling">("driving")
  const [supermarkten, setSupermarkten] = useState<string[]>(ALLE_SUPERMARKTEN)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [laden, setLaden] = useState(false)
  const [fout, setFout] = useState<string | null>(null)
  const [gebruikerProducten, setGebruikerProducten] = useState<string[]>([])

  // Opgeslagen adressen
  const [opgeslagenAdressen, setOpgeslagenAdressen] = useState<OpgeslagenAdres[]>([])
  const [gebruikerId, setGebruikerId] = useState<string | null>(null)
  const [adresOpslaanNaam, setAdresOpslaanNaam] = useState("")
  const [adresOpslaanOpen, setAdresOpslaanOpen] = useState(false)
  const [adresOpgeslagen, setAdresOpgeslagen] = useState(false)

  // Pre-fill vanuit URL params
  useEffect(() => {
    const param = searchParams.get("producten")
    if (param) {
      const namen = param.split("\n").map((r) => r.trim()).filter(Boolean)
      const freq: Record<string, number> = {}
      for (const naam of namen) freq[naam] = (freq[naam] ?? 0) + 1
      setChips(Object.entries(freq).map(([naam, aantal]) => ({ naam, aantal })))
    }
    const locatieParam = searchParams.get("locatie")
    if (locatieParam) setLocatie(locatieParam)
  }, [])

  // Laad gebruikersdata (productgeschiedenis + opgeslagen adressen)
  useEffect(() => {
    try {
      const supabase = createClient()
      supabase.auth.getUser().then(async ({ data: { user } }) => {
        if (!user) return
        setGebruikerId(user.id)

        const [{ data: lijsten }, { data: adressen }] = await Promise.all([
          supabase
            .from("lijsten")
            .select("producten")
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

  function handleLocatieChange(nieuw: string) {
    setLocatie(nieuw)
    setAdresOpgeslagen(false)
    // Reset "adres opslaan" als locatie leeg wordt
    if (!nieuw.trim()) setAdresOpslaanOpen(false)
  }

  function toggleSupermarkt(naam: string) {
    setSupermarkten((prev) =>
      prev.includes(naam)
        ? prev.length > 1 ? prev.filter((s) => s !== naam) : prev
        : [...prev, naam]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFout(null)

    if (chips.length === 0) {
      setFout("Voer minimaal één product in.")
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
      })
      const resultatenUrl = locatie.trim()
        ? `/resultaten/${job.job_id}?locatie=${encodeURIComponent(locatie.trim())}`
        : `/resultaten/${job.job_id}`
      router.push(resultatenUrl)
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
      <div className="space-y-2">
        <Label>Boodschappenlijst</Label>
        <ProductChipInput
          waarde={chips}
          onChange={setChips}
          gebruikerProducten={gebruikerProducten}
          disabled={laden}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="locatie">
          Locatie <span className="text-muted-foreground font-normal">(optioneel)</span>
        </Label>
        <LocatieInput
          waarde={locatie}
          onChange={handleLocatieChange}
          disabled={laden}
          opgeslagenAdressen={opgeslagenAdressen}
          onVerwijderAdres={verwijderAdres}
        />

        {/* Adres opslaan */}
        {gebruikerId && locatie.trim() && !isAlOpgeslagen && !adresOpgeslagen && (
          <div>
            {adresOpslaanOpen ? (
              <div className="flex gap-2 mt-1">
                <input
                  type="text"
                  value={adresOpslaanNaam}
                  onChange={(e) => setAdresOpslaanNaam(e.target.value)}
                  placeholder="Naam (bijv. Thuis)"
                  className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); slaAdresOp() } }}
                  autoFocus
                />
                <Button type="button" size="sm" onClick={slaAdresOp} disabled={!adresOpslaanNaam.trim()}>
                  Opslaan
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => setAdresOpslaanOpen(false)}>
                  Annuleer
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAdresOpslaanOpen(true)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                📍 Adres opslaan
              </button>
            )}
          </div>
        )}
        {adresOpgeslagen && (
          <p className="text-xs text-green-600">Adres opgeslagen!</p>
        )}

        <p className="text-xs text-muted-foreground">
          Voor supermarkten in de buurt met afstand en reistijd
        </p>
      </div>

      {/* Filters */}
      <div className="rounded-md border">
        <button
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-muted/50 transition-colors rounded-md"
        >
          <span>Filters</span>
          <span className="text-muted-foreground text-xs flex items-center gap-2">
            {supermarkten.length < ALLE_SUPERMARKTEN.length && (
              <span className="text-primary">
                {supermarkten.length}/{ALLE_SUPERMARKTEN.length} supermarkten
              </span>
            )}
            {filtersOpen ? "▲" : "▼"}
          </span>
        </button>

        {filtersOpen && (
          <div className="px-4 pb-4 space-y-4 border-t pt-3">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Supermarkten</Label>
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">Straal</Label>
                  <select
                    value={straal}
                    onChange={(e) => setStraal(Number(e.target.value))}
                    disabled={laden}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {STRAAL_OPTIES.map((km) => (
                      <option key={km} value={km}>{km} km</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">Vervoer</Label>
                  <div className="flex gap-1">
                    {(["driving", "cycling", "walking"] as const).map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setVervoer(v)}
                        disabled={laden}
                        title={VERVOER_LABELS[v].label}
                        className={`flex-1 py-2 rounded-md text-base border transition-colors ${
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
        {laden ? "Vergelijking starten…" : "🛒 Vergelijk prijzen"}
      </Button>
    </form>
  )
}
