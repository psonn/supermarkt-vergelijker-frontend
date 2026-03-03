"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { Separator } from "@/components/ui/separator"

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
    <>
      <header className="border-b bg-background">
        <div className="container max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-semibold text-sm flex items-center gap-2">
            Supermarkt Vergelijker
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
              beta
            </span>
          </Link>
          <nav className="flex items-center gap-3">
            {email ? (
              <>
                <Link href="/mijn-lijsten">
                  <Button variant="ghost" size="sm">Mijn lijsten</Button>
                </Link>
                <Button variant="outline" size="sm" onClick={uitloggen}>
                  Uitloggen
                </Button>
              </>
            ) : (
              <Link href="/login">
                <Button variant="outline" size="sm">Inloggen</Button>
              </Link>
            )}
          </nav>
        </div>
      </header>
      <Separator />
    </>
  )
}
