"use client"

import Link from "next/link"
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductThumb } from "@/components/product/product-thumb"
import { ConditionBadge } from "@/components/product/condition-badge"
import { useCart, cartSubtotal } from "@/lib/cart"
import { PageHero } from "@/components/site/page-hero"
import { Reveal } from "@/components/motion/reveal"
import { useCartHydrated } from "@/components/site/use-cart-count"
import { formatPrice } from "@/lib/format"
import { SHIPPING_FLAT } from "@/lib/site"

export default function CartPage() {
  const hydrated = useCartHydrated()
  const lines = useCart((s) => s.lines)
  const setQty = useCart((s) => s.setQty)
  const remove = useCart((s) => s.remove)
  const clear = useCart((s) => s.clear)

  const subtotal = cartSubtotal(lines)
  const shipping = SHIPPING_FLAT

  if (!hydrated) {
    return (
      <div className="container-page py-20">
        <div className="h-8 w-40 animate-pulse rounded-md bg-muted" />
        <div className="mt-8 grid gap-4">
          {[0, 1].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    )
  }

  if (lines.length === 0) {
    return (
      <>
        <PageHero
          compact
          title="Your cart"
          description="Nothing reserved yet."
          breadcrumbs={[{ label: "Home", href: "/" }, { label: "Cart" }]}
        />
        <div className="container-page flex flex-col items-center justify-center py-20 text-center">
          <span className="grid size-14 place-items-center rounded-full bg-brand-subtle text-brand">
            <ShoppingBag className="size-6" />
          </span>
          <h2 className="mt-5 text-xl font-semibold tracking-tight">Your cart is empty</h2>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Nothing here yet. Browse the shop — or tell us what you need and we&apos;ll check what
            came in this week.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Button nativeButton={false} render={<Link href="/shop" />}>
              Start shopping
              <ArrowRight />
            </Button>
            <Button variant="outline" nativeButton={false} render={<Link href="/contact" />}>
              Ask for a recommendation
            </Button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <PageHero
        compact
        title="Your cart"
        description={`${lines.length} ${lines.length === 1 ? "item" : "items"} · reserved once you check out`}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Cart" }]}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={clear}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 />
          Clear cart
        </Button>
      </PageHero>

      <div className="container-page py-10 md:py-14">
        <Reveal>
          <div className="grid gap-8 lg:grid-cols-[1fr_22rem] lg:gap-12">
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
          {lines.map((line) => (
            <li key={line.productId} className="flex gap-4 bg-card p-4">
              <Link
                href={`/product/${line.slug}`}
                className="relative size-20 shrink-0 overflow-hidden rounded-lg border border-border sm:size-24"
              >
                <ProductThumb src={line.image} alt={line.name} sizes="6rem" />
              </Link>

              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                      {line.brand}
                    </p>
                    <Link
                      href={`/product/${line.slug}`}
                      className="mt-0.5 line-clamp-2 text-sm font-medium hover:underline"
                    >
                      {line.name}
                    </Link>
                    <ConditionBadge condition={line.condition} className="mt-1.5" />
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(line.productId)}
                    aria-label={`Remove ${line.name} from cart`}
                    className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>

                <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-3">
                  <div className="flex h-9 items-center rounded-lg border border-input">
                    <button
                      type="button"
                      onClick={() => setQty(line.productId, line.qty - 1)}
                      aria-label={`Decrease quantity of ${line.name}`}
                      className="grid h-full w-8 place-items-center text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium tnum">{line.qty}</span>
                    <button
                      type="button"
                      onClick={() => setQty(line.productId, line.qty + 1)}
                      disabled={line.qty >= line.stock}
                      aria-label={`Increase quantity of ${line.name}`}
                      className="grid h-full w-8 place-items-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>

                  <p className="text-sm font-semibold tnum">
                    {formatPrice(line.price * line.qty)}
                    {line.qty > 1 && (
                      <span className="ml-2 text-xs font-normal text-muted-foreground">
                        {formatPrice(line.price)} each
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold">Order summary</h2>

            <dl className="mt-4 flex flex-col gap-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="font-medium tnum">{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Delivery (Karachi)</dt>
                <dd className="text-xs font-semibold text-foreground">
                  Rs. 500
                </dd>
              </div>
            </dl>

            <div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
              <div>
                <span className="text-sm font-medium">Estimated Total</span>
                <span className="block text-[0.65rem] text-muted-foreground/70">
                  Incl. Rs. 500 flat Karachi delivery
                </span>
              </div>
              <span className="text-xl font-semibold tracking-tight tnum">
                {formatPrice(subtotal + 500)}
              </span>
            </div>

            <Button size="lg" className="mt-5 w-full" nativeButton={false} render={<Link href="/checkout" />}>
              Checkout
              <ArrowRight />
            </Button>

            <p className="mt-3 text-center text-xs text-muted-foreground">
              Cash on delivery or bank transfer. No card details needed.
            </p>
          </div>

          <Link
            href="/shop"
            className="mt-4 inline-flex w-full items-center justify-center text-sm font-medium text-brand underline-offset-4 hover:underline"
          >
            Continue shopping
          </Link>
        </aside>
          </div>
        </Reveal>
      </div>
    </>
  )
}
