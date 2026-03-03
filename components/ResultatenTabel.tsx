"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { VergelijkingsResultaat, LocatieResultaat } from "@/lib/api"

function isLocatieResultaat(r: unknown): r is LocatieResultaat {
  return typeof r === "object" && r !== null && "vergelijking" in r
}

interface Props {
  resultaat: VergelijkingsResultaat | LocatieResultaat
}

export default function ResultatenTabel({ resultaat }: Props) {
  const verg = isLocatieResultaat(resultaat) ? resultaat.vergelijking : resultaat
  const supermarkten = Object.keys(verg.totaal_per_supermarkt).sort(
    (a, b) => verg.totaal_per_supermarkt[a] - verg.totaal_per_supermarkt[b]
  )

  if (supermarkten.length === 0) {
    return <p className="text-muted-foreground">Geen resultaten gevonden.</p>
  }

  const goedkoopste = verg.goedkoopste_supermarkt
  const besteMatch = verg.beste_match_supermarkt
  const aantalProducten = verg.producten.length

  return (
    <div className="space-y-6">
      {/* Samenvatting */}
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

              return (
                <tr key={sm} className={isGoedkoopste ? "bg-green-50/50 dark:bg-green-950/10" : ""}>
                  <td className="px-4 py-3 font-medium flex items-center gap-2">
                    {sm}
                    {isGoedkoopste && <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">goedkoopst</Badge>}
                    {isBesteMatch && !isGoedkoopste && <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">meeste producten</Badge>}
                  </td>
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

      {/* Per product */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Per product</h3>
        {verg.producten.map((gematched) => (
          <div key={gematched.zoekopdracht} className="rounded-lg border p-4">
            <p className="font-medium mb-2">{gematched.zoekopdracht}</p>
            <div className="space-y-1">
              {Object.entries(gematched.matches).map(([sm, product]) => (
                <div key={sm} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{sm}</span>
                  <span>
                    {product.url ? (
                      <a href={product.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {product.naam}
                      </a>
                    ) : product.naam} — €{product.prijs.toFixed(2)}
                  </span>
                </div>
              ))}
              {gematched.niet_gevonden?.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Niet gevonden bij: {gematched.niet_gevonden.join(", ")}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
