"use client"

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

interface Props {
  resultaat: VergelijkingsResultaat | LocatieResultaat
}

export default function ResultatenTabel({ resultaat }: Props) {
  const isLocatie = isLocatieResultaat(resultaat)
  const verg = isLocatie ? resultaat.vergelijking : resultaat

  // Bouw een lookup: supermarktnaam → locatiedata
  const locatieMap: Record<string, SupermarktLocatie> = {}
  if (isLocatie) {
    for (const sm of resultaat.supermarkten_nabij ?? []) {
      locatieMap[sm.naam] = sm
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
            <p className="text-xl font-bold">{aanbevolen}</p>
            {aanbevelingReden && (
              <p className="text-sm text-muted-foreground mt-0.5">{aanbevelingReden}</p>
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
              <p className="text-xl font-bold">{goedkoopste}</p>
              <p className="text-sm text-muted-foreground">
                €{verg.totaal_per_supermarkt[goedkoopste].toFixed(2)} · {verg.dekking_per_supermarkt[goedkoopste] ?? "?"}/{aantalProducten} producten
              </p>
              {locatieMap[goedkoopste] && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {locatieMap[goedkoopste].afstand_km?.toFixed(1)} km ·{" "}
                  {Math.round(locatieMap[goedkoopste].reistijd_min ?? 0)} min{" "}
                  {VERVOER_LABELS[resultaat && isLocatie ? resultaat.vervoer : "driving"]}
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
              <p className="text-xl font-bold">{besteMatch}</p>
              <p className="text-sm text-muted-foreground">
                €{verg.totaal_per_supermarkt[besteMatch].toFixed(2)} · {verg.dekking_per_supermarkt[besteMatch] ?? "?"}/{aantalProducten} producten
              </p>
              {locatieMap[besteMatch] && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {locatieMap[besteMatch].afstand_km?.toFixed(1)} km ·{" "}
                  {Math.round(locatieMap[besteMatch].reistijd_min ?? 0)} min{" "}
                  {VERVOER_LABELS[resultaat && isLocatie ? resultaat.vervoer : "driving"]}
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
                  <td className="px-4 py-3 font-medium">
                    <div className="flex flex-wrap items-center gap-1.5">
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
                    {loc?.adres && (
                      <p className="text-xs text-muted-foreground font-normal mt-0.5 sm:hidden">
                        {loc.afstand_km?.toFixed(1)} km · {Math.round(loc.reistijd_min ?? 0)} min
                      </p>
                    )}
                  </td>
                  {heeftLocatieData && (
                    <td className="px-4 py-3 text-right text-muted-foreground hidden sm:table-cell">
                      {loc?.afstand_km != null ? `${loc.afstand_km.toFixed(1)} km` : "—"}
                    </td>
                  )}
                  {heeftLocatieData && (
                    <td className="px-4 py-3 text-right text-muted-foreground hidden sm:table-cell">
                      {loc?.reistijd_min != null ? `${Math.round(loc.reistijd_min)} min` : "—"}
                    </td>
                  )}
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {dekking !== undefined ? `${dekking}/${aantalProducten}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    €{totaal.toFixed(2)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Per product — groepeer duplicaten (bij hoeveelheid >1) */}
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
                <div key={sm} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{sm}</span>
                  <span>
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
