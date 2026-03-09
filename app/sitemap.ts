import type { MetadataRoute } from "next"

const BASE = "https://www.cheapersupermarkets.com"

const publicPaths = [
  "",
  "/over-ons",
  "/contact",
  "/algemene-voorwaarden",
]

export default function sitemap(): MetadataRoute.Sitemap {
  return publicPaths.map((path) => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
    alternates: {
      languages: {
        nl: `${BASE}${path}`,
        en: `${BASE}/en${path}`,
      },
    },
  }))
}
