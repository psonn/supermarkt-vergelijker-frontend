import Link from "next/link"

export default function Footer() {
  const jaar = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-border/50 bg-background">
      <div className="container max-w-3xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 mb-8">
          {/* Branding */}
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-xs">
                🛒
              </div>
              <span className="font-display font-bold text-sm tracking-tight">
                Supermarkt<span className="text-primary">Vergelijker</span>
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Real-time prijsvergelijking voor Nederlandse supermarkten.
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="text-xs font-semibold text-foreground uppercase tracking-widest mb-3">Product</p>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Vergelijken
                </Link>
              </li>
              <li>
                <Link href="/mijn-lijsten" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Mijn lijsten
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Inloggen
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="text-xs font-semibold text-foreground uppercase tracking-widest mb-3">Bedrijf</p>
            <ul className="space-y-2">
              <li>
                <Link href="/over-ons" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Over ons
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/algemene-voorwaarden" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Algemene voorwaarden
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/40 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            © {jaar} SupermarktVergelijker. Alle rechten voorbehouden.
          </p>
          <p className="text-xs text-muted-foreground">
            Prijzen zijn indicatief en kunnen afwijken.
          </p>
        </div>
      </div>
    </footer>
  )
}
