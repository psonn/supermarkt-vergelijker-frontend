import { readFile } from "fs/promises"
import path from "path"

const LOGO_BESTAND: Record<string, string> = {
  "Albert Heijn": "ah.png",
  "Jumbo":        "jumbo.png",
  "Dirk":         "dirk.png",
  "Aldi":         "aldi.png",
  "Ekoplaza":     "ekoplaza.png",
  "Dekamarkt":    "dekamarkt.png",
  "Spar":         "spar.png",
  "Vomar":        "vomar.png",
}

export async function laadLogoBase64(supermarkt: string): Promise<string | undefined> {
  const bestand = LOGO_BESTAND[supermarkt]
  if (!bestand) return undefined
  try {
    const buf = await readFile(path.join(process.cwd(), "public/logos", bestand))
    return `data:image/png;base64,${buf.toString("base64")}`
  } catch {
    return undefined
  }
}

export function winnaarUitResultaat(resultaat: unknown): string {
  const r = resultaat as Record<string, unknown>
  if (r && "vergelijking" in r) {
    const verg = r.vergelijking as Record<string, unknown>
    return (verg.goedkoopste_supermarkt as string) ?? ""
  }
  return (r?.goedkoopste_supermarkt as string) ?? ""
}
