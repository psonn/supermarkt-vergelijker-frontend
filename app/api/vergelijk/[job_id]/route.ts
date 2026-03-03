import { NextResponse } from "next/server"

const API_URL = process.env.SUPERMARKT_API_URL
const API_KEY = process.env.SUPERMARKT_API_KEY

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ job_id: string }> }
) {
  const { job_id } = await params

  if (!API_URL || !API_KEY) {
    return NextResponse.json({ detail: "API niet geconfigureerd" }, { status: 503 })
  }

  try {
    const resp = await fetch(`${API_URL}/vergelijk/${job_id}`, {
      headers: { "X-API-Key": API_KEY },
      cache: "no-store",
    })
    const data = await resp.json()
    if (!resp.ok) {
      console.error(`[vergelijk/${job_id}] Railway antwoordde ${resp.status}:`, data)
    }
    return NextResponse.json(data, { status: resp.status })
  } catch (err) {
    console.error(`[vergelijk/${job_id}] Fetch mislukt:`, err)
    return NextResponse.json(
      { detail: `Railway niet bereikbaar: ${err instanceof Error ? err.message : String(err)}` },
      { status: 503 }
    )
  }
}
