"use client"

import { useEffect, useRef, useState } from "react"
import { zoekProducten, suggestiesToevoegen, type ProductSuggestie } from "@/lib/producten"
import { useTranslations } from "next-intl"

export interface ChipItem {
  naam: string
  aantal: number
}

interface Props {
  waarde: ChipItem[]
  onChange: (items: ChipItem[]) => void
  gebruikerProducten?: string[]
  disabled?: boolean
}

export default function ProductChipInput({ waarde, onChange, gebruikerProducten = [], disabled }: Props) {
  const t = useTranslations("productInput")
  const [invoer, setInvoer] = useState("")
  const [suggesties, setSuggesties] = useState<ProductSuggestie[]>([])
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [geselecteerdIndex, setGeselecteerdIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const toegevoegdeNamen = waarde.map((c) => c.naam)

  useEffect(() => {
    if (!invoer.trim()) {
      const combineer = suggestiesToevoegen(toegevoegdeNamen, 6)
      const eerderGebruikt = t("eerderGebruikt")
      const geschiedenis = gebruikerProducten
        .filter((p) => !toegevoegdeNamen.includes(p))
        .slice(0, 4)
        .map((naam) => ({ naam, categorie: eerderGebruikt }))

      const alle = [
        ...geschiedenis,
        ...combineer.filter((s) => !geschiedenis.find((g) => g.naam === s.naam)),
      ]
      setSuggesties(alle.slice(0, 8))
    } else {
      const eerderGebruikt = t("eerderGebruikt")
      const statisch = zoekProducten(invoer, 6).filter(
        (s) => !toegevoegdeNamen.includes(s.naam)
      )
      const persoonlijk = gebruikerProducten
        .filter(
          (p) =>
            p.toLowerCase().includes(invoer.toLowerCase()) &&
            !toegevoegdeNamen.includes(p) &&
            !statisch.find((s) => s.naam === p)
        )
        .slice(0, 3)
        .map((naam) => ({ naam, categorie: eerderGebruikt }))

      const alle = [
        ...persoonlijk,
        ...statisch,
        ...(statisch.length === 0 && persoonlijk.length === 0
          ? [{ naam: invoer.trim(), categorie: "" }]
          : []),
      ]
      setSuggesties(alle)
      setDropdownOpen(true)
    }
    setGeselecteerdIndex(-1)
  }, [invoer, waarde.length, gebruikerProducten.length])

  function voegToe(naam: string) {
    const bestaand = waarde.find((c) => c.naam === naam)
    if (bestaand) {
      onChange(waarde.map((c) => c.naam === naam ? { ...c, aantal: c.aantal + 1 } : c))
    } else {
      onChange([...waarde, { naam, aantal: 1 }])
    }
    setInvoer("")
    setDropdownOpen(false)
    inputRef.current?.focus()
  }

  function verwijder(naam: string) {
    onChange(waarde.filter((c) => c.naam !== naam))
  }

  function wijzigAantal(naam: string, delta: number) {
    onChange(
      waarde
        .map((c) => c.naam === naam ? { ...c, aantal: Math.max(1, c.aantal + delta) } : c)
        .filter((c) => c.aantal > 0)
    )
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setGeselecteerdIndex((i) => Math.min(i + 1, suggesties.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setGeselecteerdIndex((i) => Math.max(i - 1, -1))
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (geselecteerdIndex >= 0 && suggesties[geselecteerdIndex]) {
        voegToe(suggesties[geselecteerdIndex].naam)
      } else if (invoer.trim()) {
        voegToe(invoer.trim())
      }
    } else if (e.key === "Escape") {
      setDropdownOpen(false)
    }
  }

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (
        !dropdownRef.current?.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <div className="space-y-2">
      {waarde.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {waarde.map((chip) => (
            <div
              key={chip.naam}
              className="flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 text-primary px-3 py-1 text-sm font-medium"
            >
              <span>{chip.naam}</span>
              <div className="flex items-center gap-0.5 ml-1">
                <button
                  type="button"
                  onClick={() => wijzigAantal(chip.naam, -1)}
                  disabled={disabled}
                  aria-label={t("minLabel", { product: chip.naam })}
                  className="w-4 h-4 rounded-full hover:bg-muted-foreground/20 flex items-center justify-center text-xs leading-none"
                >
                  −
                </button>
                <span className="text-xs font-medium w-4 text-center">{chip.aantal}</span>
                <button
                  type="button"
                  onClick={() => wijzigAantal(chip.naam, 1)}
                  disabled={disabled}
                  aria-label={t("plusLabel", { product: chip.naam })}
                  className="w-4 h-4 rounded-full hover:bg-muted-foreground/20 flex items-center justify-center text-xs leading-none"
                >
                  +
                </button>
              </div>
              <button
                type="button"
                onClick={() => verwijder(chip.naam)}
                disabled={disabled}
                className="ml-1 text-muted-foreground hover:text-foreground leading-none"
                aria-label={t("verwijderLabel", { product: chip.naam })}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={invoer}
          onChange={(e) => setInvoer(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setDropdownOpen(suggesties.length > 0)}
          placeholder={waarde.length === 0 ? t("placeholderLeeg") : t("placeholderToevoegen")}
          disabled={disabled}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          autoComplete="off"
          maxLength={80}
        />

        {dropdownOpen && suggesties.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md"
          >
            {suggesties.map((s, i) => (
              <button
                key={s.naam}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); voegToe(s.naam) }}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-muted transition-colors ${
                  i === geselecteerdIndex ? "bg-muted" : ""
                }`}
              >
                <span className="truncate min-w-0">{s.naam}</span>
                {s.categorie && (
                  <span className="text-xs text-muted-foreground ml-2">{s.categorie}</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground">{t("helpTekst")}</p>
    </div>
  )
}
