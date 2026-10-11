"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { MessageCircle, X } from "lucide-react"
import { site, whatsappLink } from "@/lib/site"

export function WhatsAppFab() {
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  if (dismissed) return null

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-30"
        >
          <div className="relative">
            {/* Pulse ring */}
            <span className="absolute inset-0 -m-1 animate-ping rounded-full bg-[#25D366]/30" />

            <a
              href={whatsappLink(`Hi ${site.name}, I'd like to ask about a product.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="relative flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#25D366]/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#25D366]/40"
            >
              <MessageCircle className="size-4" />
              WhatsApp
            </a>

            <button
              type="button"
              onClick={() => setDismissed(true)}
              aria-label="Hide WhatsApp button"
              className="absolute -left-2 -top-2 grid size-5 place-items-center rounded-full bg-muted text-muted-foreground shadow-sm transition-colors hover:bg-destructive hover:text-white"
            >
              <X className="size-3" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
