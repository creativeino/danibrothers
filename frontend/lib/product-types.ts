import type { Category, Product } from "@/lib/db-types"

export type Spec = { label: string; value: string }

export type ProductView = Omit<Product, "images" | "specs"> & {
  images: string[]
  specs: Spec[]
  category: Pick<Category, "id" | "name" | "slug"> | null
  primaryImage: string | null
}

export function stockState(stock: number): {
  label: string
  tone: "success" | "warning" | "destructive"
} {
  if (stock <= 0) return { label: "Out of stock", tone: "destructive" }
  if (stock <= 3) return { label: `Only ${stock} left`, tone: "warning" }
  return { label: "In stock", tone: "success" }
}
