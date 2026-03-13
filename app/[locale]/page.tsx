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
        className="pointer-events-none absolute -top-48 -left-48 w-[640px] h-[640px] rounded-full"
        style={{ background: "radial-gradient(circle, oklch(0.50 0.19 152 / 0.10), transparent 65%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 -right-32 w-[480px] h-[480px] rounded-full"
        style={{ background: "radial-gradient(circle, oklch(0.62 0.17 200 / 0.07), transparent 65%)" }}
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
            className="font-display text-[7vw] sm:text-5xl font-extrabold tracking-tight leading-[1.08] animate-fade-up"
            style={{ animationDelay: "70ms" }}
          >
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(130deg, oklch(0.50 0.19 152) 0%, oklch(0.62 0.17 185) 100%)",
              }}
            >
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
          {["ah", "jumbo", "dirk", "aldi", "spar", "dekamarkt", "ekoplaza", "vomar"].map((s) => (
            <img
              key={s}
              src={`/logos/${s}.svg`}
              alt={s}
              width={26}
              height={26}
              className="grayscale opacity-30 hover:opacity-60 hover:grayscale-0 transition-all duration-300"
            />
          ))}
        </div>
      </div>
    </main>
  )
}
