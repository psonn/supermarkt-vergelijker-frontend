import type { Metadata } from "next"
import { Link } from "@/lib/i18n-navigation"
import { getTranslations } from "next-intl/server"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("overOns")
  return {
    title: `${t("titel")} – CheaperSupermarkets`,
  }
}

export default async function OverOnsPage() {
  const t = await getTranslations("overOns")

  return (
    <div className="container max-w-2xl mx-auto px-4 py-16">
      <div className="mb-10">
        <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">{t("label")}</p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight mb-4">
          {t("titel")}
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed">{t("subtitel")}</p>
      </div>

      <div className="prose prose-neutral max-w-none space-y-6 text-base leading-relaxed text-foreground/90">
        <p>{t("alinea1")}</p>
        <p>{t("alinea2")}</p>
        <p>{t("alinea3")}</p>
        <div className="border-l-2 border-primary/30 pl-4 text-muted-foreground italic">
          {t("disclaimer")}
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-border/40">
        <p className="text-sm text-muted-foreground">
          {t("contactTekst")}{" "}
          <Link href="/contact" className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors">
            {t("contactLink")}
          </Link>
        </p>
      </div>
    </div>
  )
}
