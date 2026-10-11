"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { ConditionBadge } from "@/components/product/condition-badge"
import { AddToCartButton } from "@/components/product/add-to-cart"
import { WishlistButton } from "@/components/product/wishlist-button"
import { formatPrice } from "@/lib/format"
import { stockState, type ProductView } from "@/lib/product-types"
import { whatsappLink, site } from "@/lib/site"
import { cn } from "@/lib/utils"
import { MessageCircle, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react"

export function QuickView({
  product,
  open,
  onOpenChange,
}: {
  product: ProductView
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [imgIndex, setImgIndex] = useState(0)
  const stock = stockState(product.stock)
  const images = product.images.length > 0 ? product.images : ["/images/placeholder.png"]
  const active = images[imgIndex] ?? images[0]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="sm:max-w-2xl p-0 gap-0 overflow-hidden rounded-2xl"
      >
        <div className="grid sm:grid-cols-[1fr_1.2fr] gap-0">
          {/* Image side */}
          <div className="relative aspect-square sm:aspect-auto sm:h-full bg-muted overflow-hidden">
            <Image
              src={active}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, 50vw"
              className="object-cover"
              priority
            />

            {/* Image nav arrows */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setImgIndex((i) => (i > 0 ? i - 1 : images.length - 1))}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 grid size-8 place-items-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-all hover:bg-black/60"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setImgIndex((i) => (i < images.length - 1 ? i + 1 : 0))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 grid size-8 place-items-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-all hover:bg-black/60"
                >
                  <ChevronRight className="size-4" />
                </button>
              </>
            )}

            {/* Counter */}
            {images.length > 1 && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 rounded-full bg-black/40 backdrop-blur-sm px-2.5 py-0.5 text-[0.6rem] font-semibold text-white/80 tnum">
                {imgIndex + 1} / {images.length}
              </div>
            )}

            {/* Condition badge */}
            <div className="absolute left-3 top-3 z-10">
              <ConditionBadge condition={product.condition} className="shadow-md backdrop-blur-sm" />
            </div>

            {/* Wishlist */}
            <div className="absolute right-3 top-3 z-10">
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
                size="md"
              />
            </div>
          </div>

          {/* Content side */}
          <div className="flex flex-col p-5 sm:p-6">
            {/* Brand */}
            <p className="text-[0.65rem] font-bold tracking-[0.12em] text-brand/70 uppercase">
              {product.brand}
            </p>

            {/* Name */}
            <h2 className="mt-1.5 text-lg font-bold leading-snug tracking-tight text-foreground">
              {product.name}
            </h2>

            {/* Stock */}
            <div className={cn(
              "mt-3 inline-flex items-center gap-1.5 self-start rounded-full px-2.5 py-1 text-[0.65rem] font-semibold",
              stock.tone === "success" && "bg-emerald-500/10 text-emerald-600",
              stock.tone === "warning" && "bg-amber-500/10 text-amber-600 animate-pulse",
              stock.tone === "destructive" && "bg-red-500/10 text-red-600",
            )}>
              <span className={cn(
                "size-1.5 rounded-full shrink-0",
                stock.tone === "success" && "bg-emerald-500",
                stock.tone === "warning" && "bg-amber-500 animate-pulse",
                stock.tone === "destructive" && "bg-red-500",
              )} />
              {stock.label}
            </div>

            {/* Price */}
            <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-2xl font-bold tnum text-foreground">
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-sm text-muted-foreground/50 line-through tnum">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground/70 line-clamp-3">
              {product.description}
            </p>

            {/* Spacer */}
            <div className="mt-auto" />

            {/* Actions */}
            <div className="mt-5 flex flex-col gap-2.5">
              <AddToCartButton product={product} className="w-full" />

              <div className="flex gap-2">
                <a
                  href={whatsappLink(`Hi ${site.name}, I'm interested in the ${product.name}.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-2.5 text-xs font-semibold text-emerald-600 transition-all hover:bg-emerald-500/10"
                >
                  <MessageCircle className="size-3.5" />
                  WhatsApp
                </a>

                <Link
                  href={`/product/${product.slug}`}
                  onClick={() => onOpenChange(false)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground transition-all hover:bg-muted"
                >
                  <ExternalLink className="size-3.5" />
                  Full details
                </Link>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
