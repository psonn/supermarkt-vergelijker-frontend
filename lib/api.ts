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

export interface LocatieResultaat {
  vergelijking: VergelijkingsResultaat
  supermarkten_in_buurt: Record<string, unknown>[]
  vervoer: string
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
