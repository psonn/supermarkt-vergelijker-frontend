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
  logoSrc?: string     // base64 supermarkt-logo
  appLogoSrc?: string  // base64 CheaperSupermarkets app-logo
}

// Maximaal 5 producten zodat alles in 1350px hoogte past
const MAX_PRODUCTEN = 5

const CREAM = "#FEF9F0"
const DARK  = "#1C0800"

// Nederlandse decimale opmaak
function fmt(n: number) {
  return `€${n.toFixed(2).replace(".", ",")}`
}

// Alles staat op 1080×1350px canvas (= 2× de 540×675 HTML-mockup).
// Alle waarden zijn dus 2× de waarden in dirk-social-image.html.

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
  const tonen       = productenRijen.slice(0, MAX_PRODUCTEN)
  const aantalMeer  = productenRijen.length - tonen.length
  const aantalProducten = productenRijen.length

  const BC = "Barlow Condensed, sans-serif"  // condensed font — alleen geladen als fontData beschikbaar

  return (
    <div
      style={{
        width: 1080, height: 1350,
        display: "flex", flexDirection: "column",
        background: CREAM,
        fontFamily: "sans-serif",
      }}
    >
      {/* ── TOP BAND (supermarkt-kleur) ── */}
      <div
        style={{
          display: "flex", flexDirection: "column",
          padding: "36px 56px 32px",
          background: kleur.bg,
          flexShrink: 0,
        }}
      >
        {/* Branding */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            {appLogoSrc && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={appLogoSrc}
                width={60} height={60}
                alt="logo"
                style={{ borderRadius: 14, flexShrink: 0 }}
              />
            )}
            <span style={{ fontSize: 40, fontWeight: 700, color: "white", fontFamily: BC, letterSpacing: -0.5 }}>
              Cheaper
              <span style={{ color: "rgba(255,255,255,0.45)", fontWeight: 600 }}>Supermarkets</span>
            </span>
          </div>
          <span
            style={{
              fontSize: 20, fontWeight: 600,
              color: "rgba(255,255,255,0.75)",
              border: "2.5px solid rgba(255,255,255,0.28)",
              borderRadius: 999, padding: "6px 20px",
            }}
          >
            beta
          </span>
        </div>

        {/* Supermarkt hero */}
        <div style={{ display: "flex", alignItems: "center", gap: 28, marginTop: 28 }}>
          {/* Logo box */}
          <div
            style={{
              width: 112, height: 112,
              borderRadius: 24,
              background: "white",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, overflow: "hidden",
            }}
          >
            {logoSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoSrc} width={88} height={88} alt={winnaar} style={{ objectFit: "contain" }} />
            ) : (
              <span style={{ fontSize: 40, fontWeight: 900, color: kleur.bg, fontFamily: BC }}>
                {winnaar.slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <span style={{ fontSize: 96, fontWeight: 900, color: "white", lineHeight: 1, letterSpacing: -2, fontFamily: BC }}>
              {winnaar}
            </span>
            <div
              style={{
                display: "flex", alignItems: "center", gap: 12,
                background: "rgba(255,255,255,0.15)",
                borderRadius: 12, padding: "8px 22px",
              }}
            >
              <span style={{ fontSize: 24, color: "#FDE68A" }}>★</span>
              <span style={{ fontSize: 24, fontWeight: 700, color: "white", letterSpacing: 2, fontFamily: BC }}>
                GOEDKOOPSTE KEUZE
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div
        style={{
          flex: 1, display: "flex", flexDirection: "column",
          padding: "36px 56px 0",
        }}
      >
        {/* Besparing hero */}
        <div style={{ display: "flex", flexDirection: "column", marginBottom: 28 }}>
          <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: 5, color: kleur.bg, opacity: 0.6 }}>
            BESPARING
          </span>
          <span
            style={{
              fontSize: 192, fontWeight: 900,
              color: kleur.bg, lineHeight: 0.88, letterSpacing: -5,
              fontFamily: BC,
            }}
          >
            {besparing != null ? fmt(besparing) : (prijs != null && isFinite(prijs) ? fmt(prijs) : "—")}
          </span>
          <span style={{ fontSize: 28, fontWeight: 400, color: "#8a6a55", marginTop: 18 }}>
            op je boodschappenlijst van {aantalProducten} producten
          </span>
        </div>

        {/* Prijsvergelijkingsbalk */}
        {gemiddelde != null && isFinite(gemiddelde) && (
          <div
            style={{
              display: "flex", alignItems: "stretch",
              borderRadius: 24, border: "3px solid #F0D0C5",
              overflow: "hidden", marginBottom: 32,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "24px 36px", flex: 1, background: "#FFF5F2" }}>
              <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: 2, color: "#c4927e" }}>
                GEMIDDELD ELDERS
              </span>
              <span style={{ fontSize: 76, fontWeight: 900, color: "#c4927e", letterSpacing: -2, textDecoration: "line-through", fontFamily: BC }}>
                {fmt(gemiddelde)}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", padding: "0 20px", background: "#FFF5F2" }}>
              <span style={{ fontSize: 40, color: kleur.bg, fontWeight: 700, opacity: 0.4 }}>→</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "24px 36px", background: kleur.bg }}>
              <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: 2, color: "rgba(255,255,255,0.55)" }}>
                BIJ {winnaar.toUpperCase()}
              </span>
              <span style={{ fontSize: 76, fontWeight: 900, color: "white", letterSpacing: -2, fontFamily: BC }}>
                {prijs != null && isFinite(prijs) ? fmt(prijs) : "—"}
              </span>
            </div>
          </div>
        )}

        {/* Divider */}
        <div style={{ height: 2, background: "#EDE3DA", marginBottom: 20 }} />

        {/* Productenlijst */}
        <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: 3, color: "#C4A898", marginBottom: 10 }}>
          JOUW LIJST
        </span>

        {tonen.map((p, i) => (
          <div
            key={i}
            style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "13px 0", borderBottom: "1.5px solid #F0E8E0",
            }}
          >
            <span style={{ fontSize: 26, color: "#3a2a1a", fontWeight: 400, maxWidth: 680 }}>
              {p.naam}
            </span>
            <span style={{ fontSize: 28, fontWeight: 700, color: "#1c0a00", flexShrink: 0, fontFamily: BC }}>
              {p.prijs != null ? fmt(p.prijs) : "—"}
            </span>
          </div>
        ))}

        {aantalMeer > 0 && (
          <span style={{ fontSize: 24, color: "#B8A898", marginTop: 12, fontWeight: 400 }}>
            + {aantalMeer} meer {aantalMeer === 1 ? "product" : "producten"}
          </span>
        )}

        {/* Totaalregel */}
        <div style={{ height: 2, background: "#EDE3DA", marginTop: 20 }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "16px 0" }}>
          <span style={{ fontSize: 30, fontWeight: 500, color: "#3a2a1a" }}>
            Totaal ({aantalProducten} {aantalProducten === 1 ? "product" : "producten"})
          </span>
          <span style={{ fontSize: 76, fontWeight: 900, color: kleur.bg, letterSpacing: -2, fontFamily: BC }}>
            {prijs != null && isFinite(prijs) ? fmt(prijs) : "—"}
          </span>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "22px 56px",
          background: DARK,
        }}
      >
        <span style={{ fontSize: 22, color: "#6b4a38", fontWeight: 400 }}>
          Begin vandaag nog met besparen
        </span>
        <span style={{ fontSize: 26, fontWeight: 700, color: "#4ade80", letterSpacing: -0.5, fontFamily: BC }}>
          cheapersupermarkets.com →
        </span>
      </div>
    </div>
  )
}
