"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export type WishlistItem = {
  productId: string
  slug: string
  name: string
  brand: string
  price: number
  image: string | null
  condition: string
}

type WishlistState = {
  items: WishlistItem[]
  toggle: (item: WishlistItem) => void
  has: (productId: string) => boolean
  remove: (productId: string) => void
  clear: () => void
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      toggle: (item) =>
        set((state) => {
          const exists = state.items.some((i) => i.productId === item.productId)
          if (exists) {
            return { items: state.items.filter((i) => i.productId !== item.productId) }
          }
          return { items: [...state.items, item] }
        }),

      has: (productId) => get().items.some((i) => i.productId === productId),

      remove: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),

      clear: () => set({ items: [] }),
    }),
    {
      name: "danibrothers-wishlist",
    },
  ),
)

export function wishlistCount(items: WishlistItem[]): number {
  return items.length
}
