"use client"

import { useState } from "react"
import Link from "next/link"
import { ConditionBadge } from "@/components/product/condition-badge"
import { AddToCartButton } from "@/components/product/add-to-cart"
import { WishlistButton } from "@/components/product/wishlist-button"
import { CompareButton } from "@/components/product/compare-button"
import { ProductThumb } from "@/components/product/product-thumb"
import { QuickViewModal } from "@/components/product/quick-view-modal"
import { formatPrice } from "@/lib/format"
import { type ProductView } from "@/lib/product-types"
import { whatsappLink, site } from "@/lib/site"
import { cn } from "@/lib/utils"
import { Eye, MessageCircle, Star } from "lucide-react"
import { getProductReviewStats } from "@/lib/product-reviews"

export function ProductCardClient({
  product,
  priority = false,
  className,
  discount,
  stock,
}: {
  product: ProductView
  priority?: boolean
  className?: string
  discount: number
  stock: { label: string; tone: "success" | "warning" | "destructive" }
}) {
  const [quickViewOpen, setQuickViewOpen] = useState(false)
  const reviewStats = getProductReviewStats(product.id)

  return (
    <>
      <article
        className={cn(
          "group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all duration-500",
          "hover:-translate-y-1.5 hover:border-transparent hover:shadow-[0_24px_48px_-16px_rgb(0,0,0,0.18)]",
          className,
        )}
      >
        {/* Top accent line — wipes in from the left */}
        <div className="absolute inset-x-0 top-0 z-30 h-[3px] origin-left scale-x-0 bg-gradient-to-r from-brand via-blue-400 to-brand opacity-0 transition-all duration-500 ease-out group-hover:scale-x-100 group-hover:opacity-100" />

        {/* Brand-blue light sweep across the card on hover */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 -left-1/3 z-40 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-brand/25 to-transparent opacity-0 transition-all duration-[900ms] ease-out group-hover:left-[130%] group-hover:opacity-100"
        />

        {/* Image area */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Link href={`/product/${product.slug}`} className="absolute inset-0 z-10" aria-label={product.name}>
            <ProductThumb
              src={product.primaryImage}
              alt={product.name}
              priority={priority}
              sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 45vw"
              className="transition-transform duration-700 ease-out group-hover:scale-110"
            />
          </Link>

          {/* Hover overlay — frosted, reveals the Quick View pill */}
          <div className="pointer-events-none absolute inset-0 z-20 flex items-end justify-center bg-gradient-to-t from-black/55 via-black/10 to-transparent pb-4 opacity-0 backdrop-blur-[2px] transition-opacity duration-500 ease-out group-hover:opacity-100">
            <button
              type="button"
              onClick={() => setQuickViewOpen(true)}
              className="inline-flex translate-y-5 scale-95 items-center gap-2 rounded-full bg-white/95 px-5 py-2.5 text-xs font-bold tracking-wide text-black opacity-0 shadow-xl shadow-black/25 ring-1 ring-white/40 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100 hover:gap-3 hover:bg-brand hover:text-white cursor-pointer"
            >
              <Eye className="size-4" />
              Quick View
              <span className="text-[0.65rem] font-semibold opacity-60">↗</span>
            </button>
          </div>

          {/* Wishlist + Compare buttons — slide out one after the other */}
          <div className="absolute right-2 top-2 z-40 flex flex-col gap-1.5">
            <div className="translate-x-3 opacity-0 transition-all duration-300 ease-out group-hover:translate-x-0 group-hover:opacity-100">
              <WishlistButton
                product={{
                  productId: product.id,
                  slug: product.slug,
                  name: product.name,
                  brand: product.brand,
                  price: product.price,
                  image: product.primaryImage,
                  condition: product.condition,
                }}
              />
            </div>
            <div className="translate-x-3 opacity-0 transition-all delay-75 duration-300 ease-out group-hover:translate-x-0 group-hover:opacity-100">
              <CompareButton
                product={{
                  productId: product.id,
                  slug: product.slug,
                  name: product.name,
                  brand: product.brand,
                  price: product.price,
                  image: product.primaryImage,
                  condition: product.condition,
                  compareAtPrice: product.compareAtPrice,
                  stock: product.stock,
                  specs: product.specs,
                }}
              />
            </div>
          </div>

          {/* Condition badge */}
          <div className="pointer-events-none absolute left-2 top-2 z-20">
            <ConditionBadge condition={product.condition} className="shadow-md backdrop-blur-sm text-[0.6rem] px-1.5 py-0.5 sm:text-[0.6875rem] sm:px-1.5 sm:py-0.5" />
          </div>

          {/* Discount badge */}
          {discount > 0 && (
            <span className="pointer-events-none absolute right-2 top-2 z-20 rounded-md sm:rounded-lg bg-gradient-to-r from-red-500 to-orange-500 px-1.5 py-0.5 sm:px-2.5 sm:py-1 text-[0.6rem] sm:text-[0.7rem] font-bold text-white tnum shadow-lg">
              −{discount}%
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-3 sm:p-4 md:p-5">
          {/* Brand */}
          <p className="text-[0.65rem] font-bold tracking-[0.12em] text-brand/70 uppercase">
            {product.brand}
          </p>

          {/* Name */}
          <h3 className="mt-1.5 line-clamp-2 text-[0.9rem] font-semibold leading-snug tracking-tight text-foreground transition-colors duration-300 group-hover:text-brand">
            <Link href={`/product/${product.slug}`}>
              {product.name}
            </Link>
          </h3>

          {/* Customer Reviews & Rating */}
          <div className="mt-1.5 flex items-center gap-1.5">
            <div className="flex items-center text-amber-500">
              <Star className="size-3.5 fill-amber-400 text-amber-400" />
              <span className="ml-1 text-xs font-bold text-foreground tnum">
                {reviewStats.rating.toFixed(1)}
              </span>
            </div>
            <span className="text-[0.6875rem] text-muted-foreground/75 font-medium">
              ({reviewStats.count})
            </span>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[0.6rem] font-semibold text-emerald-600 dark:text-emerald-400">
              Verified
            </span>
          </div>

          {/* Price section */}
          <div className="mt-auto pt-3 sm:pt-4">
            <div className="flex items-baseline gap-1.5 sm:gap-2.5">
              <span className="text-base sm:text-lg md:text-xl font-bold tnum text-foreground">{formatPrice(product.price)}</span>
              {product.compareAtPrice && discount > 0 && (
                <span className="text-[0.7rem] sm:text-sm text-muted-foreground/60 line-through tnum">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </div>

            {/* Stock + Actions */}
            <div className="mt-3 flex items-center justify-between gap-1.5 sm:gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1 sm:gap-1.5 rounded-full px-1.5 sm:px-2.5 py-0.5 sm:py-1 text-[0.6rem] sm:text-[0.65rem] font-semibold",
                  stock.tone === "success" && "bg-emerald-500/10 text-emerald-600",
                  stock.tone === "warning" && "bg-amber-500/10 text-amber-600 animate-pulse",
                  stock.tone === "destructive" && "bg-red-500/10 text-red-600",
                )}
              >
                <span
                  className={cn(
                    "size-1.5 rounded-full shrink-0",
                    stock.tone === "success" && "bg-emerald-500",
                    stock.tone === "warning" && "bg-amber-500 animate-pulse",
                    stock.tone === "destructive" && "bg-red-500",
                  )}
                />
                <span className="hidden sm:inline">{stock.label}</span>
                <span className="sm:hidden">{stock.label === "In Stock" ? "Avail" : stock.label === "Out of stock" ? "Sold out" : stock.label}</span>
              </span>

              <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                <a
                  href={whatsappLink(`Hi ${site.name}, I'm interested in the ${product.name}.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid size-7 sm:size-8 place-items-center rounded-md sm:rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 transition-all duration-300 hover:bg-emerald-500/20 hover:border-emerald-500/30 hover:shadow-sm"
                  aria-label={`Ask about ${product.name} on WhatsApp`}
                >
                  <MessageCircle className="size-3 sm:size-3.5" />
                </a>
                <AddToCartButton product={product} size="sm" compact />
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Quick View Modal */}
      <QuickViewModal
        product={product}
        isOpen={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
      />
    </>
  )
}
