import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabaseAdmin =
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    : null

export async function GET(request: Request) {
  if (!supabaseAdmin) return NextResponse.json([], { status: 200 })

  const { searchParams } = new URL(request.url)
  const geselecteerd = searchParams.get("producten")?.split(",").filter(Boolean) ?? []
  if (geselecteerd.length === 0) return NextResponse.json([], { status: 200 })

  const { data, error } = await supabaseAdmin.rpc("suggereer_producten", {
    geselecteerd,
    limiet: 5,
  })

  if (error) {
    console.error("[product-suggesties]", error)
    return NextResponse.json([], { status: 200 })
  }

  return NextResponse.json((data ?? []).map((r: { product: string }) => r.product))
}
