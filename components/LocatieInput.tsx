"use client"

import { useEffect, useRef, useState } from "react"
import { MapPin } from "lucide-react"
import { useTranslations } from "next-intl"

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
  onGpsSuccess?: (adres: string) => void
}

export default function LocatieInput({
  waarde,
  onChange,
  disabled,
  opgeslagenAdressen = [],
  onVerwijderAdres,
  onGpsSuccess,
}: Props) {
  const t = useTranslations("locatieInput")
  const [suggesties, setSuggesties] = useState<Suggestie[]>([])
  const [open, setOpen] = useState(false)
  const [actief, setActief] = useState(-1)
  const [gpsStatus, setGpsStatus] = useState<"idle" | "laden" | "fout">("idle")
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  async function vraagGpsLocatie() {
    if (!navigator.geolocation) {
      setGpsStatus("fout")
      setTimeout(() => setGpsStatus("idle"), 3000)
      return
    }
    setGpsStatus("laden")
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const resp = await fetch(
            `/api/locatie-reverse?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`
          )
          const data = await resp.json()
          if (data.adres) {
            onChange(data.adres)
            onGpsSuccess?.(data.adres)
            setOpen(false)
          }
          setGpsStatus("idle")
        } catch {
          setGpsStatus("fout")
          setTimeout(() => setGpsStatus("idle"), 3000)
        }
      },
      () => {
        setGpsStatus("fout")
        setTimeout(() => setGpsStatus("idle"), 3000)
      },
      { timeout: 10000 }
    )
  }

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
      <div className="flex gap-1.5">
        <input
          type="text"
          value={waarde}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setOpen(true)}
          placeholder={t("placeholder")}
          disabled={disabled}
          autoComplete="off"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        <button
          type="button"
          onClick={vraagGpsLocatie}
          disabled={disabled || gpsStatus === "laden"}
          title={gpsStatus === "fout" ? t("gpsFout") : t("gpsKnop")}
          className={`shrink-0 flex items-center justify-center w-9 h-9 rounded-md border text-sm transition-colors ${
            gpsStatus === "fout"
              ? "border-destructive text-destructive bg-destructive/10"
              : gpsStatus === "laden"
              ? "border-input text-muted-foreground animate-pulse"
              : "border-input hover:bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          {gpsStatus === "laden" ? (
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
              <path d="M12 2a10 10 0 100 20 10 10 0 000-20" strokeOpacity="0.25" />
            </svg>
          )}
        </button>
      </div>

      {gpsStatus === "fout" && (
        <p className="text-xs text-destructive mt-1">{t("gpsFout")}</p>
      )}

      {open && heeftDropdown && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md max-h-48 overflow-y-auto">
          {gefilterdAdressen.length > 0 && (
            <>
              <p className="px-3 pt-2 pb-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                {t("opgeslaanAdressen")}
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
                      <span className="font-medium flex items-center gap-1"><MapPin size={12} className="text-primary shrink-0" />{a.naam}</span>
                      <span className="block text-xs text-muted-foreground truncate">{a.adres}</span>
                    </button>
                    {onVerwijderAdres && (
                      <button
                        type="button"
                        onMouseDown={(e) => { e.preventDefault(); onVerwijderAdres(a.id) }}
                        className="text-muted-foreground hover:text-destructive text-xs px-1"
                        title={t("verwijderAdres")}
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
