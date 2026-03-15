import { ImageResponse } from "next/og"
import { maakShareImageElement } from "@/lib/shareImageElement"

export const runtime = "nodejs"

const WIDTH = 1080
const HEIGHT = 1350

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ job_id: string }> }
) {
  const { job_id } = await params
  const API_URL = process.env.SUPERMARKET_API_URL
  const API_KEY = process.env.SUPERMARKET_API_KEY

  if (!API_URL || !API_KEY) {
    return new Response("API niet geconfigureerd", { status: 503 })
  }

  try {
    const resp = await fetch(`${API_URL}/vergelijk/${job_id}`, {
      headers: { "X-API-Key": API_KEY },
      next: { revalidate: 3600 },
    })
    if (!resp.ok) return new Response("Job niet gevonden", { status: 404 })

    const job = await resp.json()
    if (job.status !== "klaar" || !job.resultaat) {
      return new Response("Job nog niet klaar", { status: 202 })
    }

    return new ImageResponse(
      maakShareImageElement({ resultaat: job.resultaat }),
      { width: WIDTH, height: HEIGHT }
    )
  } catch (err) {
    console.error("[share-image/job]", err)
    return new Response("Fout bij genereren", { status: 500 })
  }
}
