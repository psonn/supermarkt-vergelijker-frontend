import type { Metadata } from "next"
import { Link } from "@/lib/i18n-navigation"
import { getTranslations } from "next-intl/server"

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Account bevestigd – SupermarktVergelijker" }
}

export default async function BevestigdPage() {
  const t = await getTranslations("bevestigd")

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-sm animate-fade-up">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-3xl mx-auto mb-6">
          ✓
        </div>
        <h1 className="font-display text-2xl font-bold tracking-tight mb-3">{t("titel")}</h1>
        <p className="text-muted-foreground text-sm leading-relaxed mb-8">{t("subtitel")}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/mijn-lijsten"
            className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            {t("naarLijsten")}
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg border border-border/60 px-5 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
          >
            {t("vergelijken")}
          </Link>
        </div>
      </div>
    </div>
  )
}
