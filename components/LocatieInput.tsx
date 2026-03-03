"use client"

import { useEffect, useRef, useState } from "react"

interface Suggestie {
  label: string
  kort: string
}

export interface OpgeslagenAdres {
  id: string
  naam: string
  adres: string
}

interface Props {
  waarde: string
  onChange: (waarde: string) => void
  disabled?: boolean
  opgeslagenAdressen?: OpgeslagenAdres[]
  onVerwijderAdres?: (id: string) => void
}

export default function LocatieInput({
  waarde,
  onChange,
  disabled,
  opgeslagenAdressen = [],
  onVerwijderAdres,
}: Props) {
  const [suggesties, setSuggesties] = useState<Suggestie[]>([])
  const [open, setOpen] = useState(false)
  const [actief, setActief] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Filter opgeslagen adressen op zoekterm
  const gefilterdAdressen = waarde.trim().length < 2
    ? opgeslagenAdressen
    : opgeslagenAdressen.filter(
        (a) =>
          a.naam.toLowerCase().includes(waarde.toLowerCase()) ||
          a.adres.toLowerCase().includes(waarde.toLowerCase())
      )

  const heeftDropdown = gefilterdAdressen.length > 0 || suggesties.length > 0

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!waarde.trim() || waarde.length < 3) {
      setSuggesties([])
      return
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const resp = await fetch(`/api/locatie-suggesties?q=${encodeURIComponent(waarde)}`)
        const data: Suggestie[] = await resp.json()
        setSuggesties(data)
        setActief(-1)
      } catch {
        setSuggesties([])
      }
    }, 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [waarde])

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  function kiesSuggestie(s: Suggestie) {
    onChange(s.kort || s.label)
    setOpen(false)
    setSuggesties([])
  }

  function kiesOpgeslagen(a: OpgeslagenAdres) {
    onChange(a.adres)
    setOpen(false)
  }

  // Gecombineerde lijst voor pijltjesnavigatie
  const alleItems = [
    ...gefilterdAdressen.map((a) => ({ type: "opgeslagen" as const, data: a })),
    ...suggesties.map((s) => ({ type: "suggestie" as const, data: s })),
  ]

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open || !heeftDropdown) return
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActief((i) => Math.min(i + 1, alleItems.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActief((i) => Math.max(i - 1, -1))
    } else if (e.key === "Enter" && actief >= 0) {
      e.preventDefault()
      const item = alleItems[actief]
      if (item.type === "opgeslagen") kiesOpgeslagen(item.data)
      else kiesSuggestie(item.data)
    } else if (e.key === "Escape") {
      setOpen(false)
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={waarde}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setOpen(true)}
        placeholder="Kalverstraat 1, Amsterdam of 1234AB 12"
        disabled={disabled}
        autoComplete="off"
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      />

      {open && heeftDropdown && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md overflow-hidden">
          {/* Opgeslagen adressen */}
          {gefilterdAdressen.length > 0 && (
            <>
              <p className="px-3 pt-2 pb-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Opgeslagen adressen
              </p>
              {gefilterdAdressen.map((a, i) => {
                const idx = i
                return (
                  <div
                    key={a.id}
                    className={`flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors ${idx === actief ? "bg-muted" : ""}`}
                  >
                    <button
                      type="button"
                      className="flex-1 text-left"
                      onMouseDown={(e) => { e.preventDefault(); kiesOpgeslagen(a) }}
                    >
                      <span className="font-medium">📍 {a.naam}</span>
                      <span className="block text-xs text-muted-foreground truncate">{a.adres}</span>
                    </button>
                    {onVerwijderAdres && (
                      <button
                        type="button"
                        onMouseDown={(e) => { e.preventDefault(); onVerwijderAdres(a.id) }}
                        className="text-muted-foreground hover:text-destructive text-xs px-1"
                        title="Verwijder adres"
                      >
                        ×
                      </button>
                    )}
                  </div>
                )
              })}
              {suggesties.length > 0 && <div className="border-t" />}
            </>
          )}

          {/* Nominatim / PDOK suggesties */}
          {suggesties.map((s, i) => {
            const idx = gefilterdAdressen.length + i
            return (
              <button
                key={i}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); kiesSuggestie(s) }}
                className={`w-full px-3 py-2 text-sm text-left hover:bg-muted transition-colors ${idx === actief ? "bg-muted" : ""}`}
              >
                <span className="font-medium">{s.kort || s.label}</span>
                {s.kort && s.label !== s.kort && (
                  <span className="block text-xs text-muted-foreground truncate">{s.label}</span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
