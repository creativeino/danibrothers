"use client"

import { useEffect } from "react"
import { useRecentlyViewed } from "@/lib/recently-viewed"
import type { ProductView } from "@/lib/product-types"

export function TrackView({ product }: { product: ProductView }) {
  const add = useRecentlyViewed((s) => s.add)

  useEffect(() => {
    add({
      id: product.id,
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      price: product.price,
      condition: product.condition,
      primaryImage: product.primaryImage,
      compareAtPrice: product.compareAtPrice,
      stock: product.stock,
    })
  }, [product, add])

  return null
}
