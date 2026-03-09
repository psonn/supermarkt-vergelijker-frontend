"use client"

import { useState } from "react"
import Link from "next/link"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import PrijsAlertFormulier from "@/components/PrijsAlertFormulier"
import type { PrijsAlert } from "@/lib/api"

interface Lijst {
  id: string
  naam: string
  producten: string[]
  aangemaakt_op: string
  laatste_vergelijking?: string
  locatie?: string | null
}

interface Props {
  lijst: Lijst
  gebruikerEmail: string
  bestaandeAlert: PrijsAlert | null
}

// Groepeer duplicaten: ["melk","melk","brood"] → [{naam:"melk",aantal:2},{naam:"brood",aantal:1}]
function groepeerProducten(producten: string[]) {
  const freq: Record<string, number> = {}
  for (const p of producten) freq[p] = (freq[p] ?? 0) + 1
  return Object.entries(freq).map(([naam, aantal]) => ({ naam, aantal }))
}

export default function LijstKaart({ lijst, gebruikerEmail, bestaandeAlert: initieleAlert }: Props) {
  const [alertOpen, setAlertOpen] = useState(false)
  const [alert, setAlert] = useState<PrijsAlert | null>(initieleAlert)

  const gegroepeerd = groepeerProducten(lijst.producten)
  const params = new URLSearchParams()
  params.set("producten", lijst.producten.join("\n"))
  if (lijst.locatie) params.set("locatie", lijst.locatie)

  function handleOpgeslagen(nieuw: PrijsAlert) {
    setAlert(nieuw)
    setAlertOpen(false)
  }

  function handleVerwijderd() {
    setAlert(null)
    setAlertOpen(false)
  }

  return (
    <Card id={`lijst-${lijst.id}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">{lijst.naam}</CardTitle>
            <CardDescription>
              {gegroepeerd.length} producten ·{" "}
              {new Date(lijst.aangemaakt_op).toLocaleDateString("nl-NL")}
            </CardDescription>
          </div>
          <button
            type="button"
            onClick={() => setAlertOpen((v) => !v)}
            title={alert ? "Prijsalert actief — klik om te bewerken" : "Prijsalert instellen"}
            className={`mt-0.5 transition-opacity ${
              alert ? "opacity-100 text-primary" : "opacity-40 hover:opacity-70"
            }`}
          >
            <Bell size={18} strokeWidth={2} fill={alert ? "currentColor" : "none"} />
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-3">
          {gegroepeerd.map((p) => p.aantal > 1 ? `${p.naam} ×${p.aantal}` : p.naam).join(", ")}
        </p>

        {alert && !alertOpen && (
          <p className="text-xs text-muted-foreground mb-3">
            Alert: {alert.frequentie === "meteen" ? "zo snel mogelijk" : alert.frequentie} ·{" "}
            {alert.drempel_procent === 0 ? "elke daling" : `≥ ${alert.drempel_procent}%`} ·{" "}
            {alert.email}
          </p>
        )}

        <div className="flex gap-2">
          <Link href={`/?${params}`}>
            <Button variant="outline" size="sm">Opnieuw vergelijken</Button>
          </Link>
        </div>

        {alertOpen && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm font-medium mb-1">Prijsalert</p>
            <p className="text-xs text-muted-foreground mb-3">
              Ontvang een e-mail als de goedkoopste optie voor deze lijst daalt.
            </p>
            <PrijsAlertFormulier
              lijstId={lijst.id}
              gebruikerEmail={gebruikerEmail}
              bestaandeAlert={alert}
              onOpgeslagen={handleOpgeslagen}
              onVerwijderd={handleVerwijderd}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
