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
  logoSrc?: string
  appLogoSrc?: string
}

const MAX_PRODUCTEN = 5

const CREAM  = "#FEF9F0"
const CREAM2 = "#F9F0E4"
const DARK   = "#1C0800"
const BC     = "Barlow Condensed, sans-serif"

function fmt(n: number) {
  return `€${n.toFixed(2).replace(".", ",")}`
}

export function maakShareImageElement({ resultaat, logoSrc, appLogoSrc }: ShareImageData) {
  const verg: VergelijkingsResultaat =
    "vergelijking" in resultaat ? resultaat.vergelijking : resultaat
  const aanbevolen: string | undefined =
    "aanbevolen_supermarkt" in resultaat ? resultaat.aanbevolen_supermarkt : undefined
  const winnaar =
    aanbevolen ?? verg.goedkoopste_supermarkt ?? Object.keys(verg.totaal_per_supermarkt)[0] ?? "—"
  const prijs    = verg.totaal_per_supermarkt[winnaar]
  const besparing =
    (verg as unknown as Record<string, unknown>).besparing as number | undefined
  const kleur    = KLEUREN[winnaar] ?? { bg: "#16a34a", fg: "#fff" }
  const gemiddelde =
    besparing != null && prijs != null && isFinite(prijs) ? prijs + besparing : null

  const productenRijen = (verg.producten ?? []).map((p) => ({
    naam:  p.matches[winnaar]?.naam  ?? p.zoekopdracht,
    prijs: p.matches[winnaar]?.prijs ?? null,
  }))
  const tonen          = productenRijen.slice(0, MAX_PRODUCTEN)
  const aantalMeer     = productenRijen.length - tonen.length
  const aantalProducten = productenRijen.length

  // Lichtere variant van de supermarktkleur voor decoratieve elementen
  const kleurLicht = kleur.fg === "#fff"
    ? "rgba(255,255,255,0.12)"
    : "rgba(0,0,0,0.06)"

  return (
    <div
      style={{
        width: 1080, height: 1350,
        display: "flex", flexDirection: "column",
        background: CREAM,
        fontFamily: "sans-serif",
      }}
    >
      {/* ── HERO TOP BAND ── */}
      <div
        style={{
          display: "flex", flexDirection: "column",
          alignItems: "center",
          background: kleur.bg,
          padding: "40px 56px 44px",
          flexShrink: 0,
          position: "relative",
        }}
      >
        {/* Decoratieve cirkels op de achtergrond */}
        <div style={{
          position: "absolute", top: -60, right: -60,
          width: 260, height: 260,
          borderRadius: "50%",
          background: kleurLicht,
          display: "flex",
        }} />
        <div style={{
          position: "absolute", bottom: -80, left: -40,
          width: 200, height: 200,
          borderRadius: "50%",
          background: kleurLicht,
          display: "flex",
        }} />

        {/* App-logo — grote witte cirkel centraal */}
        <div
          style={{
            width: 148, height: 148,
            borderRadius: "50%",
            background: "white",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: 22,
            borderWidth: 4, borderStyle: "solid",
            borderColor: "rgba(255,255,255,0.35)",
          }}
        >
          {appLogoSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={appLogoSrc} width={100} height={100} alt="CheaperSupermarkets" />
          ) : (
            <span style={{ fontSize: 72 }}>🛒</span>
          )}
        </div>

        {/* Brand naam */}
        <span style={{
          fontSize: 46, fontWeight: 900, color: "white",
          fontFamily: BC, letterSpacing: -0.5,
        }}>
          Cheaper
          <span style={{ color: "rgba(255,255,255,0.45)", fontWeight: 700 }}>Supermarkets</span>
        </span>

        {/* Winnaar badge */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          marginTop: 18,
          background: "rgba(255,255,255,0.18)",
          borderRadius: 999,
          padding: "10px 28px",
        }}>
          <span style={{ fontSize: 22, color: "#FDE68A" }}>★</span>
          <span style={{
            fontSize: 22, fontWeight: 700,
            color: "white", letterSpacing: 3, fontFamily: BC,
          }}>
            GOEDKOOPST GEVONDEN
          </span>
          <span style={{ fontSize: 22, color: "#FDE68A" }}>★</span>
        </div>
      </div>

      {/* ── SUPERMARKT HERO ── */}
      <div
        style={{
          display: "flex", alignItems: "center",
          gap: 24, padding: "28px 56px 24px",
          background: CREAM2,
          flexShrink: 0,
        }}
      >
        {/* Supermarkt logo */}
        <div
          style={{
            width: 96, height: 96,
            borderRadius: 22,
            background: "white",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
            borderWidth: 2, borderStyle: "solid", borderColor: "#EDE3DA",
          }}
        >
          {logoSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoSrc} width={74} height={74} alt={winnaar} />
          ) : (
            <span style={{ fontSize: 36, fontWeight: 900, color: kleur.bg, fontFamily: BC }}>
              {winnaar.slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>

        {/* Naam */}
        <span style={{
          fontSize: 82, fontWeight: 900,
          color: kleur.bg, lineHeight: 1, letterSpacing: -2, fontFamily: BC,
        }}>
          {winnaar}
        </span>
      </div>

      {/* ── BESPARING ── */}
      <div
        style={{
          display: "flex", flexDirection: "column",
          padding: "28px 56px 0",
          flexShrink: 0,
        }}
      >
        <span style={{
          fontSize: 19, fontWeight: 700,
          letterSpacing: 5, color: kleur.bg, opacity: 0.65,
        }}>
          {besparing != null ? "BESPARING T.O.V. GEMIDDELDE" : "TOTAALPRIJS"}
        </span>
        <span style={{
          fontSize: 164, fontWeight: 900,
          color: kleur.bg, lineHeight: 0.88, letterSpacing: -4,
          fontFamily: BC,
        }}>
          {besparing != null ? fmt(besparing) : (prijs != null && isFinite(prijs) ? fmt(prijs) : "—")}
        </span>
        <span style={{
          fontSize: 26, fontWeight: 400,
          color: "#8a6a55", marginTop: 14,
        }}>
          op {aantalProducten} {aantalProducten === 1 ? "product" : "producten"}
        </span>
      </div>

      {/* ── VERGELIJKINGSBALK ── */}
      {gemiddelde != null && isFinite(gemiddelde) && (
        <div
          style={{
            display: "flex", alignItems: "stretch",
            margin: "24px 56px 0",
            borderRadius: 20,
            borderWidth: 2, borderStyle: "solid", borderColor: "#EDE3DA",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          <div style={{
            display: "flex", flexDirection: "column", gap: 4,
            padding: "18px 28px", flexGrow: 1, background: "#FFF7F2",
          }}>
            <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: 2, color: "#c4927e" }}>
              GEMIDDELD ELDERS
            </span>
            <span style={{
              fontSize: 64, fontWeight: 900, color: "#c4927e",
              letterSpacing: -2, textDecoration: "line-through", fontFamily: BC,
            }}>
              {fmt(gemiddelde)}
            </span>
          </div>
          <div style={{
            display: "flex", alignItems: "center",
            padding: "0 16px", background: "#FFF7F2",
          }}>
            <span style={{ fontSize: 36, color: kleur.bg, fontWeight: 700, opacity: 0.35 }}>→</span>
          </div>
          <div style={{
            display: "flex", flexDirection: "column", gap: 4,
            padding: "18px 28px", background: kleur.bg,
          }}>
            <span style={{
              fontSize: 17, fontWeight: 700,
              letterSpacing: 2, color: "rgba(255,255,255,0.55)",
            }}>
              BIJ {winnaar.toUpperCase()}
            </span>
            <span style={{
              fontSize: 64, fontWeight: 900, color: "white",
              letterSpacing: -2, fontFamily: BC,
            }}>
              {prijs != null && isFinite(prijs) ? fmt(prijs) : "—"}
            </span>
          </div>
        </div>
      )}

      {/* ── PRODUCTENLIJST ── */}
      <div
        style={{
          flex: 1, display: "flex", flexDirection: "column",
          padding: "20px 56px 0",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", gap: 16, marginBottom: 8,
        }}>
          <div style={{ flex: 1, height: 1, background: "#EDE3DA", display: "flex" }} />
          <span style={{
            fontSize: 17, fontWeight: 700, letterSpacing: 3, color: "#C4A898",
          }}>
            JOUW LIJST
          </span>
          <div style={{ flex: 1, height: 1, background: "#EDE3DA", display: "flex" }} />
        </div>

        {tonen.map((p, i) => (
          <div
            key={i}
            style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "11px 0",
              borderBottomWidth: 1, borderBottomStyle: "solid", borderBottomColor: "#F0E8E0",
            }}
          >
            <span style={{ fontSize: 24, color: "#3a2a1a", fontWeight: 400, maxWidth: 680 }}>
              {p.naam}
            </span>
            <span style={{
              fontSize: 26, fontWeight: 700, color: kleur.bg, flexShrink: 0, fontFamily: BC,
            }}>
              {p.prijs != null ? fmt(p.prijs) : "—"}
            </span>
          </div>
        ))}

        {aantalMeer > 0 && (
          <span style={{ fontSize: 22, color: "#B8A898", marginTop: 10, fontWeight: 400 }}>
            + {aantalMeer} meer {aantalMeer === 1 ? "product" : "producten"}
          </span>
        )}

      </div>

      {/* ── FOOTER ── */}
      <div
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 56px",
          height: 76,
          background: DARK,
          flexShrink: 0,
          marginTop: 20,
        }}
      >
        <span style={{ fontSize: 21, color: "#6b4a38", fontWeight: 400 }}>
          Begin vandaag nog met besparen
        </span>
        <span style={{
          fontSize: 24, fontWeight: 700, color: "#4ade80",
          letterSpacing: -0.5, fontFamily: BC,
        }}>
          cheapersupermarkets.com →
        </span>
      </div>
    </div>
  )
}
