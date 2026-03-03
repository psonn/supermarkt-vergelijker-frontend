"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center space-y-4">
        <h2 className="text-xl font-semibold">Er is iets misgegaan</h2>
        <p className="text-muted-foreground text-sm max-w-sm">
          {error.message ?? "Een onverwachte fout is opgetreden."}
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={reset}>Opnieuw proberen</Button>
          <Button variant="outline" onClick={() => window.location.href = "/"}>Naar home</Button>
        </div>
      </div>
    </div>
  )
}
