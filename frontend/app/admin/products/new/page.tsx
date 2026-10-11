import type { Metadata } from "next"
import Link from "next/link"
import { X } from "lucide-react"
import { AdminHeader } from "@/components/admin/admin-header"
import { ProductForm } from "@/components/admin/product-form"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import type { ApiCategory } from "@/lib/api-types"

export const metadata: Metadata = { title: "New product" }

export default async function NewProductPage() {
  const categories = await api.get<ApiCategory[]>("/api/categories")

  return (
    <div className="flex flex-col gap-6">
      <AdminHeader
        eyebrow="Catalogue"
        title="New product"
        description="It goes live on the storefront as soon as you save it. Add the photos first — listings with pictures sell."
        actions={
          <Button variant="outline" nativeButton={false} render={<Link href="/admin/products" />}>
            <X />
            Cancel
          </Button>
        }
      />

      <ProductForm
        categories={categories}
        values={{
          name: "",
          slug: "",
          brand: "",
          description: "",
          categoryId: "",
          price: "",
          compareAtPrice: "",
          stock: "1",
          condition: "NEW",
          featured: false,
          images: "",
          specs: "",
        }}
      />
    </div>
  )
}
