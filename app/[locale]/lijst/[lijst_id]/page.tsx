import { createClient } from "@supabase/supabase-js"
import { Link } from "@/lib/i18n-navigation"
import { Button } from "@/components/ui/button"
import ResultatenTabel from "@/components/ResultatenTabel"
import TijdLabel from "@/components/TijdLabel"
import DeelKnop from "@/components/DeelKnop"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

const BASE = "https://www.cheapersupermarkets.com"

interface Props {
  params: Promise<{ lijst_id: string; locale: string }>
}

function supabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lijst_id, locale } = await params
  const isEn = locale === "en"
  const pageUrl = `${BASE}${isEn ? "/en" : ""}/lijst/${lijst_id}`
  const imageUrl = `${BASE}/api/share-image/lijst/${lijst_id}`

  const supabase = supabaseClient()
  const naam = supabase
    ? (await supabase.from("lijsten").select("naam").eq("id", lijst_id).single()).data?.naam
    : null

  const title = naam
    ? (isEn ? `${naam} — CheaperSupermarkets` : `${naam} — CheaperSupermarkets`)
    : (isEn ? "Shared grocery list" : "Gedeelde boodschappenlijst")

  const description = isEn
    ? "Check out this supermarket price comparison — made with CheaperSupermarkets."
    : "Bekijk deze supermarktprijsvergelijking, gemaakt met CheaperSupermarkets."

  return {
    title,
    description,
    robots: { index: false },
    alternates: { canonical: pageUrl },
    openGraph: {
      title,
      description,
      url: pageUrl,
      type: "website",
      images: [{ url: imageUrl, width: 1080, height: 1350, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  }
}

export default async function PubliekeLijstPagina({ params }: Props) {
  const { lijst_id, locale } = await params
  const t = await getTranslations({ locale, namespace: "publiekeLijst" })

  const supabase = supabaseClient()
  if (!supabase) notFound()

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
          deelUrl={`${BASE}/lijst/${lijst_id}`}
        />
      </div>

      {/* Timestamp */}
      {lijst.laatste_vergelijking && (
        <p className="text-sm text-muted-foreground mb-6">
          {t("laatsVergelijking")} <TijdLabel iso={lijst.laatste_vergelijking} />
        </p>
      )}

      {/* Resultaten */}
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <ResultatenTabel resultaat={lijst.laatste_resultaat as any} />

      {/* CTA */}
      <div className="mt-10 text-center space-y-3">
        <p className="text-sm text-muted-foreground">
          {t("cta")}
        </p>
        <Link href="/">
          <Button>{t("ctaKnop")}</Button>
        </Link>
      </div>
    </main>
  )
}
