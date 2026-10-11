"use client"

import Link from "next/link"
import { ArrowRight, Heart, ShoppingCart, Trash2 } from "lucide-react"
import { useWishlist } from "@/lib/wishlist"
import { useCart } from "@/lib/cart"
import { formatPrice } from "@/lib/format"
import { ConditionBadge } from "@/components/product/condition-badge"
import { ProductThumb } from "@/components/product/product-thumb"
import { PageHero } from "@/components/site/page-hero"
import { Button } from "@/components/ui/button"
import { Reveal } from "@/components/motion/reveal"
import { useCartHydrated } from "@/components/site/use-cart-count"

export default function WishlistPage() {
  const hydrated = useCartHydrated()
  const items = useWishlist((s) => s.items)
  const remove = useWishlist((s) => s.remove)
  const clear = useWishlist((s) => s.clear)
  const add = useCart((s) => s.add)

  // The store rehydrates from localStorage after mount; without this the page
  // flashes the empty state for a frame.
  if (!hydrated) {
    return (
      <div className="container-page py-20">
        <div className="h-8 w-40 animate-pulse rounded-md bg-muted" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <PageHero
        compact
        title="My Wishlist"
        description={
          items.length === 0
            ? "No items saved yet."
            : `${items.length} ${items.length === 1 ? "item" : "items"} saved`
        }
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Wishlist" }]}
      >
        {items.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clear}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 />
            Clear all
          </Button>
        )}
      </PageHero>

      <div className="container-page py-10 md:py-14">
      {items.length === 0 ? (
        <Reveal>
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-20 text-center">
          <span className="grid size-14 place-items-center rounded-full bg-brand-subtle text-brand">
            <Heart className="size-6" />
          </span>
          <h2 className="mt-5 text-base font-semibold">Your wishlist is empty</h2>
          <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
            Browse products and tap the heart icon to save items you like.
          </p>
          <Button className="mt-6" size="lg" nativeButton={false} render={<Link href="/shop" />}>
            Browse products
            <ArrowRight />
          </Button>
        </div>
        </Reveal>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <div
              key={item.productId}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              {/* Image */}
              <div className="relative aspect-square overflow-hidden bg-muted">
                <Link href={`/product/${item.slug}`} className="absolute inset-0 z-10">
                  <ProductThumb
                    src={item.image}
                    alt={item.name}
                    sizes="(max-width: 640px) 50vw, 33vw"
                    className="transition-transform duration-500 group-hover:scale-105"
                  />
                </Link>

                {/* Condition badge */}
                <div className="absolute left-2 top-2 z-20">
                  <ConditionBadge condition={item.condition} className="shadow-md backdrop-blur-sm text-[0.6rem] px-1.5 py-0.5" />
                </div>

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => remove(item.productId)}
                  className="absolute right-2 top-2 z-20 grid size-7 place-items-center rounded-full bg-black/30 text-white/80 backdrop-blur-sm border border-white/10 transition-all duration-300 hover:bg-red-500/80 hover:text-white"
                  aria-label={`Remove ${item.name} from wishlist`}
                >
                  <Trash2 className="size-3" />
                </button>
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col p-3 sm:p-4">
                <p className="text-[0.6rem] font-bold tracking-[0.12em] text-brand/70 uppercase">
                  {item.brand}
                </p>
                <h3 className="mt-1 line-clamp-2 text-[0.85rem] font-semibold leading-snug tracking-tight text-foreground">
                  <Link href={`/product/${item.slug}`}>{item.name}</Link>
                </h3>

                <div className="mt-auto pt-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-base sm:text-lg font-bold tnum text-foreground">
                      {formatPrice(item.price)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      add({
                        productId: item.productId,
                        slug: item.slug,
                        name: item.name,
                        brand: item.brand,
                        price: item.price,
                        image: item.image,
                        condition: item.condition,
                        stock: 10,
                      })
                    }
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-brand/90 hover:shadow-md hover:shadow-brand/20 active:translate-y-px"
                  >
                    <ShoppingCart className="size-3.5" />
                    Add to cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </>
  )
}
