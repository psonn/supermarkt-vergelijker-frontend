"use client"

import { useEffect, useState } from "react"
import { Check } from "lucide-react"

export default function GlobalToast() {
  const [message, setMessage] = useState<string | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const pending = localStorage.getItem("sv_toast_pending")
    if (pending) {
      localStorage.removeItem("sv_toast_pending")
      setMessage(pending)
      setVisible(true)
      const hideTimer = setTimeout(() => setVisible(false), 2500)
      const removeTimer = setTimeout(() => setMessage(null), 3100)
      return () => {
        clearTimeout(hideTimer)
        clearTimeout(removeTimer)
      }
    }
  }, [])

  if (!message) return null

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
      style={{
        transition: "opacity 0.5s ease",
        opacity: visible ? 1 : 0,
      }}
    >
      <div className="bg-foreground text-background px-5 py-2.5 rounded-full text-sm font-medium shadow-xl flex items-center gap-2 whitespace-nowrap">
        <Check size={14} className="text-success" strokeWidth={2.5} />
        <span>{message}</span>
      </div>
    </div>
  )
}
