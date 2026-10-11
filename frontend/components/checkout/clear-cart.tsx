"use client"

import { useEffect, useRef } from "react"
import { useCart } from "@/lib/cart"

/**
 * Empties the basket once the confirmation page is on screen.
 *
 * This runs on the confirmation page rather than in the checkout action so the
 * cart is only cleared when the order definitely exists — an action that
 * redirects mid-flight would otherwise wipe a basket with no order to show for
 * it.
 */
export function ClearCartOnMount() {
  const clear = useCart((s) => s.clear)
  const done = useRef(false)

  useEffect(() => {
    if (done.current) return
    done.current = true
    clear()
  }, [clear])

  return null
}
