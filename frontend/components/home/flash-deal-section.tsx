"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, Clock, Flame, MessageCircle, ShoppingBag, ShieldCheck, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/format"
import { whatsappLink } from "@/lib/site"
import { useCart } from "@/lib/cart"
import { toast } from "sonner"
import { ProductThumb } from "@/components/product/product-thumb"
import type { ProductView } from "@/lib/product-types"

export function FlashDealSection({ dealProduct }: { dealProduct?: ProductView | null }) {
  const [timeLeft, setTimeLeft] = useState({
    hours: "00",
    minutes: "00",
    seconds: "00",
  })
  const [mounted, setMounted] = useState(false)
  const add = useCart((s) => s.add)

  useEffect(() => {
    setMounted(true)
    const updateCountdown = () => {
      const now = new Date()
      const endOfDay = new Date()
      endOfDay.setHours(23, 59, 59, 999)
      const diff = Math.max(0, endOfDay.getTime() - now.getTime())
      const totalSeconds = Math.floor(diff / 1000)

      setTimeLeft({
        hours: String(Math.floor(totalSeconds / 3600)).padStart(2, "0"),
        minutes: String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0"),
        seconds: String(totalSeconds % 60).padStart(2, "0"),
      })
    }

    updateCountdown()
    const timer = setInterval(updateCountdown, 1000)
    return () => clearInterval(timer)
  }, [])

  // If no product is passed from backend, fallback to store deal
  const product = dealProduct ?? {
    id: "deal-highlight",
    slug: "laptops",
    name: "HP Pavilion x360 14 Touch (Core i5 / 16GB / 512GB)",
    brand: "HP",
    price: 119999,
    compareAtPrice: 135000,
    primaryImage: "/images/pc with laptop.png",
    condition: "REFURBISHED",
    stock: 4,
  }

  const originalPrice = product.compareAtPrice ?? Math.round(product.price * 1.15)
  const discountAmount = originalPrice - product.price
  const discountPct = Math.round((discountAmount / originalPrice) * 100)

  const handleAddToCart = () => {
    add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      price: product.price,
      image: product.primaryImage,
      condition: product.condition,
      stock: product.stock,
    })
    toast.success("Deal added to cart!", {
      description: product.name,
    })
  }

  return (
    <div className="group relative overflow-hidden rounded-3xl bg-zinc-950 p-6 sm:p-8 md:p-10 text-white shadow-2xl shadow-black/35 ring-1 ring-inset ring-white/10">
      {/* Background ambient lighting matching SellDeviceCTA */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-950/95 via-zinc-900/80 to-zinc-950/95" />
      <div
        className="pointer-events-none absolute -left-16 top-1/2 -translate-y-1/2 size-72 rounded-full bg-brand/15 blur-[120px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 top-1/2 -translate-y-1/2 size-72 rounded-full bg-amber-500/10 blur-[120px]"
        aria-hidden
      />

      {/* Grid texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative grid items-center gap-6 sm:gap-8 lg:grid-cols-12 lg:gap-12">
        {/* Left Side: Offer Details & Actions (7 columns) */}
        <div className="flex flex-col lg:col-span-7">
          {/* Eyebrow Pills */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/25 bg-amber-400/10 px-3 py-1 text-xs font-bold text-amber-400">
              <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" />
              Flash Deal of the Day
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-white/50">
              <Sparkles className="size-3 text-amber-300" />
              Only 4 left at this price
            </span>
          </div>

          {/* Product Headline */}
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-[2rem] leading-snug">
            <Link
              href={dealProduct ? `/product/${product.slug}` : "/shop"}
              className="hover:text-amber-300 transition-colors"
            >
              {product.name}
            </Link>
          </h2>

          <p className="mt-2 text-sm text-white/60 leading-relaxed max-w-lg">
            Bench-tested, pristine condition with written check warranty. Fast courier dispatch in Karachi.
          </p>

          {/* Pricing Row */}
          <div className="mt-4 flex flex-wrap items-baseline gap-3">
            <span className="text-3xl font-extrabold text-white font-mono tracking-tight sm:text-4xl">
              {formatPrice(product.price)}
            </span>
            <span className="text-base text-white/40 line-through font-mono">
              {formatPrice(originalPrice)}
            </span>
            <span className="rounded-full bg-emerald-500/15 border border-emerald-500/25 px-3 py-1 text-xs font-bold text-emerald-400">
              Save {discountPct}% ({formatPrice(discountAmount)})
            </span>
          </div>

          {/* Live Countdown Timer */}
          <div className="mt-5 flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-white/50 flex items-center gap-1.5">
              <Clock className="size-3.5 text-amber-400" />
              Deal Ends In:
            </span>
            <div className="flex items-center gap-2 font-mono">
              {[
                { label: "HRS", val: mounted ? timeLeft.hours : "00" },
                { label: "MIN", val: mounted ? timeLeft.minutes : "00" },
                { label: "SEC", val: mounted ? timeLeft.seconds : "00" },
              ].map((item, idx) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-1.5 text-center">
                    <span className="text-base font-bold text-amber-300 tabular-nums">
                      {item.val}
                    </span>
                    <span className="text-[0.6rem] font-bold text-white/40">
                      {item.label}
                    </span>
                  </div>
                  {idx < 2 && <span className="text-white/30 font-bold">:</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              onClick={handleAddToCart}
              className="h-11 gap-2 rounded-xl bg-brand hover:bg-brand/90 px-6 font-bold text-white shadow-lg shadow-brand/25 cursor-pointer"
            >
              <ShoppingBag className="size-4" />
              Claim This Deal
            </Button>

            <a
              href={whatsappLink(`Salam Dani Brothers, I want to book the Flash Deal: ${product.name} at ${formatPrice(product.price)}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/15 px-5 text-sm font-bold text-emerald-400 transition-colors hover:bg-emerald-500/25"
            >
              <MessageCircle className="size-4" />
              Order on WhatsApp
            </a>

            <Link
              href={dealProduct ? `/product/${product.slug}` : "/shop"}
              className="inline-flex items-center gap-1 text-sm font-semibold text-white/50 hover:text-white transition-colors ml-1"
            >
              View Specs <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>

        {/* Right Side: Prominent Product Image Showcase (5 columns) */}
        <div className="flex items-center justify-center lg:col-span-5">
          <Link
            href={dealProduct ? `/product/${product.slug}` : "/shop"}
            className="group/showcase relative aspect-square w-full max-w-[280px] sm:max-w-[320px] lg:max-w-[340px] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-sm transition-all duration-500 hover:border-white/20 hover:bg-white/[0.04] hover:shadow-2xl hover:shadow-brand/10 flex items-center justify-center"
          >
            {/* Real Product Picture */}
            <div className="relative size-full">
              <ProductThumb
                src={product.primaryImage}
                alt={product.name}
                fit="contain"
                sizes="(min-width: 1024px) 340px, 80vw"
                className="transition-transform duration-700 ease-out group-hover/showcase:scale-108 drop-shadow-[0_15px_30px_rgba(0,0,0,0.65)]"
              />
            </div>

            {/* Glowing discount badge */}
            <div className="absolute right-3 top-3 rounded-full border border-red-500/30 bg-red-600/90 px-3 py-1 text-xs font-bold uppercase text-white shadow-lg backdrop-blur-sm">
              Save {discountPct}%
            </div>

            {/* Bottom warranty assurance tag */}
            <div className="absolute inset-x-3 bottom-3 flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-zinc-950/80 py-2 text-center text-xs font-medium text-white/70 backdrop-blur-md">
              <ShieldCheck className="size-3.5 text-emerald-400" />
              Checked & Verified with Warranty
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
