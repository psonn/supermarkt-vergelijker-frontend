/**
 * Laadt Barlow Condensed 900 als ArrayBuffer via Google Fonts.
 * Satori vereist TTF/OTF — GEEN WOFF2. Gebruik een oude UA om TTF te krijgen.
 * Wordt gebruikt door de share-image API routes voor next/og ImageResponse.
 */
export async function laadBarlowCondensed900(): Promise<ArrayBuffer | null> {
  try {
    // Geen User-Agent → Google Fonts retourneert TTF (Satori ondersteunt geen WOFF2)
    const css = await fetch(
      "https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@900&subset=latin"
    ).then((r) => r.text())

    const matches = [...css.matchAll(/url\((https:\/\/fonts\.gstatic\.com[^)]+)\)/g)]
    if (matches.length === 0) return null

    const fontUrl = matches[matches.length - 1][1]
    const resp = await fetch(fontUrl)
    if (!resp.ok) return null
    return resp.arrayBuffer()
  } catch {
    return null
  }
}
