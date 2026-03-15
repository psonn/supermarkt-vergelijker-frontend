"use client"

import { useState } from "react"
import { Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"
import DeelenModal from "@/components/DeelenModal"

interface Props {
  shareImagePath?: string // bv. "/api/share-image/job/abc123"
  deelUrl?: string        // standaard: window.location.href
}

export default function DeelKnop({ shareImagePath, deelUrl }: Props) {
  const t = useTranslations("resultatenpagina")
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setModalOpen(true)}
        className="gap-1.5 shrink-0"
      >
        <Share2 size={14} strokeWidth={2} />
        {t("deel")}
      </Button>

      {shareImagePath ? (
        <DeelenModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          shareImagePath={shareImagePath}
          deelUrl={deelUrl}
        />
      ) : (
        // Geen afbeelding beschikbaar: simpele link-deel fallback
        modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.5)" }}
            onClick={() => setModalOpen(false)}
          >
            <div className="bg-background rounded-xl p-5 shadow-xl w-full max-w-sm space-y-3" onClick={(e) => e.stopPropagation()}>
              <p className="font-semibold text-sm">Link kopiëren</p>
              <Button className="w-full" onClick={async () => {
                await navigator.clipboard.writeText(deelUrl ?? window.location.href)
                setModalOpen(false)
              }}>
                Kopieer link
              </Button>
            </div>
          </div>
        )
      )}
    </>
  )
}
