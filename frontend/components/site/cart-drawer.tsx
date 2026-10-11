"use client"

import Link from "next/link"
import { Clock, Flame, MessageCircle, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { useCartHydrated } from "@/components/site/use-cart-count"
import { useCart, cartSubtotal } from "@/lib/cart"
import { formatPrice } from "@/lib/format"
import { SHIPPING_FLAT, whatsappLink } from "@/lib/site"
import { ProductThumb } from "@/components/product/product-thumb"
import { useEffect, useState } from "react"

export function CartDrawer() {
  const isOpen = useCart((s) => s.isOpen)
  const close = useCart((s) => s.close)
  const lines = useCart((s) => s.lines)
  const setQty = useCart((s) => s.setQty)
  const remove = useCart((s) => s.remove)
  const hydrated = useCartHydrated()

  const visible = hydrated ? lines : []
  const subtotal = cartSubtotal(visible)
  const shipping = SHIPPING_FLAT

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && close()}>
      <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
        <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="size-4" />
            Your cart
            {visible.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground tnum">
                ({visible.reduce((n, l) => n + l.qty, 0)})
              </span>
            )}
          </SheetTitle>
          <SheetDescription className="sr-only">
            Items you have added to your cart. Review them and proceed to checkout.
          </SheetDescription>
        </div>

        {visible.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="grid size-14 place-items-center rounded-full bg-muted">
              <ShoppingBag className="size-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">Your cart is empty</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Laptops, monitors and accessories are a click away.
              </p>
            </div>
            <Button nativeButton={false} render={<Link href="/shop" onClick={close} />}>
              Start shopping
            </Button>
          </div>
        ) : (
          <>
            <CartReservationTimer />

            <div className="flex-1 divide-y divide-border overflow-y-auto">
              {visible.map((line) => (
                <div key={line.productId} className="flex gap-3 p-4">
                  <Link
                    href={`/product/${line.slug}`}
                    onClick={close}
                    className="relative size-20 shrink-0 overflow-hidden rounded-lg border border-border bg-muted"
                  >
                    <ProductThumb
                      src={line.image}
                      alt={line.name}
                      sizes="80px"
                      className="object-cover"
                    />
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[0.6875rem] font-medium tracking-wide text-muted-foreground uppercase">
                          {line.brand}
                        </p>
                        <Link
                          href={`/product/${line.slug}`}
                          onClick={close}
                          className="line-clamp-2 text-sm font-medium leading-snug hover:text-brand"
                        >
                          {line.name}
                        </Link>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          remove(line.productId)
                          toast("Removed from cart", {
                            description: line.name,
                            duration: 2000,
                          })
                        }}
                        aria-label={`Remove ${line.name} from cart`}
                        className="-mr-1 -mt-1 shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>

                    <div className="mt-auto flex items-end justify-between gap-2 pt-2">
                      <QtyStepper
                        qty={line.qty}
                        max={line.stock}
                        onChange={(qty) => setQty(line.productId, qty)}
                      />
                      <span className="text-sm font-semibold tnum">
                        {formatPrice(line.price * line.qty)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border p-4">
              <dl className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="font-medium tnum">{formatPrice(subtotal)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Delivery (Karachi only)</dt>
                  <dd className="text-xs font-semibold text-foreground">
                    Rs. 500
                  </dd>
                </div>
                <div className="flex items-baseline justify-between border-t border-border pt-2 text-base">
                  <div>
                    <dt className="font-semibold">Estimated Total</dt>
                    <span className="text-[0.65rem] text-muted-foreground/70 block">
                      Incl. Rs. 500 delivery fee
                    </span>
                  </div>
                  <dd className="font-semibold tnum">{formatPrice(subtotal + 500)}</dd>
                </div>
              </dl>

              <div className="mt-4 flex flex-col gap-2">
                <Button
                  size="lg"
                  className="h-10 w-full"
                  nativeButton={false}
                  render={<Link href="/checkout" onClick={close} />}
                >
                  Checkout
                </Button>
                <a
                  href={whatsappLink(
                    `Salam Dani Brothers! I want to confirm an order:\n\n${visible
                      .map((l) => `• ${l.qty}x ${l.name} (${formatPrice(l.price * l.qty)})`)
                      .join("\n")}\n\n*Estimated Total: ${formatPrice(subtotal + 500)}* (including Karachi Delivery).\nPlease confirm my order.`,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 text-xs font-bold text-emerald-600 transition-colors hover:bg-emerald-500/20 dark:text-emerald-400"
                >
                  <MessageCircle className="size-4" />
                  Order via WhatsApp (1-Tap)
                </a>
                <Button
                  variant="outline"
                  className="w-full"
                  nativeButton={false}
                  render={<Link href="/cart" onClick={close} />}
                >
                  View full cart
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

function CartReservationTimer() {
  const [seconds, setSeconds] = useState(895)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => {
      setSeconds((prev) => (prev > 0 ? prev - 1 : 895))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  if (!mounted) return null

  const m = String(Math.floor(seconds / 60)).padStart(2, "0")
  const s = String(seconds % 60).padStart(2, "0")

  return (
    <div className="flex items-center justify-between border-b border-amber-500/20 bg-amber-500/10 px-4 py-2 text-xs">
      <span className="flex items-center gap-1.5 font-semibold text-amber-700 dark:text-amber-400">
        <Clock className="size-3.5 animate-pulse" />
        Items reserved for you
      </span>
      <span className="rounded-md bg-amber-500/20 px-2 py-0.5 font-mono font-bold tabular-nums text-amber-700 dark:text-amber-400">
        {m}:{s}
      </span>
    </div>
  )
}

export function QtyStepper({
  qty,
  max,
  onChange,
  size = "sm",
}: {
  qty: number
  max: number
  onChange: (qty: number) => void
  size?: "sm" | "lg"
}) {
  const btn =
    size === "lg"
      ? "size-9"
      : "size-7"
  const icon = size === "lg" ? "size-4" : "size-3.5"

  return (
    <div className="inline-flex items-center rounded-lg border border-border bg-card">
      <button
        type="button"
        onClick={() => onChange(qty - 1)}
        aria-label="Decrease quantity"
        className={`grid ${btn} place-items-center rounded-l-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground`}
      >
        <Minus className={icon} />
      </button>
      <span className={`grid ${btn} place-items-center text-sm font-medium tnum`} aria-live="polite">
        {qty}
      </span>
      <button
        type="button"
        onClick={() => onChange(qty + 1)}
        disabled={qty >= max}
        aria-label="Increase quantity"
        className={`grid ${btn} place-items-center rounded-r-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40`}
      >
        <Plus className={icon} />
      </button>
    </div>
  )
}
