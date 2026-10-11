"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { formatPrice } from "@/lib/format"
import { stockState } from "@/lib/product-types"
import { ConditionBadge } from "@/components/product/condition-badge"
import { AddToCartButton } from "@/components/product/add-to-cart"
import { GitCompareArrows, Plus, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import type { ProductView } from "@/lib/product-types"

export function CompareSection({
  product,
  related,
}: {
  product: ProductView
  related: ProductView[]
}) {
  const [selected, setSelected] = useState<ProductView[]>([])

  function toggleProduct(p: ProductView) {
    setSelected((prev) => {
      const exists = prev.some((i) => i.id === p.id)
      if (exists) return prev.filter((i) => i.id !== p.id)
      if (prev.length >= 3) {
        toast.warning("Max 3 products can be compared")
        return prev
      }
      return [...prev, p]
    })
  }

  const compareWith = selected.filter((p) => p.id !== product.id)
  const allItems = [product, ...compareWith]
  const allSpecLabels = Array.from(new Set(allItems.flatMap((item) => item.specs.map((s) => s.label))))

  return (
    <div className="mt-12">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-6">
        <span className="grid size-8 place-items-center rounded-lg bg-brand/10 text-brand">
          <GitCompareArrows className="size-4" />
        </span>
        <h2 className="text-base font-bold tracking-tight">Compare with other products</h2>
      </div>

      {/* Product selector */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {related.slice(0, 4).map((p) => {
          const isSelected = selected.some((s) => s.id === p.id)
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => toggleProduct(p)}
              className={cn(
                "group relative flex flex-col overflow-hidden rounded-xl border-2 p-3 text-left transition-all duration-300",
                isSelected
                  ? "border-brand bg-brand/5 shadow-md shadow-brand/10"
                  : "border-border/50 bg-card hover:border-border hover:shadow-sm",
              )}
            >
              {/* Check indicator */}
              <div className={cn(
                "absolute top-2 right-2 grid size-5 place-items-center rounded-full transition-all duration-300",
                isSelected
                  ? "bg-brand text-white scale-100"
                  : "bg-muted text-muted-foreground scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100",
              )}>
                {isSelected ? <Check className="size-3" /> : <Plus className="size-3" />}
              </div>

              <div className="relative mx-auto size-16 overflow-hidden rounded-lg bg-muted">
                {p.primaryImage && (
                  <Image src={p.primaryImage} alt={p.name} fill sizes="64px" className="object-cover" />
                )}
              </div>
              <p className="mt-2 text-[0.55rem] font-bold tracking-[0.1em] text-brand/60 uppercase text-center">
                {p.brand}
              </p>
              <p className="mt-0.5 line-clamp-2 text-xs font-semibold text-foreground text-center">
                {p.name}
              </p>
              <p className="mt-1 text-xs font-bold tnum text-foreground text-center">
                {formatPrice(p.price)}
              </p>
            </button>
          )
        })}
      </div>

      {/* Comparison table */}
      {compareWith.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-border/50">
          <table className="w-full min-w-[500px] border-collapse">
            <thead>
              <tr>
                <th className="w-36 p-3 text-left text-xs font-semibold text-muted-foreground bg-muted/30" />
                {allItems.map((item) => (
                  <th key={item.id} className="p-3 text-center bg-muted/30">
                    <div className="flex flex-col items-center">
                      <div className="relative size-12 overflow-hidden rounded-lg bg-muted">
                        {item.primaryImage && (
                          <Image src={item.primaryImage} alt={item.name} fill sizes="48px" className="object-cover" />
                        )}
                      </div>
                      <p className="mt-1.5 text-[0.55rem] font-bold text-brand/60 uppercase">{item.brand}</p>
                      <Link href={`/product/${item.slug}`} className="text-xs font-semibold text-foreground hover:text-brand line-clamp-1">
                        {item.name}
                      </Link>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Price */}
              <tr className="border-t border-border">
                <td className="p-3 text-xs font-semibold text-muted-foreground">Price</td>
                {allItems.map((item) => (
                  <td key={item.id} className="p-3 text-center">
                    <span className="text-sm font-bold tnum">{formatPrice(item.price)}</span>
                  </td>
                ))}
              </tr>

              {/* Condition */}
              <tr className="border-t border-border bg-muted/10">
                <td className="p-3 text-xs font-semibold text-muted-foreground">Condition</td>
                {allItems.map((item) => (
                  <td key={item.id} className="p-3 text-center">
                    <ConditionBadge condition={item.condition} className="mx-auto text-[0.6rem]" />
                  </td>
                ))}
              </tr>

              {/* Stock */}
              <tr className="border-t border-border">
                <td className="p-3 text-xs font-semibold text-muted-foreground">Availability</td>
                {allItems.map((item) => {
                  const s = stockState(item.stock)
                  return (
                    <td key={item.id} className="p-3 text-center">
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-[0.6rem] font-semibold",
                        s.tone === "success" && "bg-emerald-500/10 text-emerald-600",
                        s.tone === "warning" && "bg-amber-500/10 text-amber-600",
                        s.tone === "destructive" && "bg-red-500/10 text-red-600",
                      )}>
                        {s.label}
                      </span>
                    </td>
                  )
                })}
              </tr>

              {/* Specs */}
              {allSpecLabels.map((label, i) => (
                <tr key={label} className={cn("border-t border-border", i % 2 === 0 ? "" : "bg-muted/10")}>
                  <td className="p-3 text-xs font-semibold text-muted-foreground">{label}</td>
                  {allItems.map((item) => {
                    const spec = item.specs.find((s) => s.label === label)
                    return (
                      <td key={item.id} className="p-3 text-center text-xs text-foreground">
                        {spec?.value ?? <span className="text-muted-foreground/40">—</span>}
                      </td>
                    )
                  })}
                </tr>
              ))}

              {/* Add to cart */}
              <tr className="border-t border-border">
                <td className="p-3" />
                {allItems.map((item) => (
                  <td key={item.id} className="p-3 text-center">
                    <AddToCartButton product={item} size="sm" className="mx-auto" />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {compareWith.length === 0 && (
        <p className="mt-4 text-xs text-muted-foreground text-center">
          Tap products above to compare specs side by side.
        </p>
      )}
    </div>
  )
}
