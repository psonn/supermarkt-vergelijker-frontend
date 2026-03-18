import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

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

export default withNextIntl(nextConfig)
