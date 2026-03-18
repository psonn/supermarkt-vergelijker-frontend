import type { VergelijkingsResultaat, LocatieResultaat } from "@/lib/api"

const KLEUREN: Record<string, { bg: string; fg: string; licht: string }> = {
  "Albert Heijn": { bg: "#0057A8", fg: "#fff", licht: "#dbeafe" },
  "Jumbo":        { bg: "#E6A800", fg: "#1a1200", licht: "#fef3c7" },
  "Dirk":         { bg: "#B91C1C", fg: "#fff", licht: "#fee2e2" },
  "Aldi":         { bg: "#003087", fg: "#fff", licht: "#dbeafe" },
  "Ekoplaza":     { bg: "#3D8127", fg: "#fff", licht: "#dcfce7" },
  "Dekamarkt":    { bg: "#E8511E", fg: "#fff", licht: "#ffedd5" },
  "Spar":         { bg: "#007B3E", fg: "#fff", licht: "#d1fae5" },
  "Vomar":        { bg: "#00387A", fg: "#fff", licht: "#dbeafe" },
}

export interface ShareImageData {
  resultaat: VergelijkingsResultaat | LocatieResultaat
  logoSrc?: string
  appLogoSrc?: string
  variant?: "wauw" | "standaard"
  lang?: string
}

const MAX_PRODUCTEN = 5
const BC = "Barlow Condensed, sans-serif"

function fmt(n: number) {
  return `€${n.toFixed(2).replace(".", ",")}`
}

function s(lang: string) {
  const nl = {
    wauwRegel1: "Wauw! Ik bespaar",
    wauwRegel2: "op mijn boodschappenlijstje! 🎉",
    goedkoopsteOptie: "💰 Goedkoopste optie",
    mijnLijst: "MIJN LIJST",
    meerProducten: (n: number) => `+ ${n} meer ${n === 1 ? "product" : "producten"}`,
    footerTitel: "Bespaar ook via CheaperSupermarkets.com",
    footerSub: (n: number) => `Vergelijk gratis jouw boodschappenlijst · ${n} producten · alle supermarkten`,
    besparingLabel: "BESPARING T.O.V. GEMIDDELDE",
    totaalprijs: "TOTAALPRIJS",
    opProducten: (n: number) => `op ${n} ${n === 1 ? "product" : "producten"}`,
    gemiddeldElders: "GEMIDDELD ELDERS",
    bij: (naam: string) => `BIJ ${naam.toUpperCase()}`,
    jouwLijst: "JOUW LIJST",
    meerStandaard: (n: number) => `+ ${n} meer ${n === 1 ? "product" : "producten"}`,
    beginTekst: "Begin vandaag nog met besparen",
  }
  const en = {
    wauwRegel1: "Wow! I saved",
    wauwRegel2: "on my shopping list! 🎉",
    goedkoopsteOptie: "💰 Cheapest option",
    mijnLijst: "MY LIST",
    meerProducten: (n: number) => `+ ${n} more ${n === 1 ? "product" : "products"}`,
    footerTitel: "Save as well with CheaperSupermarkets.com",
    footerSub: (n: number) => `Free price comparison for your shopping list · ${n} products · all supermarkets`,
    besparingLabel: "SAVINGS VS. AVERAGE",
    totaalprijs: "TOTAL PRICE",
    opProducten: (n: number) => `on ${n} ${n === 1 ? "product" : "products"}`,
    gemiddeldElders: "AVERAGE ELSEWHERE",
    bij: (naam: string) => `AT ${naam.toUpperCase()}`,
    jouwLijst: "YOUR LIST",
    meerStandaard: (n: number) => `+ ${n} more ${n === 1 ? "product" : "products"}`,
    beginTekst: "Start saving today",
  }
  return lang === "en" ? en : nl
}

export function maakShareImageElement({ resultaat, logoSrc, appLogoSrc, variant = "wauw", lang = "nl" }: ShareImageData) {
  const verg: VergelijkingsResultaat =
    "vergelijking" in resultaat ? resultaat.vergelijking : resultaat
  const aanbevolen: string | undefined =
    "aanbevolen_supermarkt" in resultaat ? resultaat.aanbevolen_supermarkt : undefined
  const winnaar =
    aanbevolen ?? verg.goedkoopste_supermarkt ?? Object.keys(verg.totaal_per_supermarkt)[0] ?? "—"
  const prijs      = verg.totaal_per_supermarkt[winnaar]
  const besparing  = (verg as unknown as Record<string, unknown>).besparing as number | undefined
  const kleur      = KLEUREN[winnaar] ?? { bg: "#16a34a", fg: "#fff", licht: "#dcfce7" }
  const gemiddelde = besparing != null && prijs != null && isFinite(prijs) ? prijs + besparing : null

  const productenRijen = (verg.producten ?? []).map((p) => ({
    naam:  p.matches[winnaar]?.naam  ?? p.zoekopdracht,
    prijs: p.matches[winnaar]?.prijs ?? null,
  }))
  const tonen       = productenRijen.slice(0, MAX_PRODUCTEN)
  const aantalMeer  = productenRijen.length - tonen.length
  const aantalProducten = productenRijen.length

  const besparingsBedrag = besparing != null
    ? fmt(besparing)
    : (prijs != null && isFinite(prijs) ? fmt(prijs) : "—")

  const str = s(lang)

  if (variant === "wauw") {
    return maakWauwVariant({ winnaar, prijs, gemiddelde, kleur, logoSrc, appLogoSrc, tonen, aantalMeer, aantalProducten, besparingsBedrag, str })
  }

  // ── STANDAARD VARIANT ──
  return (
    <div style={{
      width: 1080, height: 1350,
      display: "flex", flexDirection: "column",
      background: "#ffffff",
      fontFamily: "sans-serif",
    }}>

      {/* ── TOP BAND (supermarktkleur) ── */}
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        background: kleur.bg,
        padding: "44px 60px 40px",
        flexShrink: 0,
        position: "relative",
      }}>
        {/* Decoratieve cirkel rechtsboven */}
        <div style={{
          position: "absolute", top: -80, right: -80,
          width: 300, height: 300, borderRadius: "50%",
          background: kleur.fg === "#fff" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.07)",
          display: "flex",
        }} />
        <div style={{
          position: "absolute", bottom: -60, left: -60,
          width: 200, height: 200, borderRadius: "50%",
          background: kleur.fg === "#fff" ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)",
          display: "flex",
        }} />

        {/* App-logo — grote witte cirkel */}
        <div style={{
          width: 160, height: 160, borderRadius: "50%",
          background: "white",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 20,
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
        }}>
          {appLogoSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={appLogoSrc} width={110} height={110} alt="CheaperSupermarkets" />
          ) : (
            <span style={{ fontSize: 80 }}>🛒</span>
          )}
        </div>

        {/* Brand naam */}
        <span style={{
          fontFamily: BC, fontSize: 54, fontWeight: 900,
          color: "white", letterSpacing: -0.5, lineHeight: 1,
        }}>
          Cheaper
          <span style={{
            color: kleur.fg === "#fff" ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.35)",
            fontWeight: 700,
          }}>
            Supermarkets
          </span>
        </span>
      </div>

      {/* ── SUPERMARKT HERO ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 28,
        padding: "32px 60px 28px",
        background: kleur.licht,
        flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{
          width: 108, height: 108, borderRadius: 24,
          background: "white",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
          boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
        }}>
          {logoSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoSrc} width={82} height={82} alt={winnaar} />
          ) : (
            <span style={{
              fontFamily: BC, fontSize: 38, fontWeight: 900, color: kleur.bg,
            }}>
              {winnaar.slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>

        {/* Naam */}
        <span style={{
          fontFamily: BC, fontSize: 88, fontWeight: 900,
          color: kleur.bg, lineHeight: 1, letterSpacing: -2, flex: 1,
        }}>
          {winnaar}
        </span>

        {/* Goedkoopst badge */}
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 44 }}>💰</span>
          <span style={{
            fontFamily: BC, fontSize: 16, fontWeight: 700,
            color: kleur.bg, letterSpacing: 2, opacity: 0.7,
          }}>
            GOEDKOOPST
          </span>
        </div>
      </div>

      {/* ── BESPARING ── */}
      <div style={{
        display: "flex", flexDirection: "column",
        padding: "28px 60px 0",
        flexShrink: 0,
      }}>
        <span style={{
          fontSize: 19, fontWeight: 700, letterSpacing: 5,
          color: kleur.bg, opacity: 0.5,
        }}>
          {besparing != null ? str.besparingLabel : str.totaalprijs}
        </span>
        <span style={{
          fontFamily: BC, fontSize: 160, fontWeight: 900,
          color: kleur.bg, lineHeight: 0.88, letterSpacing: -4,
        }}>
          {besparingsBedrag}
        </span>
        <span style={{
          fontSize: 26, color: "#777", marginTop: 14,
        }}>
          {str.opProducten(aantalProducten)}
        </span>
      </div>

      {/* ── VERGELIJKINGSBALK ── */}
      {gemiddelde != null && isFinite(gemiddelde) && (
        <div style={{
          display: "flex", alignItems: "stretch",
          margin: "24px 60px 0",
          borderRadius: 20,
          borderWidth: 2, borderStyle: "solid", borderColor: "#e5e7eb",
          overflow: "hidden",
          flexShrink: 0,
        }}>
          <div style={{
            display: "flex", flexDirection: "column", gap: 4,
            padding: "18px 28px", flex: 1, background: "#f9fafb",
          }}>
            <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: 2, color: "#9ca3af" }}>
              {str.gemiddeldElders}
            </span>
            <span style={{
              fontFamily: BC, fontSize: 62, fontWeight: 900,
              color: "#374151", letterSpacing: -2, textDecoration: "line-through",
            }}>
              {fmt(gemiddelde)}
            </span>
          </div>
          <div style={{
            display: "flex", alignItems: "center",
            padding: "0 16px", background: "#f9fafb",
          }}>
            <span style={{ fontSize: 32, color: kleur.bg, opacity: 0.4, fontWeight: 700 }}>→</span>
          </div>
          <div style={{
            display: "flex", flexDirection: "column", gap: 4,
            padding: "18px 28px", background: kleur.bg,
          }}>
            <span style={{
              fontSize: 17, fontWeight: 700, letterSpacing: 2,
              color: kleur.fg === "#fff" ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.4)",
            }}>
              {str.bij(winnaar)}
            </span>
            <span style={{
              fontFamily: BC, fontSize: 62, fontWeight: 900,
              color: kleur.fg, letterSpacing: -2,
            }}>
              {prijs != null && isFinite(prijs) ? fmt(prijs) : "—"}
            </span>
          </div>
        </div>
      )}

      {/* ── PRODUCTENLIJST ── */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        padding: "20px 60px 0",
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 16, marginBottom: 8,
        }}>
          <div style={{ flex: 1, height: 1, background: "#e5e7eb", display: "flex" }} />
          <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: 3, color: "#9ca3af" }}>
            {str.jouwLijst}
          </span>
          <div style={{ flex: 1, height: 1, background: "#e5e7eb", display: "flex" }} />
        </div>

        {tonen.map((p, i) => (
          <div key={i} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "11px 0",
            borderBottomWidth: 1, borderBottomStyle: "solid", borderBottomColor: "#f3f4f6",
          }}>
            <span style={{ fontSize: 24, color: "#374151", fontWeight: 400, overflow: "hidden" }}>
              {p.naam}
            </span>
            <span style={{
              fontFamily: BC, fontSize: 26, fontWeight: 700,
              color: kleur.bg, flexShrink: 0, marginLeft: 24,
            }}>
              {p.prijs != null ? fmt(p.prijs) : "—"}
            </span>
          </div>
        ))}

        {aantalMeer > 0 && (
          <span style={{ fontSize: 22, color: "#9ca3af", marginTop: 10 }}>
            {str.meerStandaard(aantalMeer)}
          </span>
        )}
      </div>

      {/* ── FOOTER ── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 60px",
        height: 80,
        background: kleur.bg,
        flexShrink: 0,
        marginTop: 20,
      }}>
        <span style={{
          fontSize: 22,
          color: kleur.fg === "#fff" ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.4)",
        }}>
          {str.beginTekst}
        </span>
        <span style={{
          fontFamily: BC, fontSize: 26, fontWeight: 700,
          color: kleur.fg, letterSpacing: -0.5,
        }}>
          cheapersupermarkets.com →
        </span>
      </div>
    </div>
  )
}

// ── WAUW VARIANT ──
type Strings = ReturnType<typeof s>

interface WauwProps {
  winnaar: string
  prijs: number | undefined
  gemiddelde: number | null
  kleur: { bg: string; fg: string; licht: string }
  logoSrc?: string
  appLogoSrc?: string
  tonen: { naam: string; prijs: number | null }[]
  aantalMeer: number
  aantalProducten: number
  besparingsBedrag: string
  str: Strings
}

function maakWauwVariant({ winnaar, prijs, gemiddelde, kleur, logoSrc, appLogoSrc, tonen, aantalMeer, aantalProducten, besparingsBedrag, str }: WauwProps) {
  return (
    <div style={{
      width: 1080, height: 1350,
      display: "flex", flexDirection: "column",
      background: "#ffffff",
      fontFamily: "sans-serif",
    }}>

      {/* ── TOP: branding band ── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: 20,
        background: kleur.bg,
        padding: "28px 60px",
        flexShrink: 0,
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: "50%",
          background: "white",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
          flexShrink: 0,
        }}>
          {appLogoSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={appLogoSrc} width={54} height={54} alt="CheaperSupermarkets" />
          ) : (
            <span style={{ fontSize: 40 }}>🛒</span>
          )}
        </div>
        <span style={{
          fontFamily: BC, fontSize: 48, fontWeight: 900,
          color: "white", letterSpacing: -0.5,
        }}>
          Cheaper
          <span style={{
            color: kleur.fg === "#fff" ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.35)",
            fontWeight: 700,
          }}>
            Supermarkets
          </span>
        </span>
      </div>

      {/* ── HERO: wauw-tekst ── */}
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        padding: "52px 60px 0",
        flexShrink: 0,
      }}>
        <span style={{
          fontFamily: BC, fontSize: 72, fontWeight: 900,
          color: "#111827", letterSpacing: -1, lineHeight: 1,
          marginBottom: 0,
        }}>
          {str.wauwRegel1}
        </span>

        <span style={{
          fontFamily: BC, fontSize: 200, fontWeight: 900,
          color: kleur.bg, lineHeight: 0.88, letterSpacing: -5,
          marginTop: 8,
        }}>
          {besparingsBedrag}
        </span>

        <span style={{
          fontFamily: BC, fontSize: 60, fontWeight: 700,
          color: "#374151", letterSpacing: -0.5, marginTop: 16,
        }}>
          {str.wauwRegel2}
        </span>
      </div>

      {/* ── SUPERMARKT ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 24,
        margin: "36px 60px 0",
        background: kleur.licht,
        borderRadius: 24,
        padding: "24px 36px",
        flexShrink: 0,
      }}>
        <div style={{
          width: 96, height: 96, borderRadius: 20,
          background: "white",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
          boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
        }}>
          {logoSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoSrc} width={72} height={72} alt={winnaar} />
          ) : (
            <span style={{ fontFamily: BC, fontSize: 34, fontWeight: 900, color: kleur.bg }}>
              {winnaar.slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
          <span style={{ fontSize: 19, color: "#6b7280", fontWeight: 600, letterSpacing: 1 }}>
            {str.goedkoopsteOptie}
          </span>
          <span style={{
            fontFamily: BC, fontSize: 64, fontWeight: 900,
            color: kleur.bg, lineHeight: 1, letterSpacing: -1,
          }}>
            {winnaar}
          </span>
        </div>
        {gemiddelde != null && isFinite(gemiddelde) && prijs != null && isFinite(prijs) && (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4,
            flexShrink: 0,
          }}>
            <span style={{
              fontFamily: BC, fontSize: 34, fontWeight: 900,
              color: "#6b7280", textDecoration: "line-through", letterSpacing: -1,
            }}>
              {`€${gemiddelde.toFixed(2).replace(".", ",")}`}
            </span>
            <span style={{
              fontFamily: BC, fontSize: 52, fontWeight: 900,
              color: kleur.bg, letterSpacing: -1,
            }}>
              {`€${prijs.toFixed(2).replace(".", ",")}`}
            </span>
          </div>
        )}
      </div>

      {/* ── PRODUCTENLIJST ── */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        padding: "24px 60px 0",
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 16, marginBottom: 8,
        }}>
          <div style={{ flex: 1, height: 1, background: "#e5e7eb", display: "flex" }} />
          <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: 3, color: "#9ca3af" }}>
            {str.mijnLijst}
          </span>
          <div style={{ flex: 1, height: 1, background: "#e5e7eb", display: "flex" }} />
        </div>

        {tonen.map((p, i) => (
          <div key={i} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "10px 0",
            borderBottomWidth: 1, borderBottomStyle: "solid", borderBottomColor: "#f3f4f6",
          }}>
            <span style={{ fontSize: 24, color: "#374151", fontWeight: 400, overflow: "hidden" }}>
              {p.naam}
            </span>
            <span style={{
              fontFamily: BC, fontSize: 26, fontWeight: 700,
              color: kleur.bg, flexShrink: 0, marginLeft: 24,
            }}>
              {p.prijs != null ? fmt(p.prijs) : "—"}
            </span>
          </div>
        ))}

        {aantalMeer > 0 && (
          <span style={{ fontSize: 22, color: "#9ca3af", marginTop: 10 }}>
            {str.meerProducten(aantalMeer)}
          </span>
        )}
      </div>

      {/* ── FOOTER ── */}
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        padding: "20px 60px 28px",
        background: kleur.bg,
        flexShrink: 0,
        marginTop: 20,
        gap: 6,
      }}>
        <span style={{
          fontFamily: BC, fontSize: 38, fontWeight: 900,
          color: "white", letterSpacing: -0.5,
        }}>
          {str.footerTitel}
        </span>
        <span style={{
          fontSize: 22,
          color: kleur.fg === "#fff" ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.4)",
        }}>
          {str.footerSub(aantalProducten)}
        </span>
      </div>
    </div>
  )
}
