import { NextResponse, type NextRequest } from "next/server"

// Detecteer of invoer begint met een Nederlandse postcode (1234AB of 1234 AB)
const POSTCODE_RE = /^\d{4}\s?[A-Za-z]{0,2}/

async function zoekViaPDOK(q: string) {
  const url = new URL("https://api.pdok.nl/bzk/locatieserver/search/v3_1/suggest")
  url.searchParams.set("q", q)
  url.searchParams.set("fq", "type:adres")
  url.searchParams.set("rows", "15")

  const resp = await fetch(url.toString(), { next: { revalidate: 30 } })
  if (!resp.ok) return []

  const data = await resp.json()
  const docs: Array<{ weergavenaam: string }> = data?.response?.docs ?? []

  return docs.map((doc) => ({
    label: doc.weergavenaam,
    kort: doc.weergavenaam,
  }))
}

async function zoekViaNominatim(q: string) {
  const url = new URL("https://nominatim.openstreetmap.org/search")
  url.searchParams.set("q", q)
  url.searchParams.set("format", "json")
  url.searchParams.set("countrycodes", "nl")
  url.searchParams.set("limit", "6")
  url.searchParams.set("addressdetails", "1")

  const resp = await fetch(url.toString(), {
    headers: { "User-Agent": "SupermarktVergelijker/1.0" },
    next: { revalidate: 60 },
  })
  if (!resp.ok) return []

  const data = await resp.json()
  return data.map((item: Record<string, unknown>) => ({
    label: item.display_name as string,
    kort: [
      (item.address as Record<string, string>)?.road,
      (item.address as Record<string, string>)?.house_number,
      (item.address as Record<string, string>)?.city
        ?? (item.address as Record<string, string>)?.town
        ?? (item.address as Record<string, string>)?.village,
    ]
      .filter(Boolean)
      .join(" "),
  }))
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim()
  if (!q || q.length < 3) return NextResponse.json([])

  try {
    const suggesties = POSTCODE_RE.test(q)
      ? await zoekViaPDOK(q)
      : await zoekViaNominatim(q)

    return NextResponse.json(suggesties)
  } catch {
    return NextResponse.json([])
  }
}
