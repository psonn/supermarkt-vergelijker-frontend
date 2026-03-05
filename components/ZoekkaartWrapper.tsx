"use client"

import { Suspense, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import BoodschappenlijstForm from "@/components/BoodschappenlijstForm"

interface Props {
  titel: string
  subtitel: string
  placeholder: string
}

export default function ZoekkaartWrapper({ titel, subtitel, placeholder }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <Card className="shadow-xl border-border/50 overflow-hidden">
      <div
        className="h-[3px]"
        style={{
          background:
            "linear-gradient(90deg, oklch(0.50 0.19 152), oklch(0.62 0.17 185), oklch(0.72 0.20 50))",
        }}
      />
      <CardHeader className="pb-4 pt-5">
        <CardTitle className="font-display text-lg">{titel}</CardTitle>
        <CardDescription>{subtitel}</CardDescription>
      </CardHeader>

      {!open ? (
        <CardContent className="pt-0">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="w-full text-left rounded-md border border-input bg-background px-3 py-2.5 text-sm text-muted-foreground shadow-sm hover:border-ring hover:bg-muted/30 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {placeholder}
          </button>
        </CardContent>
      ) : (
        <CardContent className="animate-fade-up" style={{ animationDuration: "200ms" }}>
          <Suspense>
            <BoodschappenlijstForm autoFocus />
          </Suspense>
        </CardContent>
      )}
    </Card>
  )
}
