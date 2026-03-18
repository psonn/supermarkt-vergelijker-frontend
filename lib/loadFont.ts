import fs from "fs"
import path from "path"

/**
 * Laadt Barlow Condensed 900 als ArrayBuffer.
 * Leest eerst uit public/fonts/ (gebundeld, snel).
 * Valt terug op Google Fonts als het bestand ontbreekt.
 * Satori vereist TTF — GEEN WOFF2.
 */
export async function laadBarlowCondensed900(): Promise<ArrayBuffer | null> {
  // 1. Lokaal bestand (gebundeld in repo — geen externe HTTP-call)
  try {
    const fontPath = path.join(process.cwd(), "public", "fonts", "barlow-condensed-900.ttf")
    const buffer = fs.readFileSync(fontPath)
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer
  } catch {
    // Bestand niet gevonden — probeer Google Fonts als fallback
  }

  // 2. Fallback: Google Fonts (geen User-Agent → TTF, niet WOFF2)
  try {
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
