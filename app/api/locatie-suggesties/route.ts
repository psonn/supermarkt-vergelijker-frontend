import { NextResponse, type NextRequest } from "next/server"

async function zoekViaPDOK(q: string) {
  const url = new URL("https://api.pdok.nl/bzk/locatieserver/search/v3_1/suggest")
  url.searchParams.set("q", q)
  url.searchParams.set("fq", "type:adres OR type:postcode OR type:woonplaats OR type:weg")
  url.searchParams.set("rows", "8")

  const resp = await fetch(url.toString(), { next: { revalidate: 30 } })
  if (!resp.ok) return []

  const data = await resp.json()
  const docs: Array<{ weergavenaam: string }> = data?.response?.docs ?? []
  return docs.map((doc) => ({ label: doc.weergavenaam, kort: doc.weergavenaam }))
}

async function zoekViaNominatim(q: string) {
  const url = new URL("https://nominatim.openstreetmap.org/search")
  url.searchParams.set("q", q)
  url.searchParams.set("format", "json")
  url.searchParams.set("countrycodes", "nl")
  url.searchParams.set("limit", "5")
  url.searchParams.set("addressdetails", "1")

  const resp = await fetch(url.toString(), {
    headers: { "User-Agent": "CheaperSupermarkets/1.0" },
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
    ].filter(Boolean).join(" "),
  }))
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim()
  if (!q || q.length < 3) return NextResponse.json([])

  try {
    // PDOK is primair: snel, betrouwbaar, puur NL (werkt ook op Vercel)
    const pdok = await zoekViaPDOK(q)
    if (pdok.length > 0) return NextResponse.json(pdok)

    // Fallback naar Nominatim als PDOK niets vindt
    const nominatim = await zoekViaNominatim(q)
    return NextResponse.json(nominatim)
  } catch {
    return NextResponse.json([])
  }
}
