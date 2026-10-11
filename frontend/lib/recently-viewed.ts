"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { ProductView } from "@/lib/products"

type RecentlyViewedItem = Pick<ProductView, "id" | "slug" | "name" | "brand" | "price" | "condition" | "primaryImage" | "compareAtPrice" | "stock">

type RecentlyViewedState = {
  items: RecentlyViewedItem[]
  add: (product: RecentlyViewedItem) => void
}

const MAX_ITEMS = 8

export const useRecentlyViewed = create<RecentlyViewedState>()(
  persist(
    (set) => ({
      items: [],

      add: (product) =>
        set((state) => {
          const filtered = state.items.filter((i) => i.id !== product.id)
          return { items: [product, ...filtered].slice(0, MAX_ITEMS) }
        }),
    }),
    {
      name: "danibrothers-recently-viewed",
    },
  ),
)
