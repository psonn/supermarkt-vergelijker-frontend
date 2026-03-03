import { NextResponse } from "next/server"

const API_URL = process.env.SUPERMARKT_API_URL
const API_KEY = process.env.SUPERMARKT_API_KEY

export async function POST(request: Request) {
  if (!API_URL) {
    console.error("[vergelijk] SUPERMARKT_API_URL is niet ingesteld")
    return NextResponse.json({ detail: "SUPERMARKT_API_URL niet geconfigureerd" }, { status: 503 })
  }
  if (!API_KEY) {
    console.error("[vergelijk] SUPERMARKT_API_KEY is niet ingesteld")
    return NextResponse.json({ detail: "SUPERMARKT_API_KEY niet geconfigureerd" }, { status: 503 })
  }

  try {
    const body = await request.json()
    const resp = await fetch(`${API_URL}/vergelijk`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY,
      },
      body: JSON.stringify(body),
    })
    const data = await resp.json()
    if (!resp.ok) {
      console.error(`[vergelijk] Railway antwoordde ${resp.status}:`, data)
    }
    return NextResponse.json(data, { status: resp.status })
  } catch (err) {
    console.error("[vergelijk] Fetch naar Railway mislukt:", err)
    return NextResponse.json(
      { detail: `Railway niet bereikbaar: ${err instanceof Error ? err.message : String(err)}` },
      { status: 503 }
    )
  }
}
