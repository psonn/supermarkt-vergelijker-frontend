import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "CheaperSupermarkets — Vergelijk supermarktprijzen"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function Image() {
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
        {/* Subtiele dot grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "radial-gradient(circle, #bbf7d0 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            opacity: 0.5,
          }}
        />

        {/* Logo + naam */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 32 }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              background: "#16a34a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 40,
            }}
          >
            🛒
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 52, fontWeight: 800, color: "#111827", lineHeight: 1 }}>
              Cheaper<span style={{ color: "#16a34a" }}>Supermarkets</span>
            </span>
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            color: "#6b7280",
            textAlign: "center",
            maxWidth: 700,
          }}
        >
          Real-time prijsvergelijking voor Nederlandse supermarkten
        </div>

        {/* Supermarkt badges */}
        <div style={{ display: "flex", gap: 12, marginTop: 48 }}>
          {["AH", "Jumbo", "Dirk", "Aldi", "Spar"].map((naam) => (
            <div
              key={naam}
              style={{
                padding: "8px 20px",
                borderRadius: 9999,
                background: "#f0fdf4",
                border: "2px solid #bbf7d0",
                color: "#15803d",
                fontSize: 22,
                fontWeight: 600,
              }}
            >
              {naam}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  )
}
