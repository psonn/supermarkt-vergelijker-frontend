import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/mijn-lijsten", "/api/", "/auth/"],
    },
    sitemap: "https://www.cheapersupermarkets.com/sitemap.xml",
  }
}
