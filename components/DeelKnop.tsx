"use client"

import { useState, useCallback } from "react"
import { Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"

interface Props {
  url?: string // optioneel: als niet opgegeven, gebruikt window.location.href
}

export default function DeelKnop({ url }: Props) {
  const t = useTranslations("resultatenpagina")
  const [gedeeld, setGedeeld] = useState(false)

  const deel = useCallback(async () => {
    const deelUrl = url ?? window.location.href
    const title = t("deelTitel")
    try {
      if (navigator.share) {
        await navigator.share({ url: deelUrl, title })
      } else {
        await navigator.clipboard.writeText(deelUrl)
        setGedeeld(true)
        setTimeout(() => setGedeeld(false), 2000)
      }
    } catch {
      // geannuleerd of niet ondersteund
    }
  }, [url, t])

  return (
    <Button variant="outline" size="sm" onClick={deel} className="gap-1.5 shrink-0">
      <Share2 size={14} strokeWidth={2} />
      {gedeeld ? t("gekopieerd") : t("deel")}
    </Button>
  )
}
