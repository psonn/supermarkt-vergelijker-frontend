"use client"

import { Link } from "@/lib/i18n-navigation"
import { useTranslations } from "next-intl"

export default function Footer() {
  const t = useTranslations("footer")
  const jaar = new Date().getFullYear()

  return (
    <footer className="mt-auto bg-background relative">
      <div
        className="h-[2px]"
        style={{ background: "linear-gradient(90deg, oklch(0.50 0.19 152), oklch(0.62 0.17 185), oklch(0.72 0.20 50))" }}
      />
      <div className="container max-w-3xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 mb-8">
          {/* Branding */}
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.svg" alt="CheaperSupermarkets logo" className="h-7 w-auto" />
              <span className="font-display font-bold text-sm tracking-tight">
                Cheaper<span className="text-primary">Supermarkets</span>
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{t("tagline")}</p>
          </div>

          {/* Product links */}
          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">{t("product")}</p>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t("vergelijken")}
                </Link>
              </li>
              <li>
                <Link href="/mijn-lijsten" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t("lijsten")}
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t("inloggen")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Company links */}
          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">{t("bedrijf")}</p>
            <ul className="space-y-2">
              <li>
                <Link href="/over-ons" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t("overOns")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t("contact")}
                </Link>
              </li>
              <li>
                <Link href="/algemene-voorwaarden" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t("voorwaarden")}
                </Link>
              </li>
              <li>
                <Link href="/feedback" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t("feedback")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/40 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">{t("copyright", { year: jaar })}</p>
          <p className="text-xs text-muted-foreground">{t("disclaimer")}</p>
        </div>
      </div>
    </footer>
  )
}
