export interface VergelijkRequest {
  producten: string[]
  locatie?: string
  straal?: number
  vervoer?: "driving" | "walking" | "cycling"
  supermarkten?: string[]
  gebruik_cache?: boolean
}

export interface JobResponse {
  job_id: string
  status: "bezig" | "klaar" | "fout"
  aangemaakt_op: string
  klaar_op?: string
  resultaat?: VergelijkingsResultaat | LocatieResultaat
  fout?: string
}

export interface Product {
  supermarkt: string
  naam: string
  prijs: number
  url?: string
  eenheid?: string
}

export interface GematchedProduct {
  zoekopdracht: string
  matches: Record<string, Product | null>
  llm_gered?: string[]
}

export interface VergelijkingsResultaat {
  producten: GematchedProduct[]
  totaal_per_supermarkt: Record<string, number>
  goedkoopste_supermarkt?: string
  goedkoopste_totaal?: number
  dekking_per_supermarkt: Record<string, number>
  beste_match_supermarkt?: string
}

export interface SupermarktLocatie {
  naam: string
  afstand_km?: number
  reistijd_min?: number
  adres?: string
  stad?: string
}

export interface LocatieResultaat {
  vergelijking: VergelijkingsResultaat
  supermarkten_nabij: SupermarktLocatie[]
  aanbevolen_supermarkt?: string
  aanbeveling_reden?: string
  vervoer: string
}

export interface PrijsAlert {
  id: string
  lijst_id: string
  email: string
  actief: boolean
  drempel_procent: number
  frequentie: "meteen" | "dagelijks" | "wekelijks" | "maandelijks"
  check_dag?: number | null
  check_uur: number
  laatste_check?: string | null
}

export async function startVergelijking(req: VergelijkRequest): Promise<JobResponse> {
  const resp = await fetch("/api/vergelijk", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  })
  if (!resp.ok) {
    const err = await resp.json()
    throw new Error(err.detail ?? "Vergelijking starten mislukt")
  }
  return resp.json()
}

export async function haalJobOp(jobId: string): Promise<JobResponse> {
  const resp = await fetch(`/api/vergelijk/${jobId}`, { cache: "no-store" })
  if (!resp.ok) {
    const err = await resp.json()
    throw new Error(err.detail ?? "Job ophalen mislukt")
  }
  return resp.json()
}
