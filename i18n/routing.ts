import { defineRouting } from "next-intl/routing"

export const routing = defineRouting({
  locales: ["nl", "en"],
  defaultLocale: "nl",
  localePrefix: "as-needed", // /= NL (geen prefix), /en/... = EN
})
