import { ProductCardClient } from "@/components/product/product-card-client"
import { discountPercent } from "@/lib/format"
import { stockState, type ProductView } from "@/lib/products"
import { cn } from "@/lib/utils"

export function ProductCard({
  product,
  priority = false,
  className,
}: {
  product: ProductView
  priority?: boolean
  className?: string
}) {
  const discount = product.compareAtPrice
    ? discountPercent(product.price, product.compareAtPrice)
    : 0
  const stock = stockState(product.stock)

  return (
    <ProductCardClient product={product} priority={priority} className={className} discount={discount} stock={stock} />
  )
}

export function ProductGrid({
  products,
  className,
  priorityCount = 0,
}: {
  products: ProductView[]
  className?: string
  priorityCount?: number
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-x-4 gap-y-6 sm:gap-x-5 sm:gap-y-7 md:grid-cols-3 md:gap-x-6 md:gap-y-8 xl:grid-cols-4 xl:gap-x-7 xl:gap-y-9",
        className,
      )}
    >
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} priority={index < priorityCount} />
      ))}
    </div>
  )
}
