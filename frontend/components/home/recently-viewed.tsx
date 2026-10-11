"use client"

import Link from "next/link"
import Image from "next/image"
import { useRecentlyViewed } from "@/lib/recently-viewed"
import { formatPrice } from "@/lib/format"
import { ConditionBadge } from "@/components/product/condition-badge"
import { Clock } from "lucide-react"

export function RecentlyViewed() {
  const items = useRecentlyViewed((s) => s.items)

  if (items.length === 0) return null

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-5 md:grid-cols-4 xl:grid-cols-6">
      {items.map((item) => (
        <Link
          key={item.id}
          href={`/product/${item.slug}`}
          className="group relative flex flex-col overflow-hidden rounded-xl border border-border/40 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
        >
          {/* Image */}
          <div className="relative aspect-square overflow-hidden bg-muted">
            {item.primaryImage ? (
              <Image
                src={item.primaryImage}
                alt={item.name}
                fill
                sizes="(min-width: 1280px) 14vw, (min-width: 768px) 22vw, 35vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="grid size-full place-items-center text-muted-foreground/40">
                <Clock className="size-8" />
              </div>
            )}
            <div className="absolute left-1.5 top-1.5 z-10">
              <ConditionBadge condition={item.condition} className="text-[0.5rem] px-1 py-0.5 shadow-sm backdrop-blur-sm" />
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-1 flex-col p-2.5 sm:p-3">
            <p className="text-[0.55rem] font-bold tracking-[0.1em] text-brand/60 uppercase">
              {item.brand}
            </p>
            <h4 className="mt-0.5 line-clamp-2 text-[0.75rem] font-semibold leading-snug tracking-tight text-foreground">
              {item.name}
            </h4>
            <p className="mt-auto pt-2 text-sm font-bold tnum text-foreground">
              {formatPrice(item.price)}
            </p>
          </div>
        </Link>
      ))}
    </div>
  )
}
