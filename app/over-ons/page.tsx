import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Over ons – SupermarktVergelijker",
  description: "Meer weten over SupermarktVergelijker? Lees hier ons verhaal.",
}

export default function OverOnsPage() {
  return (
    <div className="container max-w-2xl mx-auto px-4 py-16">
      <div className="mb-10">
        <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Over ons</p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight mb-4">
          Slimmer boodschappen doen
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          SupermarktVergelijker helpt je in één oogopslag zien waar je het goedkoopst uit bent.
        </p>
      </div>

      <div className="prose prose-neutral max-w-none space-y-6 text-base leading-relaxed text-foreground/90">
        <p>
          Boodschappen doen is duur. De ene winkel is goedkoper voor zuivel, de andere voor vlees
          of huishoudproducten. SupermarktVergelijker haalt real-time prijzen op bij Albert Heijn,
          Jumbo, Dirk, Aldi, Ekoplaza, Dekamarkt en Spar — zodat jij meteen ziet waar je het meeste
          bespaart.
        </p>
        <p>
          We houden ook rekening met je locatie. Niet elke supermarkt is even dichtbij, dus de app
          weegt prijs én reisafstand af en geeft een concreet advies: welke winkel is de beste balans
          voor jouw situatie?
        </p>
        <p>
          SupermarktVergelijker is een onafhankelijk project — geen betaalde plaatsingen, geen
          commissies. Gewoon eerlijke prijsvergelijking.
        </p>

        <div className="border-l-2 border-primary/30 pl-4 text-muted-foreground italic">
          Prijzen worden live opgehaald en zijn zo actueel mogelijk, maar kunnen licht afwijken van
          de prijs in de winkel of webshop.
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-border/40">
        <p className="text-sm text-muted-foreground">
          Vragen of opmerkingen?{" "}
          <Link href="/contact" className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors">
            Neem contact op
          </Link>
        </p>
      </div>
    </div>
  )
}
