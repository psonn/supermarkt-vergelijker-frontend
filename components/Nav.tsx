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
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setEmail(session?.user?.email ?? null)
    })
    return () => subscription.unsubscribe()
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
          <Link href="/" className="font-semibold text-sm">
            Supermarkt Vergelijker
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
