"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { CheckCircle2, ShoppingBag, X } from "lucide-react"
import Link from "next/link"

const RECENT_ACTIVITIES = [
  {
    customer: "Hamza from Clifton",
    item: "Dell Latitude 7490 (Core i7 / 16GB)",
    time: "4 mins ago",
    slug: "laptops",
  },
  {
    customer: "Zain from Gulshan-e-Iqbal",
    item: "Lenovo ThinkPad T480 (16GB RAM)",
    time: "12 mins ago",
    slug: "laptops",
  },
  {
    customer: "Bilal from DHA Phase 5",
    item: "Apple MacBook Air M1 (256GB)",
    time: "26 mins ago",
    slug: "laptops",
  },
  {
    customer: "Usman from North Nazimabad",
    item: "Hikvision 4-Channel CCTV Security Kit",
    time: "38 mins ago",
    slug: "cctv",
  },
  {
    customer: "Tariq from F.B Area",
    item: "HP EliteBook 840 G6 (Core i5 8th Gen)",
    time: "52 mins ago",
    slug: "laptops",
  },
]

export function RecentActivityToast() {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    // Show first toast after 4 seconds of page load
    const initialTimer = setTimeout(() => {
      setVisible(true)
    }, 4500)

    return () => clearTimeout(initialTimer)
  }, [])

  useEffect(() => {
    if (dismissed || isPaused) return

    const interval = setInterval(() => {
      // Hide current
      setVisible(false)
      // Switch to next and show after 3.5 seconds
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % RECENT_ACTIVITIES.length)
        setVisible(true)
      }, 3500)
    }, 11000)

    return () => clearInterval(interval)
  }, [dismissed, isPaused])

  if (dismissed) return null

  const activity = RECENT_ACTIVITIES[index]

  return (
    <div
      className="fixed bottom-22 lg:bottom-6 left-4 sm:left-6 z-30 pointer-events-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto flex max-w-[21rem] items-center gap-3 rounded-2xl border border-border/80 bg-card/95 p-3 shadow-xl shadow-black/10 backdrop-blur-md dark:shadow-black/30"
          >
            {/* Icon */}
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <ShoppingBag className="size-5" />
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[0.68rem] font-bold text-foreground">
                  {activity.customer}
                </span>
                <span className="flex items-center gap-0.5 text-[0.62rem] font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="size-2.5" />
                  Verified
                </span>
              </div>
              <p className="truncate text-xs font-semibold text-brand hover:underline">
                <Link href={`/shop?category=${activity.slug}`}>
                  {activity.item}
                </Link>
              </p>
              <span className="text-[0.65rem] text-muted-foreground/70">
                Purchased {activity.time}
              </span>
            </div>

            {/* Dismiss */}
            <button
              type="button"
              onClick={() => setDismissed(true)}
              aria-label="Dismiss notification"
              className="grid size-6 shrink-0 place-items-center rounded-full text-muted-foreground/60 hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="size-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
