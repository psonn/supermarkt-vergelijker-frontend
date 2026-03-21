import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { NextResponse } from "next/server"

const API_URL = process.env.SUPERMARKET_API_URL
const API_KEY = process.env.SUPERMARKET_API_KEY

const ratelimit =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(10, "1 h"),
        prefix: "rl:vergelijk",
      })
    : null

export async function POST(request: Request) {
  if (ratelimit) {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous"
    const { success, limit, remaining, reset } = await ratelimit.limit(ip)
    if (!success) {
      return NextResponse.json(
        { detail: "Te veel vergelijkingen. Probeer het over een uur opnieuw." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": String(limit),
            "X-RateLimit-Remaining": String(remaining),
            "X-RateLimit-Reset": String(reset),
          },
        }
      )
    }
  }

  if (!API_URL) {
    console.error("[vergelijk] SUPERMARKET_API_URL is niet ingesteld")
    return NextResponse.json({ detail: "SUPERMARKET_API_URL niet geconfigureerd" }, { status: 503 })
  }
  if (!API_KEY) {
    console.error("[vergelijk] SUPERMARKET_API_KEY is niet ingesteld")
    return NextResponse.json({ detail: "SUPERMARKET_API_KEY niet geconfigureerd" }, { status: 503 })
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
