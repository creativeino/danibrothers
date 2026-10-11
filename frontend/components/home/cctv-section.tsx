import { ProductGrid } from "@/components/product/product-card"
import type { ProductView } from "@/lib/product-types"

export function CctvSection({ products }: { products: ProductView[] }) {
  if (products.length === 0) return null

  return <ProductGrid products={products} priorityCount={4} />
}
