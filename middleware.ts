import createMiddleware from "next-intl/middleware"
import { routing } from "./i18n/routing"

export default createMiddleware(routing)

export const config = {
  // Alle routes matchen behalve api/, _next/, bestanden met extensie
  matcher: ["/((?!api|_next|_vercel|auth/callback|.*\\..*).*)"],
}
