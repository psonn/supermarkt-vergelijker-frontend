import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse, type NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/mijn-lijsten"

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const isRecovery = next === "/auth/reset-wachtwoord"
      const isFirstConfirm = next === "/mijn-lijsten"
      const redirectUrl = isFirstConfirm ? `${origin}/auth/bevestigd` : `${origin}${next}`
      const response = NextResponse.redirect(redirectUrl)
      if (isRecovery) {
        response.cookies.set("sv_recovery_pending", "1", {
          path: "/",
          maxAge: 3600,
          sameSite: "lax",
        })
      }
      return response
    }
  }

  return NextResponse.redirect(`${origin}/login?fout=bevestiging-mislukt`)
}
