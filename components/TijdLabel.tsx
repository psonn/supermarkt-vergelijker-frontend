"use client"

/**
 * Rendert een ISO-tijdstempel in de tijdzone van de browser.
 * suppressHydrationWarning voorkomt hydration-mismatch (server=UTC, browser=lokaal).
 */
export default function TijdLabel({ iso }: { iso: string }) {
  const formatted = new Date(iso).toLocaleString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
  return <span suppressHydrationWarning>{formatted}</span>
}
