import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Contact – SupermarktVergelijker",
  description: "Neem contact op met SupermarktVergelijker.",
}

export default function ContactPage() {
  return (
    <div className="container max-w-2xl mx-auto px-4 py-16">
      <div className="mb-10">
        <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Contact</p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight mb-4">
          Neem contact op
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Heb je een vraag, foutmelding of suggestie? We horen het graag.
        </p>
      </div>

      <div className="space-y-6 text-base text-foreground/90">
        <div className="rounded-xl border border-border/60 bg-card p-6 space-y-3">
          <p className="font-semibold text-sm">E-mail</p>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Stuur een bericht naar{" "}
            <a
              href="mailto:info@supermarktvergelijker.nl"
              className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
            >
              info@supermarktvergelijker.nl
            </a>
            . We reageren doorgaans binnen twee werkdagen.
          </p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card p-6 space-y-3">
          <p className="font-semibold text-sm">Fout of mismatched product melden</p>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Zie je een product dat verkeerd gematcht is of een prijs die niet klopt? Vermeld in je
            e-mail welk product het betreft, bij welke supermarkt, en wat je verwachtte te zien.
            Zo kunnen we de matching snel verbeteren.
          </p>
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-border/40">
        <p className="text-sm text-muted-foreground">
          Meer weten over het project?{" "}
          <Link href="/over-ons" className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors">
            Lees over ons
          </Link>
        </p>
      </div>
    </div>
  )
}
