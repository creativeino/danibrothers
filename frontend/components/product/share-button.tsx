"use client"

import { useState } from "react"
import { Check, Share2 } from "lucide-react"

export function ShareButton({ title, text, url }: { title: string; text: string; url: string }) {
  const [copied, setCopied] = useState(false)

  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url })
        return
      }
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      // user dismissed the share sheet — ignore
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-card px-4 py-2.5 text-xs font-semibold text-muted-foreground transition-all duration-300 hover:border-brand/30 hover:bg-brand/5 hover:text-brand"
    >
      {copied ? <Check className="size-3.5 text-success" /> : <Share2 className="size-3.5" />}
      {copied ? "Link copied" : "Share"}
    </button>
  )
}
