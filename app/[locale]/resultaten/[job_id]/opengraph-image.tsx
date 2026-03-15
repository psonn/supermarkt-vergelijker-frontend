import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "CheaperSupermarkets — Vergelijkingsresultaten"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

async function haalResultaat(job_id: string) {
  const API_URL = process.env.SUPERMARKET_API_URL
  const API_KEY = process.env.SUPERMARKET_API_KEY
  if (!API_URL || !API_KEY) return null
  try {
    const resp = await fetch(`${API_URL}/vergelijk/${job_id}`, {
      headers: { "X-API-Key": API_KEY },
      // cache 10 minuten — job is klaar of niet
      next: { revalidate: 600 },
    })
    if (!resp.ok) return null
    return await resp.json()
  } catch {
    return null
  }
}

export default async function Image({ params }: { params: Promise<{ job_id: string }> }) {
  const { job_id } = await params
  const job = await haalResultaat(job_id)

  // Fallback als job nog niet klaar of niet gevonden
  if (!job || job.status !== "klaar" || !job.resultaat) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #f0fdf4 0%, #ffffff 50%, #f0fdf4 100%)",
            fontFamily: "sans-serif",
          }}
        >
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, #bbf7d0 1px, transparent 1px)", backgroundSize: "32px 32px", opacity: 0.4 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>🛒</div>
            <span style={{ fontSize: 44, fontWeight: 800, color: "#111827" }}>
              Cheaper<span style={{ color: "#16a34a" }}>Supermarkets</span>
            </span>
          </div>
          <div style={{ fontSize: 32, color: "#6b7280", fontWeight: 600 }}>Vergelijkingsresultaten</div>
          <div style={{ fontSize: 22, color: "#9ca3af", marginTop: 12 }}>Real-time prijsvergelijking voor Nederlandse supermarkten</div>
        </div>
      ),
      { ...size }
    )
  }

  const resultaat = job.resultaat
  const verg = "vergelijking" in resultaat ? resultaat.vergelijking : resultaat
  const aanbevolen: string | undefined = "aanbevolen_supermarkt" in resultaat ? resultaat.aanbevolen_supermarkt : undefined
  const winnaar: string = aanbevolen ?? verg.goedkoopste_supermarkt ?? Object.keys(verg.totaal_per_supermarkt)[0] ?? "—"
  const prijs: number | undefined = verg.totaal_per_supermarkt[winnaar]
  const aantalProducten: number = verg.producten?.length ?? 0
  const aantalSupermarkten: number = Object.keys(verg.totaal_per_supermarkt).length
  const besparing: number | undefined = (verg as Record<string, unknown>).besparing as number | undefined

  // Supermarkt naam → korte initiaal-kleur
  const KLEUREN: Record<string, { bg: string; fg: string }> = {
    "Albert Heijn": { bg: "#0057A8", fg: "#fff" },
    "Jumbo":        { bg: "#FFC800", fg: "#222" },
    "Dirk":         { bg: "#D91B1B", fg: "#fff" },
    "Aldi":         { bg: "#003087", fg: "#fff" },
    "Ekoplaza":     { bg: "#3D8127", fg: "#fff" },
    "Dekamarkt":    { bg: "#E8511E", fg: "#fff" },
    "Spar":         { bg: "#007B3E", fg: "#fff" },
    "Vomar":        { bg: "#00387A", fg: "#fff" },
  }
  const winnaarKleur = KLEUREN[winnaar] ?? { bg: "#16a34a", fg: "#fff" }
  const supermarkten = Object.keys(verg.totaal_per_supermarkt)

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(145deg, #f0fdf4 0%, #ffffff 60%, #f0fdf4 100%)",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Achtergrond dot-patroon */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, #bbf7d0 1px, transparent 1px)", backgroundSize: "32px 32px", opacity: 0.45 }} />

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "36px 56px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>🛒</div>
            <span style={{ fontSize: 34, fontWeight: 800, color: "#111827" }}>
              Cheaper<span style={{ color: "#16a34a" }}>Supermarkets</span>
            </span>
          </div>
          <div style={{ fontSize: 18, color: "#6b7280", border: "1.5px solid #d1fae5", borderRadius: 999, padding: "6px 16px", background: "#f0fdf4" }}>
            real-time prijzen
          </div>
        </div>

        {/* Hoofdinhoud */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, padding: "0 56px" }}>
          {/* Subtekst boven naam */}
          <div style={{ fontSize: 22, color: "#6b7280", fontWeight: 500, marginBottom: 4 }}>
            Goedkoopste supermarkt voor {aantalProducten} {aantalProducten === 1 ? "product" : "producten"}
          </div>

          {/* Winnaar */}
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 18,
                background: winnaarKleur.bg,
                color: winnaarKleur.fg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              {winnaar.slice(0, 2).toUpperCase()}
            </div>
            <span style={{ fontSize: 64, fontWeight: 800, color: "#111827", lineHeight: 1 }}>{winnaar}</span>
          </div>

          {/* Prijs */}
          {prijs != null && isFinite(prijs) && (
            <div style={{ fontSize: 56, fontWeight: 800, color: "#16a34a", lineHeight: 1, marginTop: 4 }}>
              €{prijs.toFixed(2)}
            </div>
          )}

          {/* Besparing + supermarkten */}
          <div style={{ display: "flex", alignItems: "center", gap: 24, marginTop: 12, fontSize: 22, color: "#6b7280" }}>
            {besparing != null && besparing > 0.1 && (
              <>
                <span style={{ color: "#15803d", fontWeight: 600 }}>✓ Bespaar €{besparing.toFixed(2)}</span>
                <span>·</span>
              </>
            )}
            <span>{aantalSupermarkten} supermarkten vergeleken</span>
          </div>
        </div>

        {/* Supermarkt-pills onderaan */}
        <div style={{ display: "flex", gap: 10, padding: "0 56px 28px", flexWrap: "wrap" }}>
          {supermarkten.slice(0, 7).map((sm) => {
            const kleur = KLEUREN[sm]
            const isWinnaar = sm === winnaar
            return (
              <div
                key={sm}
                style={{
                  padding: "6px 18px",
                  borderRadius: 999,
                  background: isWinnaar ? winnaarKleur.bg : "#f3f4f6",
                  color: isWinnaar ? winnaarKleur.fg : "#4b5563",
                  border: isWinnaar ? "none" : "1.5px solid #e5e7eb",
                  fontSize: 18,
                  fontWeight: isWinnaar ? 700 : 500,
                  ...(kleur && !isWinnaar ? {} : {}),
                }}
              >
                {sm}
              </div>
            )
          })}
        </div>

        {/* Footer strip */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "12px 56px", background: "#f9fafb", borderTop: "1px solid #e5e7eb" }}>
          <span style={{ fontSize: 17, color: "#9ca3af" }}>cheapersupermarkets.com</span>
        </div>
      </div>
    ),
    { ...size }
  )
}
