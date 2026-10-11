"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, Loader2, Minus, MessageCircle, Plus, ShoppingBag, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart"
import { site, whatsappLink } from "@/lib/site"

type BuyBoxProduct = {
  id: string
  slug: string
  name: string
  brand: string
  price: number
  stock: number
  condition: string
  primaryImage: string | null
}

export function BuyBox({ product }: { product: BuyBoxProduct }) {
  const router = useRouter()
  const add = useCart((s) => s.add)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const [buying, setBuying] = useState(false)

  const soldOut = product.stock <= 0
  const max = Math.max(1, product.stock)

  function line() {
    return {
      productId: product.id,
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      price: product.price,
      image: product.primaryImage,
      condition: product.condition,
      stock: product.stock,
    }
  }

  function handleAdd() {
    if (soldOut) return
    add(line(), qty)
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1600)
  }

  function handleBuyNow() {
    if (soldOut) return
    setBuying(true)
    add(line(), qty)
    router.push("/checkout")
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Quantity + Actions (Add to cart & Buy now side-by-side) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Quantity stepper */}
        <div className="flex h-12 shrink-0 items-center justify-between sm:justify-start rounded-xl border border-border/60 bg-muted/30">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={qty <= 1 || soldOut}
            aria-label="Decrease quantity"
            className="grid h-full w-11 place-items-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40 cursor-pointer"
          >
            <Minus className="size-4" />
          </button>
          <span aria-live="polite" className="w-10 text-center text-sm font-bold tnum">
            {qty}
          </span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(max, q + 1))}
            disabled={qty >= max || soldOut}
            aria-label="Increase quantity"
            className="grid h-full w-11 place-items-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40 cursor-pointer"
          >
            <Plus className="size-4" />
          </button>
        </div>

        {/* Action Buttons: Add to cart & Buy now side-by-side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 flex-1">
          {/* Add to cart */}
          <Button
            type="button"
            size="lg"
            variant={added ? "secondary" : "default"}
            disabled={soldOut}
            onClick={handleAdd}
            className={cn(
              "h-12 w-full rounded-xl px-4 text-sm font-semibold transition-all duration-300 shadow-sm cursor-pointer",
              added && "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/10 hover:shadow-none hover:translate-y-0",
            )}
          >
            {added ? <Check className="size-4" /> : <ShoppingBag className="size-4" />}
            <span>{soldOut ? "Out of stock" : added ? "Added!" : "Add to cart"}</span>
          </Button>

          {/* Buy now */}
          {!soldOut && (
            <Button
              type="button"
              size="lg"
              variant="outline"
              onClick={handleBuyNow}
              disabled={buying}
              className="h-12 w-full rounded-xl px-4 text-sm font-semibold border-brand/35 bg-brand/5 text-brand hover:bg-brand hover:text-white transition-all duration-300 shadow-sm cursor-pointer"
            >
              {buying ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Zap className="size-4 fill-current" />
              )}
              <span>Buy it now</span>
            </Button>
          )}
        </div>
      </div>

      {/* WhatsApp link */}
      <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
        <p className="text-xs leading-relaxed text-muted-foreground/80">
          Questions about this unit?{" "}
          <a
            href={whatsappLink(`Hi ${site.name}, I'm interested in the ${product.name}.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 transition-colors hover:text-emerald-700"
          >
            <MessageCircle className="size-3.5" />
            Message us on WhatsApp
          </a>{" "}
          — we&apos;ll send extra photos and the bench-test report.
        </p>
      </div>
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
