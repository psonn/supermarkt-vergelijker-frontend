import { NextResponse, type NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const lat = request.nextUrl.searchParams.get("lat")
  const lng = request.nextUrl.searchParams.get("lng")

  if (!lat || !lng) {
    return NextResponse.json({ error: "lat/lng required" }, { status: 400 })
  }

  try {
    const url = new URL("https://nominatim.openstreetmap.org/reverse")
    url.searchParams.set("lat", lat)
    url.searchParams.set("lon", lng)
    url.searchParams.set("format", "json")
    url.searchParams.set("accept-language", "nl")

    const resp = await fetch(url.toString(), {
      headers: { "User-Agent": "SupermarktVergelijker/1.0" },
    })
    if (!resp.ok) throw new Error("Nominatim fout")

    const data = await resp.json()
    const addr = data.address as Record<string, string> | undefined

    let adres = data.display_name as string
    if (addr) {
      const straat = [addr.road, addr.house_number].filter(Boolean).join(" ")
      const stad = addr.city ?? addr.town ?? addr.village ?? addr.municipality
      const kort = [straat, stad].filter(Boolean).join(", ")
      if (kort) adres = kort
    }

    return NextResponse.json({ adres })
  } catch {
    return NextResponse.json({ error: "Reverse geocoding mislukt" }, { status: 500 })
  }
}
