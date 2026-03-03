import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import LijstKaart from "@/components/LijstKaart"
import type { PrijsAlert } from "@/lib/api"

interface Lijst {
  id: string
  naam: string
  producten: string[]
  aangemaakt_op: string
  laatste_vergelijking?: string
}

export default async function MijnLijstenPagina() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login?redirect=/mijn-lijsten")

  const [{ data: lijsten }, { data: alerts }] = await Promise.all([
    supabase
      .from("lijsten")
      .select("id, naam, producten, aangemaakt_op, laatste_vergelijking")
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
        <h1 className="text-2xl font-bold">Mijn lijsten</h1>
        <Link href="/">
          <Button size="sm">Nieuwe vergelijking</Button>
        </Link>
      </div>

      {!lijsten || lijsten.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="mb-4">Je hebt nog geen lijsten opgeslagen.</p>
          <Link href="/">
            <Button variant="outline">Start een vergelijking</Button>
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
