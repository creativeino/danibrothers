"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export type CompareItem = {
  productId: string
  slug: string
  name: string
  brand: string
  price: number
  image: string | null
  condition: string
  compareAtPrice: number | null
  stock: number
  specs: { label: string; value: string }[]
}

const MAX_COMPARE = 4

type CompareState = {
  items: CompareItem[]
  add: (item: CompareItem) => void
  remove: (productId: string) => void
  has: (productId: string) => boolean
  clear: () => void
}

export const useCompare = create<CompareState>()(
  persist(
    (set, get) => ({
      items: [],

      add: (item) =>
        set((state) => {
          if (state.items.length >= MAX_COMPARE) return state
          if (state.items.some((i) => i.productId === item.productId)) return state
          return { items: [...state.items, item] }
        }),

      remove: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),

      has: (productId) => get().items.some((i) => i.productId === productId),

      clear: () => set({ items: [] }),
    }),
    {
      name: "danibrothers-compare",
    },
  ),
)
