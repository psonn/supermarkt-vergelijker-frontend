"use client"

import { useEffect, useRef, useState } from "react"

interface Suggestie {
  label: string
  kort: string
}

interface Props {
  waarde: string
  onChange: (waarde: string) => void
  disabled?: boolean
}

export default function LocatieInput({ waarde, onChange, disabled }: Props) {
  const [suggesties, setSuggesties] = useState<Suggestie[]>([])
  const [open, setOpen] = useState(false)
  const [actief, setActief] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!waarde.trim() || waarde.length < 3) {
      setSuggesties([])
      setOpen(false)
      return
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const resp = await fetch(`/api/locatie-suggesties?q=${encodeURIComponent(waarde)}`)
        const data: Suggestie[] = await resp.json()
        setSuggesties(data)
        setOpen(data.length > 0)
        setActief(-1)
      } catch {
        setSuggesties([])
      }
    }, 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [waarde])

  // Sluit dropdown bij klik buiten
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  function kies(s: Suggestie) {
    onChange(s.kort || s.label)
    setOpen(false)
    setSuggesties([])
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) return
    if (e.key === "ArrowDown") { e.preventDefault(); setActief((i) => Math.min(i + 1, suggesties.length - 1)) }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActief((i) => Math.max(i - 1, -1)) }
    else if (e.key === "Enter" && actief >= 0) { e.preventDefault(); kies(suggesties[actief]) }
    else if (e.key === "Escape") setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={waarde}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => suggesties.length > 0 && setOpen(true)}
        placeholder="Kalverstraat 1, Amsterdam"
        disabled={disabled}
        autoComplete="off"
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      />

      {open && suggesties.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
          {suggesties.map((s, i) => (
            <button
              key={i}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); kies(s) }}
              className={`w-full px-3 py-2 text-sm text-left hover:bg-muted transition-colors ${i === actief ? "bg-muted" : ""}`}
            >
              <span className="font-medium">{s.kort || s.label}</span>
              {s.kort && s.label !== s.kort && (
                <span className="block text-xs text-muted-foreground truncate">{s.label}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
