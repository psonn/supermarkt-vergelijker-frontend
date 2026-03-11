import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM_EMAIL = process.env.FROM_EMAIL ?? "CheaperSupermarkets <onboarding@resend.dev>"
const FEEDBACK_EMAIL = process.env.FEEDBACK_EMAIL ?? process.env.FROM_EMAIL ?? ""

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      type: "match" | "app"
      product_zoekterm?: string
      product_naam?: string
      supermarkt?: string
      bericht?: string
    }

    // Sla op in Supabase
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    await supabase.from("feedback").insert({
      user_id: user?.id ?? null,
      type: body.type,
      product_zoekterm: body.product_zoekterm ?? null,
      product_naam: body.product_naam ?? null,
      supermarkt: body.supermarkt ?? null,
      bericht: body.bericht ?? null,
    })

    // Stuur notificatie via Resend
    if (RESEND_API_KEY && FEEDBACK_EMAIL) {
      const onderwerp = body.type === "match"
        ? `[Feedback] Verkeerd product: ${body.product_zoekterm} @ ${body.supermarkt}`
        : `[Feedback] App-melding`

      const html = `
<p><strong>Type:</strong> ${body.type}</p>
${body.product_zoekterm ? `<p><strong>Zoekopdracht:</strong> ${body.product_zoekterm}</p>` : ""}
${body.product_naam ? `<p><strong>Gevonden product:</strong> ${body.product_naam}</p>` : ""}
${body.supermarkt ? `<p><strong>Supermarkt:</strong> ${body.supermarkt}</p>` : ""}
${body.bericht ? `<p><strong>Bericht:</strong> ${body.bericht}</p>` : ""}
${user?.email ? `<p><strong>Gebruiker:</strong> ${user.email}</p>` : ""}
`
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [FEEDBACK_EMAIL],
          subject: onderwerp,
          html,
        }),
      })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[feedback] Fout:", err)
    return NextResponse.json({ error: "Feedback opslaan mislukt" }, { status: 500 })
  }
}
