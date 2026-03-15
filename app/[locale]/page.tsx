import { Suspense } from "react"
import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import BoodschappenlijstForm from "@/components/BoodschappenlijstForm"
import { getTranslations, getLocale } from "next-intl/server"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const isNL = locale === "nl"
  return {
    title: isNL
      ? "CheaperSupermarkets — Vergelijk supermarktprijzen"
      : "CheaperSupermarkets — Compare supermarket prices",
    description: isNL
      ? "Vergelijk real-time prijzen bij Albert Heijn, Jumbo, Dirk, Aldi en meer. Vind de goedkoopste supermarkt bij jou in de buurt."
      : "Compare real-time prices at Albert Heijn, Jumbo, Dirk, Aldi and more. Find the cheapest supermarket near you.",
    openGraph: {
      title: isNL ? "CheaperSupermarkets" : "CheaperSupermarkets",
      description: isNL
        ? "Real-time prijsvergelijking voor Nederlandse supermarkten."
        : "Real-time price comparison for Dutch supermarkets.",
      url: isNL ? "https://www.cheapersupermarkets.com" : "https://www.cheapersupermarkets.com/en",
    },
    alternates: {
      canonical: isNL ? "https://www.cheapersupermarkets.com" : "https://www.cheapersupermarkets.com/en",
      languages: {
        nl: "https://www.cheapersupermarkets.com",
        en: "https://www.cheapersupermarkets.com/en",
      },
    },
  }
}

export default async function Home() {
  const t = await getTranslations("home")

  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 dot-grid" />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-48 -left-48 w-[700px] h-[700px] rounded-full"
        style={{ background: "radial-gradient(circle, oklch(0.50 0.19 152 / 0.18), transparent 65%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 -right-32 w-[520px] h-[520px] rounded-full"
        style={{ background: "radial-gradient(circle, oklch(0.62 0.17 200 / 0.14), transparent 65%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full"
        style={{ background: "radial-gradient(circle, oklch(0.72 0.20 50 / 0.06), transparent 70%)" }}
      />

      <div className="container max-w-xl mx-auto px-4 py-14 relative">
        <div className="text-center mb-10 space-y-5">
          <div
            className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide animate-fade-up"
            style={{ animationDelay: "0ms" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            {t("tagline")}
          </div>

          <h1
            className="font-display text-5xl font-extrabold tracking-tight leading-[1.08] animate-fade-up"
            style={{ animationDelay: "70ms" }}
          >
            <span className="gradient-text">
              {t("titel")}
            </span>
          </h1>

          <p
            className="text-muted-foreground text-[15px] max-w-[340px] mx-auto leading-relaxed animate-fade-up"
            style={{ animationDelay: "130ms" }}
          >
            {t("subtitel")}
          </p>
        </div>

        <div className="animate-fade-up" style={{ animationDelay: "190ms" }}>
          <Card className="shadow-xl border-border/50">
            <div className="overflow-hidden rounded-t-xl">
            <div
              className="h-[3px]"
              style={{
                background:
                  "linear-gradient(90deg, oklch(0.50 0.19 152), oklch(0.62 0.17 185), oklch(0.72 0.20 50))",
              }}
            />
            </div>
            <CardHeader className="pb-4 pt-5">
              <CardTitle className="font-display text-lg">{t("lijstTitel")}</CardTitle>
              <CardDescription>{t("lijstSubtitel")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense>
                <BoodschappenlijstForm />
              </Suspense>
            </CardContent>
          </Card>
        </div>

        <div
          className="mt-8 flex items-center justify-center gap-3.5 flex-wrap animate-fade-up"
          style={{ animationDelay: "280ms" }}
        >
          {[
            { id: "ah", naam: "Albert Heijn" },
            { id: "jumbo", naam: "Jumbo" },
            { id: "dirk", naam: "Dirk" },
            { id: "aldi", naam: "Aldi" },
            { id: "spar", naam: "Spar" },
            { id: "dekamarkt", naam: "Dekamarkt" },
            { id: "ekoplaza", naam: "Ekoplaza" },
            { id: "vomar", naam: "Vomar" },
          ].map(({ id, naam }) => (
            <img
              key={id}
              src={`/logos/${id}.png`}
              alt={`${naam} logo`}
              width={72}
              height={28}
              loading="lazy"
              className="opacity-50 hover:opacity-100 transition-all duration-300 object-contain"
              style={{ height: 28, width: "auto", maxWidth: 72 }}
            />
          ))}
        </div>
      </div>
    </main>
  )
}
