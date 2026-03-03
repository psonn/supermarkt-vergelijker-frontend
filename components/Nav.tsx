"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

export default function Nav() {
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    try {
      const supabase = createClient()
      supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null))
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
        setEmail(session?.user?.email ?? null)
      })
      return () => subscription.unsubscribe()
    } catch {
      // Supabase niet geconfigureerd — auth niet beschikbaar
    }
  }, [])

  async function uitloggen() {
    await createClient().auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur-md">
      <div className="container max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-primary-foreground text-base shadow-sm group-hover:scale-105 transition-transform">
            🛒
          </div>
          <span className="font-bold text-sm tracking-tight">
            Supermarkt<span className="text-primary">Vergelijker</span>
          </span>
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
            beta
          </span>
        </Link>
        <nav className="flex items-center gap-2">
          {email ? (
            <>
              <Link href="/mijn-lijsten">
                <Button variant="ghost" size="sm" className="text-sm">
                  Mijn lijsten
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={uitloggen} className="text-sm border-border/60">
                Uitloggen
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button size="sm" variant="outline" className="text-sm border-border/60">
                Inloggen
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
