"use client"

import { useEffect, useRef } from "react"

interface GoogleAdProps {
  slot: string
  format?: "auto" | "rectangle" | "horizontal" | "vertical"
  className?: string
}

/**
 * Google AdSense ad unit.
 * Rendert niets als NEXT_PUBLIC_ADSENSE_CLIENT niet ingesteld is.
 */
export default function GoogleAd({ slot, format = "auto", className }: GoogleAdProps) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT
  const ref = useRef<HTMLModElement>(null)
  const pushed = useRef(false)

  useEffect(() => {
    if (!client || pushed.current) return
    try {
      pushed.current = true
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({})
    } catch {
      // AdSense nog niet geladen
    }
  }, [client])

  if (!client) return null

  return (
    <ins
      ref={ref}
      className={`adsbygoogle block ${className ?? ""}`}
      style={{ display: "block" }}
      data-ad-client={client}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  )
}
