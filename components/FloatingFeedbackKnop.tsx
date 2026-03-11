"use client"

import { useState } from "react"
import { MessageSquarePlus, X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function FloatingFeedbackKnop() {
  const [open, setOpen] = useState(false)
  const [bericht, setBericht] = useState("")
  const [bezig, setBezig] = useState(false)
  const [verstuurd, setVerstuurd] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!bericht.trim()) return
    setBezig(true)
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "app", bericht: bericht.trim() }),
      })
      setVerstuurd(true)
      setBericht("")
      setTimeout(() => { setVerstuurd(false); setOpen(false) }, 2500)
    } catch {
      // stil falen
    }
    setBezig(false)
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2">
      {/* Paneel */}
      {open && (
        <div className="w-72 rounded-2xl border bg-background shadow-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/40">
            <span className="text-sm font-semibold">Feedback</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={15} strokeWidth={2} />
            </button>
          </div>

          <div className="px-4 py-4">
            {verstuurd ? (
              <div className="flex items-center gap-2 text-emerald-700">
                <Check size={16} strokeWidth={2.5} />
                <p className="text-sm font-medium">Bedankt voor je feedback!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Fout gevonden of suggestie? Laat het ons weten.
                </p>
                <textarea
                  value={bericht}
                  onChange={(e) => setBericht(e.target.value)}
                  placeholder="Beschrijf je feedback..."
                  rows={3}
                  disabled={bezig}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={bezig || !bericht.trim()}
                  className="w-full"
                >
                  {bezig ? "Versturen…" : "Verstuur"}
                </Button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Knop */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title="Feedback geven"
        className="flex items-center gap-2 rounded-full bg-primary text-primary-foreground shadow-lg px-4 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
      >
        <MessageSquarePlus size={16} strokeWidth={2} />
        Feedback
      </button>
    </div>
  )
}
