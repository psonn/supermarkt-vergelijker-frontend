"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { VergelijkingsResultaat, LocatieResultaat, SupermarktLocatie } from "@/lib/api"

function isLocatieResultaat(r: unknown): r is LocatieResultaat {
  return typeof r === "object" && r !== null && "vergelijking" in r
}

const VERVOER_LABELS: Record<string, string> = {
  driving: "rijden",
  cycling: "fietsen",
  walking: "lopen",
}

// Merkidentiteit per supermarkt
const SUPERMARKT_STIJL: Record<string, { bg: string; fg: string; kort: string; domain: string }> = {
  "Albert Heijn": { bg: "#0056A8", fg: "#fff", kort: "AH", domain: "ah.nl" },
  "Jumbo":        { bg: "#FFC800", fg: "#222", kort: "JU", domain: "jumbo.com" },
  "Dirk":         { bg: "#D91B1B", fg: "#fff", kort: "DK", domain: "dirk.nl" },
  "Aldi":         { bg: "#003087", fg: "#fff", kort: "AL", domain: "aldi.nl" },
  "Ekoplaza":     { bg: "#3D8127", fg: "#fff", kort: "EK", domain: "ekoplaza.nl" },
  "Dekamarkt":    { bg: "#E8511E", fg: "#fff", kort: "DM", domain: "dekamarkt.nl" },
  "Spar":         { bg: "#007B3E", fg: "#fff", kort: "SP", domain: "spar.nl" },
}

function SupermarktLogo({ naam, size = "sm" }: { naam: string; size?: "sm" | "md" }) {
  const stijl = SUPERMARKT_STIJL[naam]
  const [imgFout, setImgFout] = useState(false)

  const dim = size === "md" ? 40 : 28
  const cls = size === "md"
    ? "rounded-lg flex-shrink-0"
    : "rounded flex-shrink-0"

  if (stijl && !imgFout) {
    return (
      <img
        src={`https://logo.clearbit.com/${stijl.domain}`}
        alt={naam}
        width={dim}
        height={dim}
        className={`${cls} object-contain bg-white border border-border`}
        style={{ width: dim, height: dim }}
        onError={() => setImgFout(true)}
      />
    )
  }

  const bg = stijl?.bg ?? "#888"
  const fg = stijl?.fg ?? "#fff"
  const kort = stijl?.kort ?? naam.slice(0, 2).toUpperCase()

  return (
    <div
      style={{ backgroundColor: bg, color: fg, width: dim, height: dim }}
      className={`${cls} flex items-center justify-center font-bold text-[11px] select-none`}
    >
      {kort}
    </div>
  )
}

function AdresTekst({ loc }: { loc: SupermarktLocatie }) {
  const delen = [loc.adres, [loc.postcode, loc.stad].filter(Boolean).join(" ")].filter(Boolean)
  if (delen.length === 0) return null
  return <span className="block text-xs text-muted-foreground truncate">{delen.join(", ")}</span>
}

interface Props {
  resultaat: VergelijkingsResultaat | LocatieResultaat
}

export default function ResultatenTabel({ resultaat }: Props) {
  const isLocatie = isLocatieResultaat(resultaat)
  const verg = isLocatie ? resultaat.vergelijking : resultaat

  // Dichtstbijzijnde vestiging per keten
  const locatieMap: Record<string, SupermarktLocatie> = {}
  if (isLocatie) {
    for (const sm of resultaat.supermarkten_nabij ?? []) {
      const huidig = locatieMap[sm.naam]
      if (!huidig || (sm.afstand_km ?? Infinity) < (huidig.afstand_km ?? Infinity)) {
        locatieMap[sm.naam] = sm
      }
    }
  }

  const supermarkten = Object.keys(verg.totaal_per_supermarkt).sort(
    (a, b) => verg.totaal_per_supermarkt[a] - verg.totaal_per_supermarkt[b]
  )

  if (supermarkten.length === 0) {
    return <p className="text-muted-foreground">Geen resultaten gevonden.</p>
  }

  const goedkoopste = verg.goedkoopste_supermarkt
  const besteMatch = verg.beste_match_supermarkt
  const aanbevolen = isLocatie ? resultaat.aanbevolen_supermarkt : undefined
  const aanbevelingReden = isLocatie ? resultaat.aanbeveling_reden : undefined
  const aantalProducten = verg.producten.length
  const heeftLocatieData = isLocatie && (resultaat.supermarkten_nabij?.length ?? 0) > 0
  const vervoer = isLocatie ? resultaat.vervoer : "driving"

  return (
    <div className="space-y-6">
      {/* Aanbeveling (alleen bij locatie) */}
      {aanbevolen && (
        <Card className="border-purple-200 bg-purple-50 dark:bg-purple-950/20">
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              🏆 Aanbeveling
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <SupermarktLogo naam={aanbevolen} size="md" />
              <div>
                <p className="text-xl font-bold">{aanbevolen}</p>
                {locatieMap[aanbevolen] && <AdresTekst loc={locatieMap[aanbevolen]} />}
              </div>
            </div>
            {aanbevelingReden && (
              <p className="text-sm text-muted-foreground mt-2">{aanbevelingReden}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Samenvatting kaarten */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {goedkoopste && (
          <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
            <CardHeader className="pb-1">
              <CardTitle className="text-sm font-medium text-muted-foreground">💰 Goedkoopste</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-1">
                <SupermarktLogo naam={goedkoopste} size="md" />
                <div>
                  <p className="text-xl font-bold">{goedkoopste}</p>
                  {locatieMap[goedkoopste] && <AdresTekst loc={locatieMap[goedkoopste]} />}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                €{verg.totaal_per_supermarkt[goedkoopste].toFixed(2)} · {verg.dekking_per_supermarkt[goedkoopste] ?? "?"}/{aantalProducten} producten
              </p>
              {locatieMap[goedkoopste] && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {locatieMap[goedkoopste].afstand_km?.toFixed(1)} km ·{" "}
                  {Math.round(locatieMap[goedkoopste].reistijd_min ?? 0)} min {VERVOER_LABELS[vervoer]}
                </p>
              )}
            </CardContent>
          </Card>
        )}
        {besteMatch && besteMatch !== goedkoopste && (
          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
            <CardHeader className="pb-1">
              <CardTitle className="text-sm font-medium text-muted-foreground">📦 Meeste producten</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-1">
                <SupermarktLogo naam={besteMatch} size="md" />
                <div>
                  <p className="text-xl font-bold">{besteMatch}</p>
                  {locatieMap[besteMatch] && <AdresTekst loc={locatieMap[besteMatch]} />}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                €{verg.totaal_per_supermarkt[besteMatch].toFixed(2)} · {verg.dekking_per_supermarkt[besteMatch] ?? "?"}/{aantalProducten} producten
              </p>
              {locatieMap[besteMatch] && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {locatieMap[besteMatch].afstand_km?.toFixed(1)} km ·{" "}
                  {Math.round(locatieMap[besteMatch].reistijd_min ?? 0)} min {VERVOER_LABELS[vervoer]}
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Tabel per supermarkt */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Supermarkt</th>
              {heeftLocatieData && (
                <th className="px-4 py-3 text-right font-medium hidden sm:table-cell">Afstand</th>
              )}
              {heeftLocatieData && (
                <th className="px-4 py-3 text-right font-medium hidden sm:table-cell">Reistijd</th>
              )}
              <th className="px-4 py-3 text-right font-medium">Producten</th>
              <th className="px-4 py-3 text-right font-medium">Totaal</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {supermarkten.map((sm) => {
              const totaal = verg.totaal_per_supermarkt[sm]
              const dekking = verg.dekking_per_supermarkt?.[sm]
              const isGoedkoopste = sm === goedkoopste
              const isBesteMatch = sm === besteMatch
              const isAanbevolen = sm === aanbevolen
              const loc = locatieMap[sm]

              return (
                <tr key={sm} className={isGoedkoopste ? "bg-green-50/50 dark:bg-green-950/10" : ""}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <SupermarktLogo naam={sm} />
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5 font-medium">
                          {sm}
                          {isAanbevolen && (
                            <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">aanbevolen</Badge>
                          )}
                          {isGoedkoopste && !isAanbevolen && (
                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">goedkoopst</Badge>
                          )}
                          {isBesteMatch && !isGoedkoopste && !isAanbevolen && (
                            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">meeste producten</Badge>
                          )}
                        </div>
                        {/* Adres altijd zichtbaar onder naam */}
                        {loc && <AdresTekst loc={loc} />}
                        {/* Afstand op mobiel */}
                        {heeftLocatieData && loc?.afstand_km != null && (
                          <span className="block text-xs text-muted-foreground sm:hidden">
                            {loc.afstand_km.toFixed(1)} km · {Math.round(loc.reistijd_min ?? 0)} min
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  {heeftLocatieData && (
                    <td className="px-4 py-3 text-right text-muted-foreground hidden sm:table-cell align-top">
                      {loc?.afstand_km != null ? `${loc.afstand_km.toFixed(1)} km` : "—"}
                    </td>
                  )}
                  {heeftLocatieData && (
                    <td className="px-4 py-3 text-right text-muted-foreground hidden sm:table-cell align-top">
                      {loc?.reistijd_min != null ? `${Math.round(loc.reistijd_min)} min` : "—"}
                    </td>
                  )}
                  <td className="px-4 py-3 text-right text-muted-foreground align-top">
                    {dekking !== undefined ? `${dekking}/${aantalProducten}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold align-top">
                    €{totaal.toFixed(2)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Per product */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Per product</h3>
        {verg.producten
          .reduce<{ item: typeof verg.producten[0]; aantal: number }[]>((acc, p) => {
            const bestaand = acc.find((g) => g.item.zoekopdracht === p.zoekopdracht)
            if (bestaand) { bestaand.aantal++ } else { acc.push({ item: p, aantal: 1 }) }
            return acc
          }, [])
          .map(({ item: gematched, aantal }) => (
          <div key={gematched.zoekopdracht} className="rounded-lg border p-4">
            <p className="font-medium mb-2">
              {gematched.zoekopdracht}
              {aantal > 1 && (
                <span className="ml-2 text-xs font-normal text-muted-foreground bg-muted px-1.5 py-0.5 rounded">×{aantal}</span>
              )}
            </p>
            <div className="space-y-1">
              {Object.entries(gematched.matches).map(([sm, product]) => (
                <div key={sm} className="flex items-center justify-between text-sm gap-2">
                  <div className="flex items-center gap-1.5 text-muted-foreground min-w-0">
                    <SupermarktLogo naam={sm} size="sm" />
                    <span className="truncate">{sm}</span>
                  </div>
                  <span className="shrink-0">
                    {product === null ? (
                      <span className="text-muted-foreground italic">niet gevonden</span>
                    ) : product.url ? (
                      <><a href={product.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{product.naam}</a>
                        {" — "}€{(product.prijs * aantal).toFixed(2)}
                        {aantal > 1 && <span className="text-muted-foreground"> (€{product.prijs.toFixed(2)} × {aantal})</span>}
                      </>
                    ) : (
                      <>{product.naam}
                        {" — "}€{(product.prijs * aantal).toFixed(2)}
                        {aantal > 1 && <span className="text-muted-foreground"> (€{product.prijs.toFixed(2)} × {aantal})</span>}
                      </>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
