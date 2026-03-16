import { createClient } from "@supabase/supabase-js"
import { Link } from "@/lib/i18n-navigation"
import { Button } from "@/components/ui/button"
import ResultatenTabel from "@/components/ResultatenTabel"
import TijdLabel from "@/components/TijdLabel"
import DeelKnop from "@/components/DeelKnop"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

export const metadata: Metadata = { robots: { index: false } }

interface Props {
  params: Promise<{ lijst_id: string }>
}

export default async function PubliekeLijstPagina({ params }: Props) {
  const { lijst_id } = await params

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!SUPABASE_URL || !SERVICE_KEY) notFound()

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY)
  const { data: lijst } = await supabase
    .from("lijsten")
    .select("id, naam, laatste_resultaat, laatste_vergelijking")
    .eq("id", lijst_id)
    .single()

  if (!lijst?.laatste_resultaat) notFound()

  return (
    <main className="w-full max-w-3xl mx-auto px-3 sm:px-6 py-6 sm:py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 sm:mb-8 gap-3">
        <h1 className="text-lg sm:text-xl font-bold truncate">{lijst.naam}</h1>
        <DeelKnop
          shareImagePath={`/api/share-image/lijst/${lijst_id}`}
          deelUrl={`https://www.cheapersupermarkets.com/lijst/${lijst_id}`}
        />
      </div>

      {/* Timestamp */}
      {lijst.laatste_vergelijking && (
        <p className="text-sm text-muted-foreground mb-6">
          Laatste vergelijking: <TijdLabel iso={lijst.laatste_vergelijking} />
        </p>
      )}

      {/* Resultaten */}
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <ResultatenTabel resultaat={lijst.laatste_resultaat as any} />

      {/* CTA */}
      <div className="mt-10 text-center space-y-3">
        <p className="text-sm text-muted-foreground">
          Vergelijk ook jouw boodschappenlijst gratis
        </p>
        <Link href="/">
          <Button>Maak mijn eigen vergelijking</Button>
        </Link>
      </div>
    </main>
  )
}
