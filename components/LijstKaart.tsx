"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Bell, Pencil, Trash2, Check, X, Play, BarChart2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import ProductChipInput, { type ChipItem } from "@/components/ProductChipInput"
import PrijsAlertFormulier from "@/components/PrijsAlertFormulier"
import { createClient } from "@/lib/supabase/client"
import type { PrijsAlert } from "@/lib/api"

interface Lijst {
  id: string
  naam: string
  producten: string[]
  aangemaakt_op: string
  laatste_vergelijking?: string | null
  locatie?: string | null
}

interface Props {
  lijst: Lijst
  gebruikerEmail: string
  bestaandeAlert: PrijsAlert | null
  heeft_resultaat?: boolean
}

function groepeerProducten(producten: string[]) {
  const freq: Record<string, number> = {}
  for (const p of producten) freq[p] = (freq[p] ?? 0) + 1
  return Object.entries(freq).map(([naam, aantal]) => ({ naam, aantal }))
}

function chipsNaarProducten(chips: ChipItem[]): string[] {
  return chips.flatMap((c) => Array(c.aantal).fill(c.naam))
}

export default function LijstKaart({ lijst, gebruikerEmail, bestaandeAlert: initieleAlert, heeft_resultaat = false }: Props) {
  const router = useRouter()
  const [alertOpen, setAlertOpen] = useState(false)
  const [alert, setAlert] = useState<PrijsAlert | null>(initieleAlert)

  // Lokale staat voor naam/producten (zodat wijzigingen direct zichtbaar zijn)
  const [naam, setNaam] = useState(lijst.naam)
  const [producten, setProducten] = useState(lijst.producten)

  // Hernoemen
  const [hernoemen, setHernoemen] = useState(false)
  const [nieuweNaam, setNieuweNaam] = useState(lijst.naam)

  // Bewerken
  const [bewerken, setBewerken] = useState(false)
  const [bewerkChips, setBewerkChips] = useState<ChipItem[]>(groepeerProducten(producten))

  // Verwijderen
  const [verwijderConfirm, setVerwijderConfirm] = useState(false)

  // Opslaan-status
  const [bezig, setBezig] = useState(false)
  const [fout, setFout] = useState<string | null>(null)

  const gegroepeerd = groepeerProducten(producten)
  const params = new URLSearchParams()
  params.set("producten", producten.join("\n"))
  params.set("autostart", "1")
  if (lijst.locatie) params.set("locatie", lijst.locatie)

  async function slaHernoemingOp() {
    if (!nieuweNaam.trim() || nieuweNaam.trim() === naam) { setHernoemen(false); return }
    setBezig(true)
    try {
      const supabase = createClient()
      await supabase.from("lijsten").update({ naam: nieuweNaam.trim() }).eq("id", lijst.id)
      setNaam(nieuweNaam.trim())
      setHernoemen(false)
    } catch { setFout("Hernoemen mislukt") }
    setBezig(false)
  }

  async function slaBewerkingenOp() {
    const nieuweProducten = chipsNaarProducten(bewerkChips)
    if (nieuweProducten.length === 0) return
    setBezig(true)
    try {
      const supabase = createClient()
      await supabase.from("lijsten").update({ producten: nieuweProducten }).eq("id", lijst.id)
      setProducten(nieuweProducten)
      setBewerken(false)
    } catch { setFout("Opslaan mislukt") }
    setBezig(false)
  }

  async function verwijder() {
    setBezig(true)
    try {
      const supabase = createClient()
      await supabase.from("lijsten").delete().eq("id", lijst.id)
      router.refresh()
    } catch { setFout("Verwijderen mislukt"); setBezig(false) }
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
                />
                <button type="button" onClick={slaHernoemingOp} disabled={bezig} className="text-primary hover:opacity-70">
                  <Check size={15} strokeWidth={2.5} />
                </button>
                <button type="button" onClick={() => setHernoemen(false)} className="text-muted-foreground hover:opacity-70">
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
                  title="Hernoemen"
                >
                  <Pencil size={12} strokeWidth={2} />
                </button>
              </div>
            )}
            <CardDescription>
              {gegroepeerd.length} producten ·{" "}
              {new Date(lijst.aangemaakt_op).toLocaleDateString("nl-NL")}
            </CardDescription>
          </div>

          <button
            type="button"
            onClick={() => setAlertOpen((v) => !v)}
            title={alert ? "Prijsalert actief — klik om te bewerken" : "Prijsalert instellen"}
            className={`mt-0.5 transition-opacity ${alert ? "opacity-100 text-primary" : "opacity-40 hover:opacity-70"}`}
          >
            <Bell size={18} strokeWidth={2} fill={alert ? "currentColor" : "none"} />
          </button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Productenlijst of bewerkmode */}
        {bewerken ? (
          <div className="space-y-2">
            <ProductChipInput
              waarde={bewerkChips}
              onChange={setBewerkChips}
              disabled={bezig}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={slaBewerkingenOp} disabled={bezig || bewerkChips.length === 0}>
                <Check size={13} strokeWidth={2.5} className="mr-1" />Opslaan
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { setBewerken(false); setBewerkChips(groepeerProducten(producten)) }}>
                Annuleren
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {gegroepeerd.map((p) => p.aantal > 1 ? `${p.naam} ×${p.aantal}` : p.naam).join(", ")}
          </p>
        )}

        {/* Prijsalert samenvatting */}
        {alert && !alertOpen && !bewerken && (
          <p className="text-xs text-muted-foreground">
            Alert: {alert.frequentie === "meteen" ? "zo snel mogelijk" : alert.frequentie} ·{" "}
            {alert.drempel_procent === 0 ? "elke daling" : `≥ ${alert.drempel_procent}%`} ·{" "}
            {alert.email}
          </p>
        )}

        {/* Foutmelding */}
        {fout && <p className="text-xs text-destructive">{fout}</p>}

        {/* Actieknoppen */}
        {!bewerken && (
          <div className="flex flex-wrap items-center gap-2">
            {heeft_resultaat && (
              <Link href={`/mijn-lijsten/${lijst.id}`}>
                <Button size="sm" variant="outline" className="gap-1.5">
                  <BarChart2 size={13} strokeWidth={2} />
                  Resultaten
                </Button>
              </Link>
            )}
            <Link href={`/?${params}`}>
              <Button size="sm" className="gap-1.5">
                <Play size={12} strokeWidth={2.5} fill="currentColor" />
                Vergelijk nu
              </Button>
            </Link>
            <Button
              size="sm"
              variant="outline"
              onClick={() => { setBewerkChips(groepeerProducten(producten)); setBewerken(true) }}
            >
              <Pencil size={13} strokeWidth={2} className="mr-1" />Bewerken
            </Button>

            {verwijderConfirm ? (
              <div className="flex items-center gap-1.5 ml-auto">
                <span className="text-xs text-muted-foreground">Zeker weten?</span>
                <Button size="sm" variant="destructive" onClick={verwijder} disabled={bezig}>
                  <Trash2 size={13} strokeWidth={2} className="mr-1" />Ja, verwijder
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setVerwijderConfirm(false)}>
                  <X size={13} strokeWidth={2} />
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setVerwijderConfirm(true)}
                className="ml-auto text-muted-foreground hover:text-destructive transition-colors"
                title="Verwijderen"
              >
                <Trash2 size={15} strokeWidth={2} />
              </button>
            )}
          </div>
        )}

        {/* Prijsalert formulier */}
        {alertOpen && (
          <div className="pt-3 border-t space-y-2">
            <p className="text-sm font-medium">Prijsalert</p>
            <p className="text-xs text-muted-foreground">
              Ontvang een e-mail als de goedkoopste optie voor deze lijst daalt.
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
