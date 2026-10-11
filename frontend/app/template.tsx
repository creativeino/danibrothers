"use client"

import { motion, useReducedMotion } from "motion/react"
import type { ReactNode } from "react"

/** `as const` so the literal is a bezier tuple, not a `number[]`. */
const EASE = [0.22, 1, 0.36, 1] as const

/**
 * Page transition.
 *
 * A `template.tsx` re-mounts on every navigation, which is exactly what a
 * transition needs — but it also means anything animated here replays on each
 * click, so this stays deliberately short. Long cross-fades feel like latency
 * rather than polish.
 */
export default function Template({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion()

  if (reduced) return <>{children}</>

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}
