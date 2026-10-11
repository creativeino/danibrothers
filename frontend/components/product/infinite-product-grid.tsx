"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "motion/react"
import { ProductCardClient } from "@/components/product/product-card-client"
import { ProductCardSkeleton } from "@/components/product/product-skeleton"
import type { ProductView } from "@/lib/product-types"
import { stockState } from "@/lib/product-types"
import { discountPercent } from "@/lib/format"
import { ChevronDown, Package } from "lucide-react"

type APIProduct = {
  id: string
  slug: string
  name: string
  brand: string
  price: number
  condition: string
  images: string
  specs: string
  compareAtPrice: number | null
  stock: number
  description: string
  featured: boolean
  createdAt: Date
  updatedAt: Date
  categoryId: string | null
}

function toView(p: APIProduct): ProductView {
  const images: string[] = (() => {
    try {
      const parsed = JSON.parse(p.images)
      return Array.isArray(parsed) ? parsed : []
    } catch { return [] }
  })()
  const specs: { label: string; value: string }[] = (() => {
    try {
      const parsed = JSON.parse(p.specs)
      return Array.isArray(parsed) ? parsed : []
    } catch { return [] }
  })()
  return {
    ...p,
    images,
    specs,
    category: null,
    primaryImage: images[0] ?? null,
    categoryId: p.categoryId ?? "",
  }
}

function ProductCardWrapper({ product, index }: { product: ProductView; index: number }) {
  const discount = product.compareAtPrice
    ? discountPercent(product.price, product.compareAtPrice)
    : 0
  const stock = stockState(product.stock)

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        delay: (index % 12) * 0.05,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <ProductCardClient
        product={product}
        discount={discount}
        stock={stock}
      />
    </motion.div>
  )
}

export function InfiniteProductGrid({
  initialProducts,
  initialPage,
  initialPageCount,
  searchParams,
}: {
  initialProducts: ProductView[]
  initialPage: number
  initialPageCount: number
  searchParams: Record<string, string>
}) {
  const [products, setProducts] = useState<ProductView[]>(initialProducts)
  const [page, setPage] = useState(initialPage)
  const [pageCount, setPageCount] = useState(initialPageCount)
  const [loading, setLoading] = useState(false)
  const [, setLoadingBatch] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const topRef = useRef<HTMLDivElement>(null)

  const hasMore = page < pageCount
  const totalShown = products.length

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return
    setLoading(true)
    setLoadingBatch(true)
    try {
      const params = new URLSearchParams()
      Object.entries(searchParams).forEach(([k, v]) => {
        if (v) params.set(k, v)
      })
      params.set("page", String(page + 1))

      const res = await fetch(`/api/products?${params.toString()}`)
      const data = await res.json()

      const newProducts = (data.products ?? []).map(toView)
      setProducts((prev) => [...prev, ...newProducts])
      setPage((p) => p + 1)
      setPageCount(data.pageCount ?? pageCount)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
      setTimeout(() => setLoadingBatch(false), 600)
    }
  }, [page, pageCount, loading, hasMore, searchParams])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore()
      },
      { rootMargin: "300px" },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [loadMore])

  return (
    <div>
      {/* Progress indicator */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Showing <span className="font-semibold text-foreground tnum">{totalShown}</span> products
        </p>
        {hasMore && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="inline-block size-1.5 rounded-full bg-brand animate-pulse" />
            More available
          </div>
        )}
      </div>

      <div ref={topRef} />

      {/* Product grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:gap-x-5 sm:gap-y-7 md:grid-cols-3 md:gap-x-6 md:gap-y-8">
        <AnimatePresence mode="popLayout">
          {products.map((product, i) => (
            <ProductCardWrapper
              key={product.id}
              product={product}
              index={i}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Loading state */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-8"
          >
            {/* Skeletons */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:gap-x-5 sm:gap-y-7 md:grid-cols-3 md:gap-x-6 md:gap-y-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                >
                  <ProductCardSkeleton />
                </motion.div>
              ))}
            </div>

            {/* Loading bar */}
            <div className="mt-6 flex items-center justify-center gap-3">
              <div className="relative h-1 w-32 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-brand via-blue-400 to-brand rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
              </div>
              <span className="text-xs font-medium text-muted-foreground">Loading more…</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sentinel for intersection observer */}
      {hasMore && !loading && <div ref={sentinelRef} className="h-4" />}

      {/* Load more fallback button */}
      {hasMore && !loading && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={loadMore}
            className="group inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-all duration-300 hover:border-brand/30 hover:bg-brand/5 hover:shadow-md hover:shadow-brand/10"
          >
            <span className="relative">
              <ChevronDown className="size-4 transition-transform duration-300 group-hover:translate-y-0.5" />
            </span>
            Load more products
          </button>
        </div>
      )}

      {/* End of products */}
      {!hasMore && products.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 flex flex-col items-center gap-3"
        >
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-brand/10 blur-xl" />
            <span className="relative grid size-12 place-items-center rounded-full bg-card border border-border shadow-sm">
              <Package className="size-5 text-brand" />
            </span>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-foreground">You&apos;ve seen it all!</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {totalShown} products explored. Found what you need?
            </p>
          </div>
        </motion.div>
      )}

      {/* Empty state */}
      {!hasMore && products.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-16 flex flex-col items-center gap-4 text-center"
        >
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-muted blur-2xl" />
            <span className="relative grid size-16 place-items-center rounded-full bg-card border border-border shadow-sm">
              <Package className="size-7 text-muted-foreground/50" />
            </span>
          </div>
          <div>
            <p className="text-base font-semibold">No products found</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Try adjusting your filters or search query. Stock moves fast — check back soon!
            </p>
          </div>
        </motion.div>
      )}
    </div>
  )
}
