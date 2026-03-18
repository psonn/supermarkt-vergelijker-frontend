"use client"

import * as Sentry from "@sentry/nextjs"
import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html>
      <body>
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          fontFamily: "sans-serif",
          gap: "16px",
          padding: "24px",
          textAlign: "center",
        }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Er is iets misgegaan</h2>
          <p style={{ color: "#6b7280" }}>De fout is automatisch gemeld. Probeer het opnieuw.</p>
          <button
            onClick={reset}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              background: "#fff",
              cursor: "pointer",
              fontSize: "0.875rem",
            }}
          >
            Probeer opnieuw
          </button>
        </div>
      </body>
    </html>
  )
}
