import { NextResponse, type NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim()
  if (!q || q.length < 3) return NextResponse.json([])

  try {
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

    if (!resp.ok) return NextResponse.json([])
    const data = await resp.json()

    const suggesties = data.map((item: Record<string, unknown>) => ({
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

    return NextResponse.json(suggesties)
  } catch {
    return NextResponse.json([])
  }
}
