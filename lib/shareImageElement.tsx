import type { VergelijkingsResultaat, LocatieResultaat } from "@/lib/api"

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

export interface ShareImageData {
  resultaat: VergelijkingsResultaat | LocatieResultaat
}

const MAX_PRODUCTEN = 9

export function maakShareImageElement({ resultaat }: ShareImageData) {
  const verg: VergelijkingsResultaat = "vergelijking" in resultaat ? resultaat.vergelijking : resultaat
  const aanbevolen: string | undefined = "aanbevolen_supermarkt" in resultaat ? resultaat.aanbevolen_supermarkt : undefined
  const winnaar = aanbevolen ?? verg.goedkoopste_supermarkt ?? Object.keys(verg.totaal_per_supermarkt)[0] ?? "—"
  const prijs = verg.totaal_per_supermarkt[winnaar]
  const besparing = (verg as unknown as Record<string, unknown>).besparing as number | undefined
  const kleur = KLEUREN[winnaar] ?? { bg: "#16a34a", fg: "#fff" }

  const productenRijen = (verg.producten ?? []).map((p) => ({
    naam: p.matches[winnaar]?.naam ?? p.zoekopdracht,
    prijs: p.matches[winnaar]?.prijs ?? null,
  }))
  const tonen = productenRijen.slice(0, MAX_PRODUCTEN)
  const aantalMeer = productenRijen.length - tonen.length
  const aantalProducten = productenRijen.length

  return (
    <div
      style={{
        width: 1080,
        height: 1350,
        display: "flex",
        flexDirection: "column",
        background: "#ffffff",
        fontFamily: "sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "28px 52px",
          background: "linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)",
          borderBottom: "1.5px solid #e5e7eb",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: "#16a34a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
            }}
          >
            🛒
          </div>
          <span style={{ fontSize: 36, fontWeight: 800, color: "#111827" }}>
            Cheaper<span style={{ color: "#16a34a" }}>Supermarkets</span>
          </span>
        </div>
        <div
          style={{
            fontSize: 15,
            color: "#16a34a",
            border: "1.5px solid #bbf7d0",
            borderRadius: 999,
            padding: "4px 14px",
            fontWeight: 600,
          }}
        >
          beta
        </div>
      </div>

      {/* Hero — winnaar */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "36px 52px 28px",
          gap: 16,
          background: "#fafafa",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* Supermarkt badge */}
          <div
            style={{
              width: 76,
              height: 76,
              borderRadius: 20,
              background: kleur.bg,
              color: kleur.fg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 30,
              fontWeight: 800,
              flexShrink: 0,
            }}
          >
            {winnaar.slice(0, 2).toUpperCase()}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontSize: 54, fontWeight: 800, color: "#111827", lineHeight: 1 }}>{winnaar}</span>
            <span style={{ fontSize: 18, color: "#16a34a", fontWeight: 600 }}>★ Goedkoopste keuze</span>
          </div>
        </div>

        {/* Besparing badge */}
        {besparing != null && besparing > 0.1 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              background: "#f0fdf4",
              border: "2px solid #bbf7d0",
              borderRadius: 14,
              padding: "14px 22px",
            }}
          >
            <span style={{ fontSize: 34, fontWeight: 800, color: "#15803d" }}>Bespaar €{besparing.toFixed(2)}</span>
            <span style={{ fontSize: 18, color: "#6b7280" }}>op je boodschappenlijst</span>
          </div>
        )}
      </div>

      {/* Scheidingslijn */}
      <div style={{ height: 2, background: "#e5e7eb", margin: "0 52px" }} />

      {/* Productlijst */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "20px 52px 0" }}>
        <span style={{ fontSize: 17, color: "#6b7280", fontWeight: 600, marginBottom: 10 }}>
          Jouw boodschappenlijst bij {winnaar}:
        </span>

        {tonen.map((p, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 0",
              borderBottom: "1px solid #f3f4f6",
            }}
          >
            <span style={{ fontSize: 20, color: "#374151", maxWidth: 700 }}>{p.naam}</span>
            <span style={{ fontSize: 20, color: "#111827", fontWeight: 700, flexShrink: 0 }}>
              {p.prijs != null ? `€${p.prijs.toFixed(2)}` : "—"}
            </span>
          </div>
        ))}

        {aantalMeer > 0 && (
          <span style={{ fontSize: 17, color: "#9ca3af", marginTop: 8 }}>
            + {aantalMeer} meer {aantalMeer === 1 ? "product" : "producten"}
          </span>
        )}

        {/* Totaalregel */}
        <div style={{ height: 2, background: "#e5e7eb", margin: "16px 0 12px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ fontSize: 22, fontWeight: 700, color: "#111827" }}>
            Totaal ({aantalProducten} {aantalProducten === 1 ? "product" : "producten"})
          </span>
          <span style={{ fontSize: 28, fontWeight: 800, color: "#15803d" }}>
            {prijs != null && isFinite(prijs) ? `€${prijs.toFixed(2)}` : "—"}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "18px 52px",
          background: "#111827",
          marginTop: 24,
        }}
      >
        <span style={{ fontSize: 18, color: "#9ca3af" }}>Gemaakt met </span>
        <span style={{ fontSize: 18, color: "#4ade80", fontWeight: 700, marginLeft: 6 }}>cheapersupermarkets.com</span>
      </div>
    </div>
  )
}
