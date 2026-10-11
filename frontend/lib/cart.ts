"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export type CartLine = {
  productId: string
  slug: string
  name: string
  brand: string
  price: number
  image: string | null
  condition: string
  stock: number
  qty: number
}

type CartState = {
  lines: CartLine[]
  /** Controls the slide-over drawer; kept here so any component can open it. */
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
  add: (line: Omit<CartLine, "qty">, qty?: number) => void
  remove: (productId: string) => void
  setQty: (productId: string, qty: number) => void
  clear: () => void
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      isOpen: false,

      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),

      add: (line, qty = 1) =>
        set((state) => {
          const existing = state.lines.find((l) => l.productId === line.productId)
          const cap = Math.max(1, line.stock)

          if (existing) {
            return {
              isOpen: true,
              lines: state.lines.map((l) =>
                l.productId === line.productId
                  ? { ...l, qty: Math.min(cap, l.qty + qty) }
                  : l,
              ),
            }
          }
          return {
            isOpen: true,
            lines: [...state.lines, { ...line, qty: Math.min(cap, qty) }],
          }
        }),

      remove: (productId) =>
        set((state) => ({
          lines: state.lines.filter((l) => l.productId !== productId),
        })),

      setQty: (productId, qty) =>
        set((state) => ({
          lines:
            qty <= 0
              ? state.lines.filter((l) => l.productId !== productId)
              : state.lines.map((l) =>
                  l.productId === productId
                    ? { ...l, qty: Math.min(Math.max(1, l.stock), qty) }
                    : l,
                ),
        })),

      clear: () => set({ lines: [] }),
    }),
    {
      name: "danibrothers-cart",
      // Never restore a drawer that was left open on a previous visit.
      partialize: (state) => ({ lines: state.lines }),
    },
  ),
)

export function cartSubtotal(lines: CartLine[]): number {
  return lines.reduce((sum, l) => sum + l.price * l.qty, 0)
}

export function cartCount(lines: CartLine[]): number {
  return lines.reduce((sum, l) => sum + l.qty, 0)
}
