"use client"

import { useSyncExternalStore } from "react"
import { useCart } from "@/lib/cart"

// Hydration guard: false on the server and during the first client render,
// true afterwards. Unlike a `useState` + `useEffect` pair this never calls
// setState from an effect.
const subscribe = () => () => {}
const getSnapshot = () => true
const getServerSnapshot = () => false

/**
 * The cart lives in localStorage, so the server always renders an empty cart.
 * Reading the count only after mount keeps the badge from being a hydration
 * mismatch — the alternative is a `suppressHydrationWarning` that hides real
 * bugs along with this one.
 */
export function useCartCount(): number {
  const lines = useCart((s) => s.lines)
  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  if (!mounted) return 0
  return lines.reduce((sum, line) => sum + line.qty, 0)
}

export function useCartHydrated(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
