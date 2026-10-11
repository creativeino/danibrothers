"use client"

import { useCompare, type CompareItem } from "@/lib/compare"
import { cn } from "@/lib/utils"
import { GitCompareArrows } from "lucide-react"
import { toast } from "sonner"

export function CompareButton({
  product,
  className,
}: {
  product: CompareItem
  className?: string
}) {
  const add = useCompare((s) => s.add)
  const remove = useCompare((s) => s.remove)
  const isCompared = useCompare((s) => s.items.some((i) => i.productId === product.productId))
  const count = useCompare((s) => s.items.length)

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        if (isCompared) {
          remove(product.productId)
          toast("Removed from compare", { description: product.name, duration: 2000 })
        } else {
          if (count >= 4) {
            toast.warning("Compare limit reached", { description: "Max 4 products can be compared", duration: 2000 })
            return
          }
          add(product)
          toast.success("Added to compare", { description: product.name, duration: 2000 })
        }
      }}
      className={cn(
        "group/compare grid place-items-center rounded-full backdrop-blur-sm border transition-all duration-300",
        "size-7 sm:size-8",
        isCompared
          ? "bg-blue-500/15 text-blue-500 border-blue-500/20 hover:bg-blue-500/25"
          : "bg-black/20 text-white/80 border-white/10 hover:bg-black/40 hover:text-white",
        className,
      )}
      aria-label={isCompared ? "Remove from compare" : "Add to compare"}
    >
      <GitCompareArrows
        className={cn(
          "size-3 sm:size-3.5 transition-all duration-300",
          "group-hover/compare:scale-110",
        )}
      />
    </button>
  )
}
