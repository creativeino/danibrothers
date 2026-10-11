"use client"

import { useState } from "react"
import { Check, ShoppingBag } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart"
import { cn } from "@/lib/utils"

type AddToCartProps = {
  product: {
    id: string
    slug: string
    name: string
    brand: string
    price: number
    stock: number
    condition: string
    primaryImage: string | null
  }
  qty?: number
  size?: "sm" | "default" | "lg"
  variant?: "default" | "outline" | "secondary"
  className?: string
  /** Icon-only for the product card; labelled for the PDP. */
  compact?: boolean
}

export function AddToCartButton({
  product,
  qty = 1,
  size = "default",
  variant = "default",
  className,
  compact = false,
}: AddToCartProps) {
  const add = useCart((s) => s.add)
  const [justAdded, setJustAdded] = useState(false)
  const soldOut = product.stock <= 0

  function handleClick() {
    if (soldOut) return
    add(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        brand: product.brand,
        price: product.price,
        image: product.primaryImage,
        condition: product.condition,
        stock: product.stock,
      },
      qty,
    )
    setJustAdded(true)
    toast.success("Added to cart", {
      description: `${product.name}`,
      duration: 2000,
    })
    window.setTimeout(() => setJustAdded(false), 1600)
  }

  return (
    <Button
      type="button"
      size={size}
      variant={justAdded ? "secondary" : variant}
      disabled={soldOut}
      onClick={handleClick}
      className={cn("transition-all", className)}
      aria-label={soldOut ? `${product.name} is out of stock` : `Add ${product.name} to cart`}
    >
      {justAdded ? <Check /> : <ShoppingBag />}
      {!compact && (
        <span>{soldOut ? "Out of stock" : justAdded ? "Added" : "Add to cart"}</span>
      )}
    </Button>
  )
}
