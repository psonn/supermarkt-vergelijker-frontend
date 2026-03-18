import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

const withNextIntl = createNextIntlPlugin()

const nextConfig: NextConfig = {
  // Zorg dat public/ bestanden (logos, font) beschikbaar zijn in de share-image serverless functions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  experimental: {
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
  } as any,

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
