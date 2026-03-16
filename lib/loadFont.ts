/**
 * Laadt Barlow Condensed 900 als ArrayBuffer via Google Fonts.
 * Wordt gebruikt door de share-image API routes voor next/og ImageResponse.
 */
export async function laadBarlowCondensed900(): Promise<ArrayBuffer | null> {
  try {
    // Vraag Google Fonts CSS op met een browser UA zodat we WOFF2 terugkrijgen
    const css = await fetch(
      "https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@900&subset=latin",
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      }
    ).then((r) => r.text())

    // Extraheer alle WOFF2 URLs — de laatste is de Latin subset
    const matches = [...css.matchAll(/url\((https:\/\/fonts\.gstatic\.com[^)]+)\)/g)]
    if (matches.length === 0) return null

    const fontUrl = matches[matches.length - 1][1]
    return fetch(fontUrl).then((r) => r.arrayBuffer())
  } catch {
    return null
  }
}
