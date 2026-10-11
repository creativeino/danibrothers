"use client"

import { useWishlist, type WishlistItem } from "@/lib/wishlist"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { Heart } from "lucide-react"

export function WishlistButton({
  product,
  className,
  size = "sm",
}: {
  product: WishlistItem
  className?: string
  size?: "sm" | "md"
}) {
  const toggle = useWishlist((s) => s.toggle)
  const isLiked = useWishlist((s) => s.items.some((i) => i.productId === product.productId))

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggle(product)
        if (!isLiked) {
          toast.success("Added to wishlist", {
            description: product.name,
            duration: 2000,
          })
        } else {
          toast("Removed from wishlist", {
            description: product.name,
            duration: 2000,
          })
        }
      }}
      className={cn(
        "group/heart grid place-items-center rounded-full backdrop-blur-sm transition-all duration-300",
        size === "sm" && "size-7 sm:size-8",
        size === "md" && "size-10",
        isLiked
          ? "bg-red-500/15 text-red-500 border border-red-500/20 hover:bg-red-500/25"
          : "bg-black/20 text-white/80 border border-white/10 hover:bg-black/40 hover:text-white",
        className,
      )}
      aria-label={isLiked ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart
        className={cn(
          "transition-all duration-300",
          size === "sm" && "size-3 sm:size-3.5",
          size === "md" && "size-5",
          isLiked && "fill-red-500",
          "group-hover/heart:scale-110",
        )}
      />
    </button>
  )
}
