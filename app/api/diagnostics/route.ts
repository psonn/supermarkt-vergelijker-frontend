import { NextResponse } from "next/server"

/**
 * GET /api/diagnostics
 * Controleert of de Railway API bereikbaar is en de key klopt.
 * Alleen voor debugging — verwijder of beveilig dit in productie.
 */
export async function GET() {
  const API_URL = process.env.SUPERMARKT_API_URL
  const API_KEY = process.env.SUPERMARKT_API_KEY

  const resultaat: Record<string, unknown> = {
    SUPERMARKT_API_URL: API_URL ? `${API_URL.slice(0, 30)}…` : "❌ NIET INGESTELD",
    SUPERMARKT_API_KEY: API_KEY ? `${API_KEY.slice(0, 4)}…(${API_KEY.length} tekens)` : "❌ NIET INGESTELD",
  }

  if (!API_URL || !API_KEY) {
    return NextResponse.json({ status: "env_ontbreekt", ...resultaat }, { status: 500 })
  }

  try {
    const resp = await fetch(`${API_URL}/health`, {
      headers: { "X-API-Key": API_KEY },
      cache: "no-store",
    })
    const body = await resp.json()
    resultaat.railway_status = resp.status
    resultaat.railway_body = body
    resultaat.status = resp.ok ? "ok" : "railway_fout"
  } catch (err) {
    resultaat.railway_status = "unreachable"
    resultaat.railway_fout = err instanceof Error ? err.message : String(err)
    resultaat.status = "verbinding_mislukt"
  }

  return NextResponse.json(resultaat)
}
