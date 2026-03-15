import type { VergelijkingsResultaat, LocatieResultaat } from "@/lib/api"

const KLEUREN: Record<string, { bg: string; fg: string }> = {
  "Albert Heijn": { bg: "#0057A8", fg: "#fff" },
  "Jumbo":        { bg: "#E6A800", fg: "#222" },
  "Dirk":         { bg: "#B91C1C", fg: "#fff" },
  "Aldi":         { bg: "#003087", fg: "#fff" },
  "Ekoplaza":     { bg: "#3D8127", fg: "#fff" },
  "Dekamarkt":    { bg: "#E8511E", fg: "#fff" },
  "Spar":         { bg: "#007B3E", fg: "#fff" },
  "Vomar":        { bg: "#00387A", fg: "#fff" },
}

export interface ShareImageData {
  resultaat: VergelijkingsResultaat | LocatieResultaat
  logoSrc?: string  // base64 data URI van het supermarktlogo
}

const MAX_PRODUCTEN = 8
const CREAM = "#FEF9F0"
const DARK = "#1C0800"

export function maakShareImageElement({ resultaat, logoSrc }: ShareImageData) {
  const verg: VergelijkingsResultaat = "vergelijking" in resultaat ? resultaat.vergelijking : resultaat
  const aanbevolen: string | undefined = "aanbevolen_supermarkt" in resultaat ? resultaat.aanbevolen_supermarkt : undefined
  const winnaar = aanbevolen ?? verg.goedkoopste_supermarkt ?? Object.keys(verg.totaal_per_supermarkt)[0] ?? "—"
  const prijs = verg.totaal_per_supermarkt[winnaar]
  const besparing = (verg as unknown as Record<string, unknown>).besparing as number | undefined
  const kleur = KLEUREN[winnaar] ?? { bg: "#16a34a", fg: "#fff" }
  const gemiddelde = (besparing != null && prijs != null && isFinite(prijs)) ? prijs + besparing : null

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
        background: CREAM,
        fontFamily: "sans-serif",
      }}
    >
      {/* ── TOP: supermarkt-kleur band ── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "36px 52px 32px",
          background: kleur.bg,
          flexShrink: 0,
        }}
      >
        {/* Branding row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 34, fontWeight: 700, color: "white" }}>
            Cheaper
            <span style={{ color: "rgba(255,255,255,0.45)", fontWeight: 600 }}>Supermarkets</span>
          </span>
          <span
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: "rgba(255,255,255,0.75)",
              border: "2px solid rgba(255,255,255,0.28)",
              borderRadius: 999,
              padding: "5px 18px",
            }}
          >
            beta
          </span>
        </div>

        {/* Supermarkt row */}
        <div style={{ display: "flex", alignItems: "center", gap: 24, marginTop: 24 }}>
          {/* Logo of fallback initialen */}
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 20,
              background: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              overflow: "hidden",
            }}
          >
            {logoSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoSrc} width={76} height={76} alt={winnaar} style={{ objectFit: "contain" }} />
            ) : (
              <span style={{ fontSize: 34, fontWeight: 900, color: kleur.bg }}>
                {winnaar.slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <span
              style={{
                fontSize: 78,
                fontWeight: 900,
                color: "white",
                lineHeight: 1,
                letterSpacing: -2,
              }}
            >
              {winnaar}
            </span>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "rgba(255,255,255,0.15)",
                borderRadius: 10,
                padding: "6px 16px",
              }}
            >
              <span style={{ fontSize: 20, color: "#FDE68A" }}>★</span>
              <span
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: "white",
                  letterSpacing: 1.2,
                }}
              >
                GOEDKOOPSTE KEUZE
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "30px 52px 0",
        }}
      >
        {/* Besparings-hero */}
        <div style={{ display: "flex", flexDirection: "column", marginBottom: 22 }}>
          <span
            style={{
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: 4,
              color: kleur.bg,
              opacity: 0.55,
              marginBottom: 0,
            }}
          >
            BESPARING
          </span>
          <span
            style={{
              fontSize: 152,
              fontWeight: 900,
              color: kleur.bg,
              lineHeight: 0.88,
              letterSpacing: -4,
            }}
          >
            {besparing != null ? `€${besparing.toFixed(2)}` : `€${prijs != null && isFinite(prijs) ? prijs.toFixed(2) : "—"}`}
          </span>
          <span style={{ fontSize: 24, fontWeight: 500, color: "#8a6a55", marginTop: 10 }}>
            op je boodschappenlijst van {aantalProducten} producten
          </span>
        </div>

        {/* Prijsvergelijkingsbalk */}
        {gemiddelde != null && isFinite(gemiddelde) && (
          <div
            style={{
              display: "flex",
              alignItems: "stretch",
              borderRadius: 16,
              border: "2px solid #F0D0C5",
              overflow: "hidden",
              marginBottom: 26,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
                padding: "16px 22px",
                flex: 1,
                background: "#FFF5F2",
              }}
            >
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  letterSpacing: 1.5,
                  color: "#c4927e",
                }}
              >
                GEMIDDELD ELDERS
              </span>
              <span
                style={{
                  fontSize: 44,
                  fontWeight: 900,
                  color: "#c4927e",
                  letterSpacing: -1,
                  textDecoration: "line-through",
                }}
              >
                €{gemiddelde.toFixed(2)}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "0 14px",
                background: "#FFF5F2",
              }}
            >
              <span style={{ fontSize: 28, color: kleur.bg, fontWeight: 700, opacity: 0.4 }}>→</span>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
                padding: "16px 22px",
                background: kleur.bg,
              }}
            >
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  letterSpacing: 1.5,
                  color: "rgba(255,255,255,0.55)",
                }}
              >
                BIJ {winnaar.toUpperCase()}
              </span>
              <span
                style={{
                  fontSize: 44,
                  fontWeight: 900,
                  color: "white",
                  letterSpacing: -1,
                }}
              >
                €{prijs != null && isFinite(prijs) ? prijs.toFixed(2) : "—"}
              </span>
            </div>
          </div>
        )}

        {/* Divider */}
        <div style={{ height: 2, background: "#EDE3DA", marginBottom: 14 }} />

        {/* Productenlijst */}
        <span
          style={{
            fontSize: 17,
            fontWeight: 700,
            letterSpacing: 3,
            color: "#C4A898",
            marginBottom: 6,
          }}
        >
          JOUW LIJST
        </span>

        {tonen.map((p, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "8px 0",
              borderBottom: "1px solid #F0E8E0",
            }}
          >
            <span style={{ fontSize: 21, color: "#3a2a1a", fontWeight: 500, maxWidth: 680 }}>{p.naam}</span>
            <span style={{ fontSize: 21, fontWeight: 700, color: "#1c0a00", flexShrink: 0 }}>
              {p.prijs != null ? `€${p.prijs.toFixed(2)}` : "—"}
            </span>
          </div>
        ))}

        {aantalMeer > 0 && (
          <span style={{ fontSize: 19, color: "#B8A898", marginTop: 7, fontWeight: 500 }}>
            + {aantalMeer} meer {aantalMeer === 1 ? "product" : "producten"}
          </span>
        )}

        {/* Totaalregel */}
        <div style={{ height: 2, background: "#EDE3DA", marginTop: 14 }} />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            padding: "12px 0",
          }}
        >
          <span style={{ fontSize: 25, fontWeight: 600, color: "#3a2a1a" }}>
            Totaal ({aantalProducten} {aantalProducten === 1 ? "product" : "producten"})
          </span>
          <span style={{ fontSize: 50, fontWeight: 900, color: kleur.bg, letterSpacing: -1 }}>
            {prijs != null && isFinite(prijs) ? `€${prijs.toFixed(2)}` : "—"}
          </span>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 52px",
          background: DARK,
        }}
      >
        <span style={{ fontSize: 21, color: "#6b4a38", fontWeight: 500 }}>Begin vandaag nog met besparen</span>
        <span style={{ fontSize: 23, fontWeight: 700, color: "#4ade80" }}>cheapersupermarkets.com →</span>
      </div>
    </div>
  )
}
