"use client"

import * as Sentry from "@sentry/nextjs"

export default function SentryTestPage() {
  return (
    <div style={{ padding: 40, fontFamily: "sans-serif" }}>
      <h1>Sentry test</h1>
      <p>Klik de knop om een test-error naar Sentry te sturen.</p>
      <button
        onClick={() => {
          Sentry.captureException(new Error("Test error vanuit CheaperSupermarkets"))
          alert("Error verstuurd naar Sentry!")
        }}
        style={{ padding: "10px 20px", marginTop: 16, cursor: "pointer" }}
      >
        Verstuur test-error
      </button>
    </div>
  )
}
