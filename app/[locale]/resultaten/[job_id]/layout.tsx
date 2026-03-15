import type { Metadata } from "next"

async function haalResultaat(job_id: string) {
  const API_URL = process.env.SUPERMARKET_API_URL
  const API_KEY = process.env.SUPERMARKET_API_KEY
  if (!API_URL || !API_KEY) return null
  try {
    const resp = await fetch(`${API_URL}/vergelijk/${job_id}`, {
      headers: { "X-API-Key": API_KEY },
      next: { revalidate: 600 },
    })
    if (!resp.ok) return null
    return await resp.json()
  } catch {
    return null
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ job_id: string; locale: string }>
}): Promise<Metadata> {
  const { job_id, locale } = await params
  const isEn = locale === "en"
  const base = "https://www.cheapersupermarkets.com"
  const url = `${base}${isEn ? "/en" : ""}/resultaten/${job_id}`

  const job = await haalResultaat(job_id)

  if (!job || job.status !== "klaar" || !job.resultaat) {
    return {
      title: isEn ? "Comparison results" : "Vergelijkingsresultaten",
      description: isEn
        ? "Real-time price comparison across Dutch supermarkets."
        : "Real-time prijsvergelijking voor Nederlandse supermarkten.",
      alternates: { canonical: url },
    }
  }

  const resultaat = job.resultaat
  const verg = "vergelijking" in resultaat ? resultaat.vergelijking : resultaat
  const aanbevolen: string | undefined = "aanbevolen_supermarkt" in resultaat ? resultaat.aanbevolen_supermarkt : undefined
  const winnaar: string = aanbevolen ?? verg.goedkoopste_supermarkt ?? ""
  const prijs: number | undefined = winnaar ? verg.totaal_per_supermarkt[winnaar] : undefined
  const aantalProducten: number = verg.producten?.length ?? 0
  const aantalSupermarkten: number = Object.keys(verg.totaal_per_supermarkt).length
  const besparing: number | undefined = (verg as Record<string, unknown>).besparing as number | undefined

  const title = winnaar && prijs != null
    ? isEn
      ? `${winnaar} cheapest for ${aantalProducten} products`
      : `${winnaar} goedkoopst voor ${aantalProducten} producten`
    : isEn ? "Comparison results" : "Vergelijkingsresultaten"

  const description = isEn
    ? `Comparison of ${aantalProducten} products at ${aantalSupermarkten} supermarkets.${winnaar ? ` ${winnaar} is cheapest: €${prijs?.toFixed(2)}.` : ""}${besparing && besparing > 0.1 ? ` Save €${besparing.toFixed(2)} compared to the most expensive option.` : ""}`
    : `Vergelijking van ${aantalProducten} producten bij ${aantalSupermarkten} supermarkten.${winnaar ? ` ${winnaar} is goedkoopst: €${prijs?.toFixed(2)}.` : ""}${besparing && besparing > 0.1 ? ` Bespaar €${besparing.toFixed(2)} t.o.v. de duurste optie.` : ""}`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  }
}

export default function ResultatenLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
