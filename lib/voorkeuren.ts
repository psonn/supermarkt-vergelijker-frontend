/**
 * lib/voorkeuren.ts
 * Opslaan en laden van zoekfilter-voorkeuren.
 * localStorage = primair (snel, ook offline)
 * Supabase = sync voor ingelogde gebruikers (cross-device)
 */

import { createClient } from "@/lib/supabase/client"

export interface Voorkeuren {
  supermarkten: string[]
  straal: number
  vervoer: "driving" | "cycling" | "walking"
}

const LS_KEY = "sv_voorkeuren"

function leesLocalStorage(): Voorkeuren | null {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) return JSON.parse(raw) as Voorkeuren
  } catch { /* negeer */ }
  return null
}

function schrijfLocalStorage(v: Voorkeuren) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(v)) } catch { /* negeer */ }
}

export async function laadVoorkeuren(): Promise<Voorkeuren | null> {
  // Probeer eerst localStorage (instant)
  const lokaal = leesLocalStorage()

  // Haal Supabase op als gebruiker ingelogd is
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return lokaal

    const { data } = await supabase
      .from("voorkeuren")
      .select("supermarkten, straal, vervoer")
      .eq("user_id", user.id)
      .single()

    if (data) {
      const remote: Voorkeuren = {
        supermarkten: data.supermarkten ?? [],
        straal: data.straal ?? 5,
        vervoer: (data.vervoer as Voorkeuren["vervoer"]) ?? "driving",
      }
      // Sync naar localStorage zodat volgende load instant is
      schrijfLocalStorage(remote)
      return remote
    }
  } catch { /* Supabase niet beschikbaar */ }

  return lokaal
}

export async function slaVoorkeurenOp(v: Voorkeuren): Promise<void> {
  schrijfLocalStorage(v)

  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from("voorkeuren").upsert({
      user_id: user.id,
      supermarkten: v.supermarkten,
      straal: v.straal,
      vervoer: v.vervoer,
      bijgewerkt_op: new Date().toISOString(),
    }, { onConflict: "user_id" })
  } catch { /* stil falen */ }
}
