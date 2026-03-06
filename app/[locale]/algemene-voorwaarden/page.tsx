import type { Metadata } from "next"
import { Link } from "@/lib/i18n-navigation"
import { getTranslations } from "next-intl/server"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("voorwaarden")
  return {
    title: `${t("titel")} – SupermarktVergelijker`,
  }
}

export default async function AlgemeneVoorwaardenPage() {
  const t = await getTranslations("voorwaarden")
  const jaar = new Date().getFullYear()

  return (
    <div className="container max-w-2xl mx-auto px-4 py-16">
      <div className="mb-10">
        <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">{t("label")}</p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight mb-4">
          {t("titel")}
        </h1>
        <p className="text-muted-foreground text-sm">{t("versie", { jaar })}</p>
      </div>

      <div className="space-y-8 text-sm leading-relaxed text-foreground/85">
        {([1, 2, 3, 4, 5, 6, 7, 8] as const).map((n) => (
          <section key={n}>
            <h2 className="font-display font-semibold text-base text-foreground mb-2">
              {t(`art${n}Titel` as `art${typeof n}Titel`)}
            </h2>
            <p>{t(`art${n}Tekst` as `art${typeof n}Tekst`)}</p>
            {n === 5 && (
              <p className="mt-2">
                <Link href="/contact" className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors">
                  {t("art5Contact")}
                </Link>{" "}
                {t("art5ContactSuffix")}
              </p>
            )}
          </section>
        ))}
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
