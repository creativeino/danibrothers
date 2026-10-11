"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "motion/react"
import {
  X,
  ShieldCheck,
  Truck,
  MessageCircle,
  ExternalLink,
  Flame,
  CheckCircle2,
  Package,
  Star,
} from "lucide-react"
import { ConditionBadge } from "@/components/product/condition-badge"
import { AddToCartButton } from "@/components/product/add-to-cart"
import { formatPrice, discountPercent } from "@/lib/format"
import { type ProductView } from "@/lib/product-types"
import { whatsappLink, site } from "@/lib/site"
import { cn } from "@/lib/utils"
import { getProductReviewStats } from "@/lib/product-reviews"

export function QuickViewModal({
  product,
  isOpen,
  onClose,
}: {
  product: ProductView
  isOpen: boolean
  onClose: () => void
}) {
  const [selectedImage, setSelectedImage] = useState<string | null>(
    product.primaryImage || (product.images && product.images[0]) || null,
  )

  const discount = product.compareAtPrice
    ? discountPercent(product.price, product.compareAtPrice)
    : 0

  const isLowStock = product.stock > 0 && product.stock <= 5
  const reviewStats = getProductReviewStats(product.id)

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.35, bounce: 0.15 }}
            className="relative z-10 flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border/80 bg-background shadow-2xl"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-3.5 right-3.5 z-20 grid size-8.5 place-items-center rounded-full bg-background/80 text-muted-foreground backdrop-blur-md transition-colors hover:bg-accent hover:text-foreground"
              aria-label="Close modal"
            >
              <X className="size-4.5" />
            </button>

            <div className="flex-1 overflow-y-auto p-5 sm:p-7">
              <div className="grid gap-6 md:grid-cols-2 md:gap-8">
                {/* Left Column: Image preview */}
                <div className="flex flex-col gap-3">
                  <div className="relative aspect-square overflow-hidden rounded-xl border border-border/60 bg-muted/40">
                    {selectedImage ? (
                      <Image
                        src={selectedImage}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 400px"
                        className="object-cover transition-transform duration-300 hover:scale-105"
                      />
                    ) : (
                      <div className="grid size-full place-items-center text-muted-foreground">
                        <Package className="size-16 opacity-30" />
                      </div>
                    )}

                    {/* Condition badge */}
                    <div className="absolute top-2.5 left-2.5 z-10">
                      <ConditionBadge condition={product.condition} />
                    </div>

                    {discount > 0 && (
                      <span className="absolute top-2.5 right-2.5 z-10 rounded-md bg-gradient-to-r from-red-500 to-orange-500 px-2 py-0.5 text-xs font-bold text-white shadow-md">
                        −{discount}%
                      </span>
                    )}
                  </div>

                  {/* Thumbnail gallery if multiple images */}
                  {product.images && product.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {product.images.map((img, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setSelectedImage(img)}
                          className={cn(
                            "relative size-16 shrink-0 overflow-hidden rounded-lg border-2 bg-muted transition-all",
                            selectedImage === img
                              ? "border-brand shadow-sm"
                              : "border-transparent opacity-70 hover:opacity-100",
                          )}
                        >
                          <Image
                            src={img}
                            alt={`${product.name} view ${i + 1}`}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Trust highlight */}
                  <div className="mt-2 rounded-xl border border-border/60 bg-card p-3 text-xs">
                    <div className="flex items-center gap-2 text-emerald-600 font-medium dark:text-emerald-400">
                      <ShieldCheck className="size-4 shrink-0" />
                      <span>Bench-Tested &amp; Checked with Warranty</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-muted-foreground">
                      <Truck className="size-4 shrink-0" />
                      <span>Karachi Safe Delivery — Rs. 500 Flat Fee</span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Details & Actions */}
                <div className="flex flex-col">
                  <div className="border-b border-border/60 pb-4">
                    <p className="text-[0.6875rem] font-bold tracking-widest text-brand uppercase">
                      {product.brand}
                    </p>
                    <h2 className="mt-1 text-lg font-bold tracking-tight sm:text-xl">
                      {product.name}
                    </h2>

                    {/* Customer Reviews Rating */}
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex items-center text-amber-500">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} className="size-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <span className="text-xs font-bold text-foreground tnum">
                        {reviewStats.rating.toFixed(1)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({reviewStats.count} customer reviews)
                      </span>
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[0.65rem] font-semibold text-emerald-600 dark:text-emerald-400">
                        ✓ Verified Buyers
                      </span>
                    </div>

                    {/* Price */}
                    <div className="mt-3 flex items-baseline gap-2.5">
                      <span className="text-2xl font-extrabold text-foreground tnum">
                        {formatPrice(product.price)}
                      </span>
                      {product.compareAtPrice && discount > 0 && (
                        <span className="text-sm text-muted-foreground line-through tnum">
                          {formatPrice(product.compareAtPrice)}
                        </span>
                      )}
                    </div>

                    {/* Stock Alert */}
                    <div className="mt-2.5">
                      {product.stock > 0 ? (
                        <div className="flex items-center gap-1.5">
                          {isLowStock ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                              <Flame className="size-3.5 animate-bounce" />
                              Only {product.stock} units left in stock!
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="size-3.5" />
                              Ready for dispatch
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2.5 py-0.5 text-xs font-semibold text-red-600 dark:text-red-400">
                          Out of stock
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Key Specs */}
                  {product.specs && product.specs.length > 0 && (
                    <div className="my-4 border-b border-border/60 pb-4">
                      <p className="text-xs font-bold text-muted-foreground tracking-wide uppercase">
                        Highlights &amp; Specifications
                      </p>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                        {product.specs.slice(0, 6).map((spec, idx) => (
                          <div
                            key={idx}
                            className="flex flex-col rounded-lg bg-muted/40 p-2"
                          >
                            <span className="text-[0.65rem] text-muted-foreground">
                              {spec.label}
                            </span>
                            <span className="font-semibold text-foreground truncate">
                              {spec.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Featured English Customer Review */}
                  {reviewStats.topReview && (
                    <div className="my-3 rounded-xl border border-border/60 bg-muted/30 p-3 text-xs">
                      <div className="flex items-center gap-1 text-amber-500 mb-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className="size-3 fill-amber-400 text-amber-400" />
                        ))}
                        <span className="ml-1 text-[0.65rem] font-bold text-foreground">5.0</span>
                      </div>
                      <p className="italic text-foreground/85 leading-relaxed text-[0.8rem]">
                        &ldquo;{reviewStats.topReview.comment}&rdquo;
                      </p>
                      <div className="mt-2 flex items-center justify-between text-[0.6875rem] text-muted-foreground border-t border-border/40 pt-1.5">
                        <span className="font-semibold text-foreground/80">
                          — {reviewStats.topReview.name} ({reviewStats.topReview.location || "Karachi"})
                        </span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">✓ Verified Customer</span>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-auto pt-2 flex flex-col gap-2.5">
                    <AddToCartButton product={product} size="lg" className="w-full text-sm font-semibold shadow-md" />

                    <a
                      href={whatsappLink(`Hi ${site.name}, I want to order/inquire about: ${product.name}`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-sm font-semibold text-emerald-600 transition-colors hover:bg-emerald-500/20 dark:text-emerald-400"
                    >
                      <MessageCircle className="size-4" />
                      Instant Order on WhatsApp
                    </a>

                    <Link
                      href={`/product/${product.slug}`}
                      onClick={onClose}
                      className="mt-1 inline-flex items-center justify-center gap-1.5 text-xs font-medium text-brand hover:underline underline-offset-4"
                    >
                      View full details &amp; warranty specs
                      <ExternalLink className="size-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
