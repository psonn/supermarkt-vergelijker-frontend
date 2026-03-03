import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import BoodschappenlijstForm from "@/components/BoodschappenlijstForm"

export default function Home() {
  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      {/* Achtergrond glow-blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-[0.07]"
        style={{ background: "radial-gradient(circle, oklch(0.52 0.19 152), transparent 70%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-16 -right-16 w-[400px] h-[400px] rounded-full opacity-[0.06]"
        style={{ background: "radial-gradient(circle, oklch(0.65 0.18 200), transparent 70%)" }}
      />

      <div className="container max-w-xl mx-auto px-4 py-14 relative">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 rounded-full px-4 py-1.5 text-xs font-semibold mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Real-time prijzen · 7 supermarkten
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-3 leading-tight">
            Bespaar op je{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(135deg, oklch(0.52 0.19 152), oklch(0.65 0.18 200))" }}
            >
              boodschappen
            </span>
          </h1>
          <p className="text-muted-foreground text-base">
            Vergelijk prijzen bij Albert Heijn, Jumbo, Dirk en meer —
            <br className="hidden sm:block" /> vind de goedkoopste supermarkt bij jou in de buurt.
          </p>
        </div>

        <Card className="shadow-lg border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Jouw boodschappenlijst</CardTitle>
            <CardDescription>
              Voer je producten in en zie direct waar je het goedkoopst uit bent.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense>
              <BoodschappenlijstForm />
            </Suspense>
          </CardContent>
        </Card>

        {/* Supermarkt-logo strip */}
        <div className="mt-8 flex items-center justify-center gap-3 flex-wrap opacity-40">
          {["ah", "jumbo", "dirk", "aldi", "spar", "dekamarkt", "ekoplaza"].map((s) => (
            <img key={s} src={`/logos/${s}.svg`} alt={s} width={28} height={28} className="grayscale" />
          ))}
        </div>
      </div>
    </main>
  )
}
