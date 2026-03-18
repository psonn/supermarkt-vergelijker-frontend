import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"
import { withSentryConfig } from "@sentry/nextjs"

const withNextIntl = createNextIntlPlugin()

const nextConfig: NextConfig = {
  // Zorg dat public/ bestanden (logos, font) beschikbaar zijn in de share-image serverless functions
  outputFileTracingIncludes: {
    "/api/share-image/job/[job_id]": [
      "./public/fonts/**",
      "./public/logos/**",
      "./public/logo-transparant.png",
    ],
    "/api/share-image/lijst/[lijst_id]": [
      "./public/fonts/**",
      "./public/logos/**",
      "./public/logo-transparant.png",
    ],
  },

  // Serve static assets with long-lived cache headers
  async headers() {
    return [
      {
        source: "/logos/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/:file(logo.*|icon.*)",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
    ]
  },
}

const sentryConfig = {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  // Upload source maps alleen in CI/productie-builds
  silent: !process.env.CI,
  // Geen Sentry-wrapper als DSN niet geconfigureerd
  disableServerWebpackPlugin: !process.env.SENTRY_DSN && !process.env.NEXT_PUBLIC_SENTRY_DSN,
  disableClientWebpackPlugin: !process.env.SENTRY_DSN && !process.env.NEXT_PUBLIC_SENTRY_DSN,
}

export default withSentryConfig(withNextIntl(nextConfig), sentryConfig)
