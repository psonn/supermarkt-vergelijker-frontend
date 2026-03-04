import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Algemene voorwaarden – SupermarktVergelijker",
  description: "Lees de algemene voorwaarden van SupermarktVergelijker.",
}

const jaar = new Date().getFullYear()

export default function AlgemeneVoorwaardenPage() {
  return (
    <div className="container max-w-2xl mx-auto px-4 py-16">
      <div className="mb-10">
        <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Juridisch</p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight mb-4">
          Algemene voorwaarden
        </h1>
        <p className="text-muted-foreground text-sm">Versie 1.0 — van kracht per 1 januari {jaar}</p>
      </div>

      <div className="space-y-8 text-sm leading-relaxed text-foreground/85">
        <section>
          <h2 className="font-display font-semibold text-base text-foreground mb-2">1. Definities</h2>
          <p>
            <strong>SupermarktVergelijker</strong> verwijst naar de dienst beschikbaar via deze website.
            <strong> Gebruiker</strong> is iedere persoon die de dienst bezoekt of gebruikt.
            <strong> Prijsgegevens</strong> zijn de productprijzen die real-time worden opgehaald bij
            externe supermarktwebsites.
          </p>
        </section>

        <section>
          <h2 className="font-display font-semibold text-base text-foreground mb-2">2. Gebruik van de dienst</h2>
          <p>
            SupermarktVergelijker is een informatieve dienst bedoeld voor persoonlijk gebruik. Het is
            niet toegestaan de dienst te gebruiken voor commerciële doeleinden, geautomatiseerde
            dataverzameling of handelingen die de werking van de dienst schaden.
          </p>
        </section>

        <section>
          <h2 className="font-display font-semibold text-base text-foreground mb-2">3. Nauwkeurigheid van prijzen</h2>
          <p>
            Wij streven naar actuele en correcte prijsinformatie, maar kunnen de nauwkeurigheid niet
            garanderen. Prijzen worden live opgehaald bij externe partijen en kunnen afwijken van de
            werkelijke prijs in de winkel of webshop. Aan de getoonde informatie kunnen geen rechten
            worden ontleend.
          </p>
        </section>

        <section>
          <h2 className="font-display font-semibold text-base text-foreground mb-2">4. Aansprakelijkheid</h2>
          <p>
            SupermarktVergelijker is niet aansprakelijk voor schade die voortvloeit uit het gebruik
            van de dienst, onjuiste prijsinformatie, of tijdelijke onbeschikbaarheid van de dienst.
            De dienst wordt aangeboden "zoals hij is", zonder enige garantie op beschikbaarheid of
            volledigheid.
          </p>
        </section>

        <section>
          <h2 className="font-display font-semibold text-base text-foreground mb-2">5. Privacy</h2>
          <p>
            We verwerken alleen gegevens die nodig zijn voor de werking van de dienst, zoals het
            e-mailadres bij aanmelden. We verkopen geen persoonlijke gegevens aan derden. Zie voor
            meer informatie ons{" "}
            <Link href="/contact" className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors">
              contactformulier
            </Link>{" "}
            voor vragen over je gegevens.
          </p>
        </section>

        <section>
          <h2 className="font-display font-semibold text-base text-foreground mb-2">6. Wijzigingen</h2>
          <p>
            We behouden ons het recht voor deze voorwaarden op ieder moment te wijzigen. Gewijzigde
            voorwaarden worden op deze pagina gepubliceerd met een bijgewerkte versiedatum.
            Voortgezet gebruik van de dienst na wijziging geldt als aanvaarding van de nieuwe
            voorwaarden.
          </p>
        </section>

        <section>
          <h2 className="font-display font-semibold text-base text-foreground mb-2">7. Toepasselijk recht</h2>
          <p>
            Op deze voorwaarden is Nederlands recht van toepassing. Geschillen worden voorgelegd aan
            de bevoegde rechter in Nederland.
          </p>
        </section>
      </div>

      <div className="mt-12 pt-8 border-t border-border/40">
        <p className="text-sm text-muted-foreground">
          Vragen over deze voorwaarden?{" "}
          <Link href="/contact" className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors">
            Neem contact op
          </Link>
        </p>
      </div>
    </div>
  )
}
