"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, TrendingDown, Package, ShoppingCart, Flame, AlertTriangle } from "lucide-react"
import type { VergelijkingsResultaat, LocatieResultaat, SupermarktLocatie, Product } from "@/lib/api"
import { useTranslations } from "next-intl"

function isLocatieResultaat(r: unknown): r is LocatieResultaat {
  return typeof r === "object" && r !== null && "vergelijking" in r
}

const SUPERMARKT_STIJL: Record<string, { bg: string; fg: string; kort: string; logo: string }> = {
  "Albert Heijn": { bg: "#0057A8", fg: "#fff", kort: "AH", logo: "/logos/ah.svg" },
  "Jumbo":        { bg: "#FFC800", fg: "#222", kort: "JU", logo: "/logos/jumbo.svg" },
  "Dirk":         { bg: "#D91B1B", fg: "#fff", kort: "DK", logo: "/logos/dirk.svg" },
  "Aldi":         { bg: "#003087", fg: "#fff", kort: "AL", logo: "/logos/aldi.svg" },
  "Ekoplaza":     { bg: "#3D8127", fg: "#fff", kort: "EK", logo: "/logos/ekoplaza.svg" },
  "Dekamarkt":    { bg: "#E8511E", fg: "#fff", kort: "DM", logo: "/logos/dekamarkt.svg" },
  "Spar":         { bg: "#007B3E", fg: "#fff", kort: "SP", logo: "/logos/spar.svg" },
}

function SupermarktLogo({ naam, size = "sm" }: { naam: string; size?: "sm" | "md" }) {
  const stijl = SUPERMARKT_STIJL[naam]
  const [imgFout, setImgFout] = useState(false)
  const dim = size === "md" ? 40 : 28

  if (stijl && !imgFout) {
    return (
      <img
        src={stijl.logo}
        alt={naam}
        width={dim}
        height={dim}
        className="rounded flex-shrink-0 object-cover"
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
      className="rounded flex-shrink-0 flex items-center justify-center font-bold text-[11px] select-none"
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

function PrijsTrend({ product, t }: { product: Product; t: ReturnType<typeof useTranslations<"resultaten">> }) {
  const badges: React.ReactNode[] = []

  if (product.in_aanbieding || (product.actie_prijs && product.actie_prijs < product.prijs)) {
    badges.push(
      <span key="sale" className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 border border-orange-200">
        {t("aanbieding")}
      </span>
    )
  }

  if (product.prijs_historisch_laag) {
    badges.push(
      <span key="low" className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 border border-emerald-200 inline-flex items-center gap-0.5">
        <Flame size={9} strokeWidth={2.5} />{t("historischLaag")}
      </span>
    )
  }

  if (product.prijs_historisch_hoog) {
    badges.push(
      <span key="high" className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200 inline-flex items-center gap-0.5">
        <AlertTriangle size={9} strokeWidth={2.5} />{t("historischHoog")}
      </span>
    )
  }

  if (product.vorige_prijs && product.vorige_prijs > 0) {
    const verschil = product.prijs - product.vorige_prijs
    const pct = (verschil / product.vorige_prijs) * 100
    if (Math.abs(pct) >= 0.5) {
      const omhoog = verschil > 0
      badges.push(
        <span
          key="trend"
          className={`text-[10px] font-semibold flex items-center gap-0.5 ${omhoog ? "text-red-600" : "text-emerald-600"}`}
        >
          {omhoog ? "↑" : "↓"}{Math.abs(pct).toFixed(0)}%
        </span>
      )
    }
  }

  if (badges.length === 0) return null
  return <span className="flex flex-wrap items-center gap-1 mt-0.5">{badges}</span>
}

function PrijsHistorieTip({ product, t }: { product: Product; t: ReturnType<typeof useTranslations<"resultaten">> }) {
  const heeftData = product.prijs_n_datapunten && product.prijs_n_datapunten > 1
  if (!heeftData) return null

  return (
    <span className="group relative inline-block">
      <span className="text-[10px] text-muted-foreground cursor-help border-b border-dashed border-muted-foreground/40">
        {t("aantalGemeten", { count: product.prijs_n_datapunten ?? 0 })}
      </span>
      <span className="absolute bottom-full left-0 mb-1 z-50 hidden group-hover:flex flex-col gap-0.5 min-w-max bg-popover border rounded-md shadow-lg p-2 text-xs">
        {product.prijs_min_jaar != null && (
          <span className="text-emerald-600">{t("laagste", { prijs: product.prijs_min_jaar.toFixed(2) })}</span>
        )}
        {product.prijs_gem_jaar != null && (
          <span className="text-muted-foreground">{t("gemiddelde", { prijs: product.prijs_gem_jaar.toFixed(2) })}</span>
        )}
        {product.prijs_max_jaar != null && (
          <span className="text-red-600">{t("hoogste", { prijs: product.prijs_max_jaar.toFixed(2) })}</span>
        )}
      </span>
    </span>
  )
}

interface Props {
  resultaat: VergelijkingsResultaat | LocatieResultaat
}

export default function ResultatenTabel({ resultaat }: Props) {
  const t = useTranslations("resultaten")
  const isLocatie = isLocatieResultaat(resultaat)
  const [weergave, setWeergave] = useState<"product" | "winkel">("product")
  const verg = isLocatie ? resultaat.vergelijking : resultaat

  const locatieMap: Record<string, SupermarktLocatie> = {}
  if (isLocatie) {
    for (const sm of resultaat.supermarkten_nabij ?? []) {
      const huidig = locatieMap[sm.naam]
      if (!huidig || (sm.afstand_km ?? Infinity) < (huidig.afstand_km ?? Infinity)) {
        locatieMap[sm.naam] = sm
      }
    }
  }

  const VERVOER_LABELS: Record<string, string> = {
    driving: t("rijden"),
    cycling: t("fietsen"),
    walking: t("lopen"),
  }

  const supermarkten = Object.keys(verg.totaal_per_supermarkt).sort(
    (a, b) => verg.totaal_per_supermarkt[a] - verg.totaal_per_supermarkt[b]
  )

  if (supermarkten.length === 0) {
    return <p className="text-muted-foreground">{t("geenResultaten")}</p>
  }

  const goedkoopste = verg.goedkoopste_supermarkt
  const besteMatch = verg.beste_match_supermarkt
  const aanbevolen = isLocatie ? resultaat.aanbevolen_supermarkt : undefined
  const aanbevelingReden = isLocatie ? resultaat.aanbeveling_reden : undefined
  const aantalProducten = verg.producten.length
  const heeftLocatieData = isLocatie && (resultaat.supermarkten_nabij?.length ?? 0) > 0
  const vervoer = isLocatie ? resultaat.vervoer : "driving"
  const besparing = (verg as { besparing?: number }).besparing

  function gegroepeerdeItemsVoorWinkel(sm: string) {
    return verg.producten.reduce<{ zoekopdracht: string; product: Product | null; aantal: number }[]>(
      (acc, p) => {
        const bestaand = acc.find((g) => g.zoekopdracht === p.zoekopdracht)
        if (bestaand) { bestaand.aantal++ } else {
          acc.push({ zoekopdracht: p.zoekopdracht, product: p.matches[sm] ?? null, aantal: 1 })
        }
        return acc
      }, []
    )
  }

  return (
    <div className="space-y-6">
      {/* Aanbeveling */}
      {aanbevolen && (
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/10">
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-semibold text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
              <Trophy size={14} strokeWidth={2} />{t("aanbeveling")}
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
          <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-100/40 dark:from-emerald-950/20 dark:to-green-900/10">
            <CardHeader className="pb-1">
              <CardTitle className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <TrendingDown size={14} strokeWidth={2} />{t("goedkoopste")}
              </CardTitle>
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
                <span className="font-display font-bold text-lg nums text-emerald-700 dark:text-emerald-400">
                  €{verg.totaal_per_supermarkt[goedkoopste].toFixed(2)}
                </span>
                {" "}· {t("dekking", { gevonden: verg.dekking_per_supermarkt[goedkoopste] ?? "?", totaal: aantalProducten })}
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
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-sky-100/40 dark:from-blue-950/20 dark:to-sky-900/10">
            <CardHeader className="pb-1">
              <CardTitle className="text-sm font-semibold text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                <Package size={14} strokeWidth={2} />{t("meesteProducten")}
              </CardTitle>
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
                <span className="font-display font-bold text-lg nums">
                  €{verg.totaal_per_supermarkt[besteMatch].toFixed(2)}
                </span>
                {" "}· {t("dekking", { gevonden: verg.dekking_per_supermarkt[besteMatch] ?? "?", totaal: aantalProducten })}
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

      {/* Besparingsbanner */}
      {besparing != null && besparing > 0.10 && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 px-4 py-3">
          <span className="text-xl">💡</span>
          <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
            {t("besparing", { bedrag: besparing.toFixed(2) })}
          </p>
        </div>
      )}

      {/* Mobiel: cards per supermarkt */}
      <div className="sm:hidden space-y-2">
        {supermarkten.map((sm, idx) => {
          const totaal = verg.totaal_per_supermarkt[sm]
          const dekking = verg.dekking_per_supermarkt?.[sm]
          const isGoedkoopste = sm === goedkoopste
          const isBesteMatch = sm === besteMatch
          const isAanbevolen = sm === aanbevolen
          const loc = locatieMap[sm]

          return (
            <div
              key={sm}
              className={`rounded-xl border p-3 flex items-center gap-3 ${
                isGoedkoopste
                  ? "border-emerald-200 bg-gradient-to-r from-emerald-50/80 to-transparent"
                  : "bg-card"
              }`}
            >
              {idx === 0 && (
                <span className="absolute ml-[-8px] mt-[-8px] w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center">
                  1
                </span>
              )}
              <SupermarktLogo naam={sm} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1 mb-0.5">
                  <span className="font-semibold text-sm">{sm}</span>
                  {isAanbevolen && <Badge variant="secondary" className="text-[10px] px-1.5 bg-purple-100 text-purple-800 border border-purple-200">{t("badgeAanbevolen")}</Badge>}
                  {isGoedkoopste && !isAanbevolen && <Badge variant="secondary" className="text-[10px] px-1.5 bg-emerald-100 text-emerald-800 border border-emerald-200">{t("badgeGoedkoopst")}</Badge>}
                  {isBesteMatch && !isGoedkoopste && !isAanbevolen && <Badge variant="secondary" className="text-[10px] px-1.5 bg-blue-100 text-blue-800 border border-blue-200">{t("badgeMeesteProducten")}</Badge>}
                </div>
                {loc && <AdresTekst loc={loc} />}
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <span>{t("dekking", { gevonden: dekking ?? "?", totaal: aantalProducten })}</span>
                  {loc?.afstand_km != null && (
                    <><span>·</span><span>{loc.afstand_km.toFixed(1)} km</span><span>·</span><span>{Math.round(loc.reistijd_min ?? 0)} min</span></>
                  )}
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className={`nums font-bold ${isGoedkoopste ? "font-display text-lg text-emerald-700" : "text-base"}`}>
                  €{totaal.toFixed(2)}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Desktop: tabel */}
      <div className="hidden sm:block overflow-x-auto rounded-xl border shadow-sm">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-muted/60 border-b">
              <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wide text-muted-foreground">#</th>
              <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wide text-muted-foreground">{t("kolomSupermarkt")}</th>
              {heeftLocatieData && <th className="px-4 py-3 text-right font-semibold text-xs uppercase tracking-wide text-muted-foreground whitespace-nowrap">{t("kolomAfstand")}</th>}
              {heeftLocatieData && <th className="px-4 py-3 text-right font-semibold text-xs uppercase tracking-wide text-muted-foreground whitespace-nowrap">{t("kolomReistijd")}</th>}
              <th className="px-4 py-3 text-right font-semibold text-xs uppercase tracking-wide text-muted-foreground whitespace-nowrap">{t("kolomProducten")}</th>
              <th className="px-4 py-3 text-right font-semibold text-xs uppercase tracking-wide text-muted-foreground whitespace-nowrap w-28">{t("kolomTotaal")}</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {supermarkten.map((sm, idx) => {
              const totaal = verg.totaal_per_supermarkt[sm]
              const dekking = verg.dekking_per_supermarkt?.[sm]
              const isGoedkoopste = sm === goedkoopste
              const isBesteMatch = sm === besteMatch
              const isAanbevolen = sm === aanbevolen
              const loc = locatieMap[sm]

              return (
                <tr
                  key={sm}
                  className={isGoedkoopste ? "bg-emerald-50/60 dark:bg-emerald-950/10" : "hover:bg-muted/30 transition-colors"}
                >
                  <td className="px-4 py-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      idx === 0 ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"
                    }`}>
                      {idx + 1}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <SupermarktLogo naam={sm} />
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5 font-medium">
                          {sm}
                          {isAanbevolen && <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800 border border-purple-200">{t("badgeAanbevolen")}</Badge>}
                          {isGoedkoopste && !isAanbevolen && <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-800 border border-emerald-200">{t("badgeGoedkoopst")}</Badge>}
                          {isBesteMatch && !isGoedkoopste && !isAanbevolen && <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 border border-blue-200">{t("badgeMeesteProducten")}</Badge>}
                        </div>
                        {loc && <AdresTekst loc={loc} />}
                      </div>
                    </div>
                  </td>
                  {heeftLocatieData && (
                    <td className="px-4 py-3 text-right text-muted-foreground align-top whitespace-nowrap">
                      {loc?.afstand_km != null ? `${loc.afstand_km.toFixed(1)} km` : t("geenData")}
                    </td>
                  )}
                  {heeftLocatieData && (
                    <td className="px-4 py-3 text-right text-muted-foreground align-top whitespace-nowrap">
                      {loc?.reistijd_min != null ? `${Math.round(loc.reistijd_min)} min` : t("geenData")}
                    </td>
                  )}
                  <td className="px-4 py-3 text-right text-muted-foreground align-top whitespace-nowrap">
                    {dekking !== undefined ? `${dekking}/${aantalProducten}` : t("geenData")}
                  </td>
                  <td className="px-4 py-3 text-right align-top whitespace-nowrap w-28">
                    <span className={`nums font-bold ${isGoedkoopste ? "font-display text-xl text-emerald-700 dark:text-emerald-400" : "text-base"}`}>
                      €{totaal.toFixed(2)}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Weergave-toggle */}
      <div className="flex rounded-lg border overflow-hidden text-sm font-medium">
        <button
          type="button"
          onClick={() => setWeergave("product")}
          className={`flex-1 px-4 py-2.5 transition-colors ${
            weergave === "product"
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted/50 text-muted-foreground"
          }`}
        >
          <span className="inline-flex items-center gap-1.5"><Package size={14} strokeWidth={2} />{t("perProduct")}</span>
        </button>
        <button
          type="button"
          onClick={() => setWeergave("winkel")}
          className={`flex-1 px-4 py-2.5 border-l transition-colors ${
            weergave === "winkel"
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted/50 text-muted-foreground"
          }`}
        >
          <span className="inline-flex items-center gap-1.5"><ShoppingCart size={14} strokeWidth={2} />{t("perWinkel")}</span>
        </button>
      </div>

      {/* Per product */}
      {weergave === "product" && (
        <div className="space-y-3">
          {verg.producten
            .reduce<{ item: typeof verg.producten[0]; aantal: number }[]>((acc, p) => {
              const bestaand = acc.find((g) => g.item.zoekopdracht === p.zoekopdracht)
              if (bestaand) { bestaand.aantal++ } else { acc.push({ item: p, aantal: 1 }) }
              return acc
            }, [])
            .map(({ item: gematched, aantal }) => (
            <div key={gematched.zoekopdracht} className="rounded-xl border p-4 bg-card hover:shadow-sm transition-shadow">
              <p className="font-semibold mb-3">
                {gematched.zoekopdracht}
                {aantal > 1 && (
                  <span className="ml-2 text-xs font-normal text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">×{aantal}</span>
                )}
              </p>
              <div className="space-y-2.5">
                {Object.entries(gematched.matches).map(([sm, product]) => (
                  <div key={sm} className="grid grid-cols-[auto_1fr] items-start gap-x-2 text-sm">
                    <div className="flex items-center gap-1.5 text-muted-foreground pt-0.5 w-28 shrink-0">
                      <SupermarktLogo naam={sm} size="sm" />
                      <span className="text-xs whitespace-nowrap overflow-hidden text-ellipsis">{sm}</span>
                    </div>
                    <div className="min-w-0">
                      {product === null ? (
                        <span className="text-muted-foreground italic text-xs">{t("nietGevonden")}</span>
                      ) : (
                        <div className="flex items-start gap-2">
                          <div className="flex-1 min-w-0">
                            {product.url ? (
                              <a href={product.url} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-primary transition-colors break-words hyphens-auto text-xs sm:text-sm leading-snug">
                                {product.naam}
                              </a>
                            ) : (
                              <span className="break-words hyphens-auto text-xs sm:text-sm leading-snug">{product.naam}</span>
                            )}
                            <div className="flex items-center gap-2 mt-0.5">
                              <PrijsTrend product={product} t={t} />
                              <PrijsHistorieTip product={product} t={t} />
                            </div>
                          </div>
                          <div className="shrink-0 text-right">
                            <span className="font-semibold nums text-xs sm:text-sm">
                              €{(product.prijs * aantal).toFixed(2)}
                            </span>
                            {aantal > 1 && (
                              <span className="block text-muted-foreground text-xs nums">
                                {t("prijsMetAantal", { prijs: product.prijs.toFixed(2), count: aantal })}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Per winkel */}
      {weergave === "winkel" && (
        <div className="space-y-3">
          {supermarkten.map((sm) => {
            const totaal = verg.totaal_per_supermarkt[sm]
            const loc = locatieMap[sm]
            const isGoedkoopste = sm === goedkoopste
            const isAanbevolen = sm === aanbevolen

            const items = gegroepeerdeItemsVoorWinkel(sm)
            const gevonden = items.filter((i) => i.product !== null)
            const nietGevonden = items.filter((i) => i.product === null)

            return (
              <div key={sm} className={`rounded-xl border overflow-hidden ${isGoedkoopste ? "border-emerald-200" : ""}`}>
                <div className={`flex items-center gap-3 p-4 ${isGoedkoopste ? "bg-gradient-to-r from-emerald-50 to-transparent" : "bg-muted/30"}`}>
                  <SupermarktLogo naam={sm} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                      <span className="font-bold text-sm">{sm}</span>
                      {isAanbevolen && <Badge variant="secondary" className="text-[10px] px-1.5 bg-purple-100 text-purple-800 border border-purple-200">{t("badgeAanbevolen")}</Badge>}
                      {isGoedkoopste && !isAanbevolen && <Badge variant="secondary" className="text-[10px] px-1.5 bg-emerald-100 text-emerald-800 border border-emerald-200">{t("badgeGoedkoopst")}</Badge>}
                    </div>
                    {loc && <AdresTekst loc={loc} />}
                    <span className="text-xs text-muted-foreground">{t("dekkingDetail", { gevonden: gevonden.length, totaal: aantalProducten })}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`font-display font-bold nums block ${isGoedkoopste ? "text-xl text-emerald-700" : "text-base"}`}>
                      €{totaal.toFixed(2)}
                    </span>
                    {loc?.afstand_km != null && (
                      <span className="text-xs text-muted-foreground block">
                        {loc.afstand_km.toFixed(1)} km · {Math.round(loc.reistijd_min ?? 0)} min
                      </span>
                    )}
                  </div>
                </div>

                <div className="divide-y px-4 py-1">
                  {gevonden.map(({ zoekopdracht, product, aantal }) => (
                    <div key={zoekopdracht} className="flex items-start gap-3 py-2.5 text-sm">
                      <div className="flex-1 min-w-0">
                        <span className="text-xs text-muted-foreground">{zoekopdracht}{aantal > 1 && ` ×${aantal}`}</span>
                        {product && (
                          <span className="block break-words hyphens-auto leading-snug mt-0.5">
                            {product.url ? (
                              <a href={product.url} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-primary transition-colors">
                                {product.naam}
                              </a>
                            ) : product.naam}
                          </span>
                        )}
                      </div>
                      <span className="font-semibold nums shrink-0 pt-3.5">
                        €{product ? (product.prijs * aantal).toFixed(2) : t("geenData")}
                      </span>
                    </div>
                  ))}
                  {nietGevonden.length > 0 && (
                    <div className="py-2.5">
                      <p className="text-xs text-muted-foreground italic">
                        {t("ontbrekendeProducten", { producten: nietGevonden.map((i) => i.zoekopdracht).join(", ") })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
