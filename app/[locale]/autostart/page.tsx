import { Suspense } from "react"
import type { Metadata } from "next"
import AutostartClient from "./AutostartClient"

export const metadata: Metadata = { robots: { index: false } }

export default function AutostartPagina() {
  return (
    <Suspense>
      <AutostartClient />
    </Suspense>
  )
}
