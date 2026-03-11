import { redirect } from "@/lib/i18n-navigation"
import { Link } from "@/lib/i18n-navigation"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import ResultatenTabel from "@/components/ResultatenTabel"
import { getLocale } from "next-intl/server"
import { ChevronLeft, Play, RefreshCw } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = { robots: { index: false } }

interface Props {
  params: Promise<{ lijst_id: string }>
}

export default async function LijstResultatenPagina({ params }: Props) {
  const { lijst_id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const locale = await getLocale()

  if (!user) {
    redirect({ href: `/login?redirect=/mijn-lijsten/${lijst_id}`, locale })
    return null
  }

  const { data: lijst } = await supabase
    .from("lijsten")
    .select("id, naam, producten, locatie, laatste_resultaat, laatste_vergelijking")
    .eq("id", lijst_id)
    .eq("user_id", user.id)
    .single()

  if (!lijst) {
    redirect({ href: "/mijn-lijsten", locale })
    return null
  }

  // Bouw de "Zoek opnieuw" URL
  const params2 = new URLSearchParams()
  params2.set("producten", (lijst.producten as string[]).join("\n"))
  params2.set("autostart", "1")
  params2.set("update_lijst_id", lijst.id)
  if (lijst.locatie) params2.set("locatie", lijst.locatie)
  const zoekOpnieuwUrl = `/?${params2.toString()}`

  const datumLabel = lijst.laatste_vergelijking
    ? new Date(lijst.laatste_vergelijking).toLocaleString("nl-NL", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null

  return (
    <main className="w-full max-w-3xl mx-auto px-3 sm:px-6 py-6 sm:py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 sm:mb-8 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/mijn-lijsten">
            <Button variant="ghost" size="sm" className="shrink-0 -ml-2">
              <ChevronLeft size={16} strokeWidth={2} className="mr-1" />
              Mijn lijsten
            </Button>
          </Link>
          <h1 className="text-lg sm:text-xl font-bold truncate">{lijst.naam}</h1>
        </div>
        <Link href={zoekOpnieuwUrl}>
          <Button size="sm" className="shrink-0 gap-1.5">
            <RefreshCw size={13} strokeWidth={2.5} />
            Zoek opnieuw
          </Button>
        </Link>
      </div>

      {/* Timestamp */}
      {datumLabel && (
        <p className="text-sm text-muted-foreground mb-6">
          Laatste vergelijking: {datumLabel}
        </p>
      )}

      {/* Resultaten of lege staat */}
      {lijst.laatste_resultaat ? (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        <ResultatenTabel resultaat={lijst.laatste_resultaat as any} />
      ) : (
        <div className="text-center py-16 text-muted-foreground space-y-4">
          <p>Er zijn nog geen opgeslagen resultaten voor deze lijst.</p>
          <Link href={zoekOpnieuwUrl}>
            <Button className="gap-2">
              <Play size={13} strokeWidth={2.5} fill="currentColor" />
              Vergelijk nu
            </Button>
          </Link>
        </div>
      )}
    </main>
  )
}
