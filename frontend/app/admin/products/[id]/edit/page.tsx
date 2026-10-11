import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { X } from "lucide-react"
import { AdminHeader } from "@/components/admin/admin-header"
import { ProductForm } from "@/components/admin/product-form"
import { Button } from "@/components/ui/button"
import { ApiError, api } from "@/lib/api"
import type { ApiCategory } from "@/lib/api-types"
import { sessionToken } from "@/lib/auth"
import type { ProductRow } from "@/lib/products"
import { jsonToLines, jsonToPairs } from "@/lib/validation"

export const metadata: Metadata = { title: "Edit product" }

export const dynamic = "force-dynamic"

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [product, categories] = await Promise.all([
    api
      .get<ProductRow>(`/api/admin/products/${encodeURIComponent(id)}`, await sessionToken())
      .catch((error: unknown) => {
        if (error instanceof ApiError && error.status === 404) return null
        throw error
      }),
    api.get<ApiCategory[]>("/api/categories"),
  ])

  if (!product) notFound()

  return (
    <div className="flex flex-col gap-6">
      <AdminHeader
        eyebrow="Catalogue"
        title={product.name}
        description={
          <>
            Editing <span className="font-mono text-xs">/product/{product.slug}</span> ·{" "}
            {product.stock <= 0 ? "out of stock" : `${product.stock} in stock`}
          </>
        }
        actions={
          <Button variant="outline" nativeButton={false} render={<Link href="/admin/products" />}>
            <X />
            Back to products
          </Button>
        }
      />

      <ProductForm
        categories={categories}
        values={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          brand: product.brand,
          description: product.description,
          categoryId: product.categoryId,
          price: String(product.price),
          compareAtPrice: product.compareAtPrice == null ? "" : String(product.compareAtPrice),
          stock: String(product.stock),
          condition: product.condition,
          featured: product.featured,
          images: jsonToLines(product.images),
          specs: jsonToPairs(product.specs),
        }}
      />
    </div>
  )
}
