import type { Metadata } from "next"
import { redirect } from "@/lib/i18n-navigation"

export const metadata: Metadata = { robots: { index: false } }
import { Link } from "@/lib/i18n-navigation"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import LijstKaart from "@/components/LijstKaart"
import type { PrijsAlert } from "@/lib/api"
import { getTranslations, getLocale } from "next-intl/server"

interface Lijst {
  id: string
  naam: string
  producten: string[]
  locatie?: string | null
  aangemaakt_op: string
  laatste_vergelijking?: string | null
  laatste_resultaat?: Record<string, unknown> | null
  supermarkten?: string[] | null
  straal?: number | null
  vervoer?: string | null
}

export default async function MijnLijstenPagina() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const locale = await getLocale()

  if (!user) {
    redirect({ href: `/login?redirect=/mijn-lijsten`, locale })
    return null
  }

  const t = await getTranslations("lijsten")

  const [{ data: lijsten }, { data: alerts }] = await Promise.all([
    supabase
      .from("lijsten")
      .select("id, naam, producten, locatie, aangemaakt_op, laatste_vergelijking, laatste_resultaat, supermarkten, straal, vervoer")
      .eq("user_id", user.id)
      .order("aangemaakt_op", { ascending: false }),
    supabase
      .from("prijsalerts")
      .select("*")
      .eq("user_id", user.id),
  ])

  const alertsPerLijst = ((alerts ?? []) as PrijsAlert[]).reduce<Record<string, PrijsAlert>>(
    (acc, a) => { acc[a.lijst_id] = a; return acc },
    {}
  )

  return (
    <main className="container max-w-2xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl font-bold">
          <span className="gradient-text">{t("titel")}</span>
        </h1>
        <Link href="/">
          <Button size="sm">{t("nieuweVergelijking")}</Button>
        </Link>
      </div>

      {!lijsten || lijsten.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-5">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-primary">
              <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/>
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
            </svg>
          </div>
          <p className="text-foreground font-medium mb-1">{t("geenLijsten")}</p>
          <p className="text-sm text-muted-foreground mb-5">{t("geenLijstenSub", { defaultValue: "Vergelijk supermarktprijzen en bewaar je resultaten." })}</p>
          <Link href="/">
            <Button>{t("startVergelijking")}</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {(lijsten as Lijst[]).map((lijst) => {
            // Extraheer gebruikte supermarkten uit opgeslagen resultaat
            const r = lijst.laatste_resultaat as Record<string, unknown> | null | undefined
            const supermarkten: string[] | undefined = r
              ? Object.keys(
                  (("vergelijking" in r
                    ? (r.vergelijking as Record<string, unknown>)
                    : r).totaal_per_supermarkt as Record<string, unknown>) ?? {}
                )
              : undefined
            return (
            <LijstKaart
              key={lijst.id}
              lijst={{
                ...lijst,
                supermarkten_opgeslagen: lijst.supermarkten,
                straal_opgeslagen: lijst.straal,
                vervoer_opgeslagen: lijst.vervoer,
              }}
              gebruikerEmail={user.email ?? ""}
              bestaandeAlert={alertsPerLijst[lijst.id] ?? null}
              heeft_resultaat={!!lijst.laatste_vergelijking}
              supermarkten={supermarkten}
            />
            )
          })}
        </div>
      )}
    </main>
  )
}
