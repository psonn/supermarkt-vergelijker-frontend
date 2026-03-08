import createMiddleware from "next-intl/middleware"
import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { routing } from "./i18n/routing"

const intlMiddleware = createMiddleware(routing)

export async function proxy(request: NextRequest) {
  // 1. Supabase: refresh session cookies
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // 2. Beschermde routes — NL én EN
  const pathname = request.nextUrl.pathname
  if (!user && /^\/(en\/)?mijn-lijsten(\/|$)/.test(pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = pathname.startsWith("/en/") ? "/en/login" : "/login"
    url.searchParams.set("redirect", pathname)
    return NextResponse.redirect(url)
  }

  // 2c. Ingelogde gebruikers mogen /login niet zien
  if (user && /^\/(en\/)?login(\/|$)/.test(pathname)) {
    const url = request.nextUrl.clone()
    const redirectTo = request.nextUrl.searchParams.get("redirect")
    url.pathname = redirectTo ?? (pathname.startsWith("/en/") ? "/en/mijn-lijsten" : "/mijn-lijsten")
    url.search = ""
    return NextResponse.redirect(url)
  }

  // 2b. Recovery-flow: dwing wachtwoord reset af
  const recoveryPending = request.cookies.get("sv_recovery_pending")?.value
  if (recoveryPending && !/^\/(en\/)?auth\/reset-wachtwoord(\/|$)/.test(pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = pathname.startsWith("/en/") ? "/en/auth/reset-wachtwoord" : "/auth/reset-wachtwoord"
    url.search = ""
    return NextResponse.redirect(url)
  }

  // 3. Next-intl: locale routing
  const intlResponse = intlMiddleware(request)

  // 4. Kopieer Supabase auth-cookies naar intl response
  supabaseResponse.cookies.getAll().forEach(({ name, value, ...options }) => {
    intlResponse.cookies.set(name, value, options)
  })

  return intlResponse
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|auth/callback|.*\\..*).*)"],
}
