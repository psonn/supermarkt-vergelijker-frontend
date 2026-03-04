import type { Metadata } from "next"
import { Link } from "@/lib/i18n-navigation"
import { getTranslations } from "next-intl/server"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("contact")
  return {
    title: `${t("titel")} – SupermarktVergelijker`,
  }
}

export default async function ContactPage() {
  const t = await getTranslations("contact")

  return (
    <div className="container max-w-2xl mx-auto px-4 py-16">
      <div className="mb-10">
        <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">{t("label")}</p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight mb-4">
          {t("titel")}
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed">{t("subtitel")}</p>
      </div>

      <div className="space-y-6 text-base text-foreground/90">
        <div className="rounded-xl border border-border/60 bg-card p-6 space-y-3">
          <p className="font-semibold text-sm">{t("emailTitel")}</p>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {t("emailTekst")}{" "}
            <a
              href={`mailto:${t("emailAdres")}`}
              className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
            >
              {t("emailAdres")}
            </a>
            . {t("emailReactie")}
          </p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card p-6 space-y-3">
          <p className="font-semibold text-sm">{t("foutMeldenTitel")}</p>
          <p className="text-muted-foreground text-sm leading-relaxed">{t("foutMeldenTekst")}</p>
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-border/40">
        <p className="text-sm text-muted-foreground">
          {t("overOnsTekst")}{" "}
          <Link href="/over-ons" className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors">
            {t("overOnsLink")}
          </Link>
        </p>
      </div>
    </div>
  )
}
