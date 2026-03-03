import { NextResponse } from "next/server"

const API_URL = process.env.SUPERMARKT_API_URL!
const API_KEY = process.env.SUPERMARKT_API_KEY!

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ job_id: string }> }
) {
  const { job_id } = await params
  try {
    const resp = await fetch(`${API_URL}/vergelijk/${job_id}`, {
      headers: { "X-API-Key": API_KEY },
      cache: "no-store",
    })
    const data = await resp.json()
    return NextResponse.json(data, { status: resp.status })
  } catch {
    return NextResponse.json({ detail: "API niet bereikbaar" }, { status: 503 })
  }
}
