import { redirect } from "@/lib/i18n-navigation"
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
  laatste_vergelijking?: string
}

export default async function MijnLijstenPagina() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const locale = await getLocale()

  if (!user) redirect({ href: `/login?redirect=/mijn-lijsten`, locale })

  const t = await getTranslations("lijsten")

  const [{ data: lijsten }, { data: alerts }] = await Promise.all([
    supabase
      .from("lijsten")
      .select("id, naam, producten, locatie, aangemaakt_op, laatste_vergelijking")
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
        <h1 className="text-2xl font-bold">{t("titel")}</h1>
        <Link href="/">
          <Button size="sm">{t("nieuweVergelijking")}</Button>
        </Link>
      </div>

      {!lijsten || lijsten.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="mb-4">{t("geenLijsten")}</p>
          <Link href="/">
            <Button variant="outline">{t("startVergelijking")}</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {(lijsten as Lijst[]).map((lijst) => (
            <LijstKaart
              key={lijst.id}
              lijst={lijst}
              gebruikerEmail={user.email ?? ""}
              bestaandeAlert={alertsPerLijst[lijst.id] ?? null}
            />
          ))}
        </div>
      )}
    </main>
  )
}
