import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"

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

  const { data: lijsten } = await supabase
    .from("lijsten")
    .select("id, naam, producten, aangemaakt_op, laatste_vergelijking")
    .eq("user_id", user.id)
    .order("aangemaakt_op", { ascending: false })

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
            <Card key={lijst.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{lijst.naam}</CardTitle>
                <CardDescription>
                  {lijst.producten.length} producten ·{" "}
                  {new Date(lijst.aangemaakt_op).toLocaleDateString("nl-NL")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  {lijst.producten.join(", ")}
                </p>
                <NieuweVergelijkingKnop producten={lijst.producten} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  )
}

function NieuweVergelijkingKnop({ producten }: { producten: string[] }) {
  const params = new URLSearchParams()
  params.set("producten", producten.join("\n"))
  return (
    <Link href={`/?${params}`}>
      <Button variant="outline" size="sm">Opnieuw vergelijken</Button>
    </Link>
  )
}
