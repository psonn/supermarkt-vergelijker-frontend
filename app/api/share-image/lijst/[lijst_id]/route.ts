import { ImageResponse } from "next/og"
import { createClient } from "@supabase/supabase-js"
import { maakShareImageElement } from "@/lib/shareImageElement"
import { laadLogoBase64, winnaarUitResultaat } from "@/lib/loadLogoBase64"

export const runtime = "nodejs"

const WIDTH = 1080
const HEIGHT = 1350

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ lijst_id: string }> }
) {
  const { lijst_id } = await params
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!SUPABASE_URL || !SERVICE_KEY) {
    return new Response("Supabase niet geconfigureerd", { status: 503 })
  }

  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY)
    const { data: lijst, error } = await supabase
      .from("lijsten")
      .select("laatste_resultaat")
      .eq("id", lijst_id)
      .single()

    if (error || !lijst?.laatste_resultaat) {
      return new Response("Lijst niet gevonden", { status: 404 })
    }

    const winnaar = winnaarUitResultaat(lijst.laatste_resultaat)
    const logoSrc = await laadLogoBase64(winnaar)

    return new ImageResponse(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      maakShareImageElement({ resultaat: lijst.laatste_resultaat as any, logoSrc }),
      { width: WIDTH, height: HEIGHT }
    )
  } catch (err) {
    console.error("[share-image/lijst]", err)
    return new Response("Fout bij genereren", { status: 500 })
  }
}
