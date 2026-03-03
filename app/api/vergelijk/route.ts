import { NextResponse } from "next/server"

const API_URL = process.env.SUPERMARKT_API_URL!
const API_KEY = process.env.SUPERMARKT_API_KEY!

export async function POST(request: Request) {
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
    return NextResponse.json(data, { status: resp.status })
  } catch (err) {
    return NextResponse.json({ detail: "API niet bereikbaar" }, { status: 503 })
  }
}
