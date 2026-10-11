import type { Metadata } from "next"
import type { ReactNode } from "react"
import Link from "next/link"
import {
  CheckCircle2,
  PackageSearch,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
} from "lucide-react"
import { AdminHeader } from "@/components/admin/admin-header"
import { EmptyState } from "@/components/admin/admin-empty"
import { CELL_CLASS, ROW_CLASS, TableWrap, Th } from "@/components/admin/admin-table"
import { Button } from "@/components/ui/button"
import { ConditionBadge } from "@/components/product/condition-badge"
import { ProductThumb } from "@/components/product/product-thumb"
import { deleteProductAction, toggleFeaturedAction, updateStockAction } from "@/app/actions/admin"
import { api } from "@/lib/api"
import type { AdminProductRow, ApiCategory } from "@/lib/api-types"
import { sessionToken } from "@/lib/auth"
import { formatPrice } from "@/lib/format"
import { cn } from "@/lib/utils"

export const metadata: Metadata = { title: "Products" }

export const dynamic = "force-dynamic"

type SearchParams = Record<string, string | string[] | undefined>

function first(value: string | string[] | undefined): string {
  const v = Array.isArray(value) ? value[0] : value
  return v?.trim() ?? ""
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const sp = await searchParams
  const q = first(sp.q)
  const category = first(sp.category)
  const lowOnly = first(sp.filter) === "low"
  const saved = first(sp.saved) === "1"
  const page = Math.max(1, Number(first(sp.page)) || 1)

  const filters = new URLSearchParams()
  if (q) filters.set("q", q)
  if (category) filters.set("category", category)
  if (lowOnly) filters.set("filter", "low")
  filters.set("page", String(page))

  const [listing, categories] = await Promise.all([
    api.get<{ products: AdminProductRow[]; total: number; pageCount: number }>(
      `/api/admin/products?${filters.toString()}`,
      await sessionToken(),
    ),
    api.get<ApiCategory[]>("/api/categories"),
  ])

  const { products, total, pageCount } = listing

  function hrefFor(target: number) {
    const params = new URLSearchParams()
    if (q) params.set("q", q)
    if (category) params.set("category", category)
    if (lowOnly) params.set("filter", "low")
    if (target > 1) params.set("page", String(target))
    const qs = params.toString()
    return qs ? `/admin/products?${qs}` : "/admin/products"
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminHeader
        title="Products"
        description={
          total === 1
            ? "One product in the catalogue."
            : `${total} products in the catalogue — edit prices, photos and stock from here.`
        }
        actions={
          <Button nativeButton={false} render={<Link href="/admin/products/new" />}>
            <Plus />
            New product
          </Button>
        }
        meta={
          lowOnly || q || category ? (
            <p className="text-xs font-medium text-muted-foreground">
              Showing a filtered view · <Link href="/admin/products" className="text-brand underline-offset-4 hover:underline">clear filters</Link>
            </p>
          ) : undefined
        }
      />

      {saved && (
        <p className="flex items-center gap-2 rounded-xl border border-success/30 bg-success-subtle px-4 py-3 text-sm font-medium text-success">
          <CheckCircle2 className="size-4 shrink-0" />
          Saved. The storefront has been updated.
        </p>
      )}

      <form
        className="flex flex-wrap items-center gap-2 rounded-2xl border border-border/60 bg-card p-3 shadow-sm"
        action="/admin/products"
      >
        <div className="relative min-w-52 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search name, brand or slug"
            className="h-9 w-full rounded-lg border border-input bg-card pr-3 pl-9 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
          />
        </div>

        <select
          name="category"
          defaultValue={category}
          className="h-9 rounded-lg border border-input bg-card px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>

        <label className="flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-input bg-card px-3 text-sm transition-colors hover:border-brand/30">
          <input
            type="checkbox"
            name="filter"
            value="low"
            defaultChecked={lowOnly}
            className="size-4 accent-[var(--brand)]"
          />
          Low stock only
        </label>

        <Button type="submit" variant="outline">
          Apply
        </Button>
        {(q || category || lowOnly) && (
          <Button type="button" variant="ghost" nativeButton={false} render={<Link href="/admin/products" />}>
            Reset
          </Button>
        )}
      </form>

      {products.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title="Nothing matches"
          description="Try a different search, or reset the filters to see the whole catalogue."
          action={
            <Button variant="outline" nativeButton={false} render={<Link href="/admin/products" />}>
              Reset filters
            </Button>
          }
        />
      ) : (
        <TableWrap className="min-w-0">
          <table className="w-full min-w-[46rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left">
                <Th>Product</Th>
                <Th>Category</Th>
                <Th className="text-right">Price</Th>
                <Th className="text-center">Stock</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                let image: string | null = null
                try {
                  const parsed: unknown = JSON.parse(product.images)
                  if (Array.isArray(parsed) && typeof parsed[0] === "string") image = parsed[0]
                } catch {
                  image = null
                }

                return (
                  <tr key={product.id} className={ROW_CLASS}>
                    <td className={CELL_CLASS}>
                      <div className="flex items-center gap-3">
                        <span className="relative size-11 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                          <ProductThumb src={image} alt="" sizes="2.75rem" />
                        </span>
                        <span className="min-w-0">
                          <span className="flex items-center gap-1.5">
                            <Link
                              href={`/admin/products/${product.id}/edit`}
                              className="line-clamp-1 font-medium hover:text-brand hover:underline"
                            >
                              {product.name}
                            </Link>
                            {product.featured && (
                              <Star
                                className="size-3.5 shrink-0 fill-warning text-warning"
                                aria-label="Featured"
                              />
                            )}
                          </span>
                          <span className="mt-0.5 flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">{product.brand}</span>
                            <ConditionBadge condition={product.condition} />
                          </span>
                        </span>
                      </div>
                    </td>

                    <td className={CELL_CLASS}>
                      <span className="inline-flex items-center rounded-lg bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                        {product.category.name}
                      </span>
                    </td>

                    <td className={cn(CELL_CLASS, "text-right tnum")}>
                      <span className="font-medium">{formatPrice(product.price)}</span>
                      {product.compareAtPrice && (
                        <span className="mt-0.5 block text-xs text-muted-foreground line-through">
                          {formatPrice(product.compareAtPrice)}
                        </span>
                      )}
                    </td>

                    <td className={CELL_CLASS}>
                      <form action={updateStockAction} className="flex items-center justify-center gap-1.5">
                        <input type="hidden" name="id" value={product.id} />
                        <input
                          type="number"
                          name="stock"
                          defaultValue={product.stock}
                          min={0}
                          aria-label={`Stock for ${product.name}`}
                          className={cn(
                            "h-8 w-16 rounded-md border bg-card px-2 text-center text-sm outline-none tnum focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30",
                            product.stock <= 0
                              ? "border-destructive/40 text-destructive"
                              : product.stock <= 3
                                ? "border-warning/50 text-warning"
                                : "border-input",
                          )}
                        />
                        <button
                          type="submit"
                          className="rounded-md px-1.5 py-1 text-xs font-medium text-brand hover:underline"
                        >
                          Save
                        </button>
                      </form>
                    </td>

                    <td className={CELL_CLASS}>
                      <div className="flex items-center justify-end gap-1">
                        <form action={toggleFeaturedAction}>
                          <input type="hidden" name="id" value={product.id} />
                          <button
                            type="submit"
                            title={product.featured ? "Remove from featured" : "Mark as featured"}
                            aria-label={
                              product.featured ? "Remove from featured" : "Mark as featured"
                            }
                            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-warning"
                          >
                            <Star className={cn("size-4", product.featured && "fill-warning text-warning")} />
                          </button>
                        </form>

                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          aria-label={`Edit ${product.name}`}
                          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        >
                          <Pencil className="size-4" />
                        </Link>

                        <form action={deleteProductAction}>
                          <input type="hidden" name="id" value={product.id} />
                          <button
                            type="submit"
                            aria-label={`Delete ${product.name}`}
                            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-destructive"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </TableWrap>
      )}

      {pageCount > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground tnum">
            Page {page} of {pageCount}
          </p>
          <div className="flex gap-2">
            <StepLink href={page > 1 ? hrefFor(page - 1) : null}>Previous</StepLink>
            <StepLink href={page < pageCount ? hrefFor(page + 1) : null}>Next</StepLink>
          </div>
        </div>
      )}
    </div>
  )
}

function StepLink({ href, children }: { href: string | null; children: ReactNode }) {
  if (!href) {
    return (
      <Button variant="outline" size="sm" disabled>
        {children}
      </Button>
    )
  }
  return (
    <Button variant="outline" size="sm" nativeButton={false} render={<Link href={href} />}>
      {children}
    </Button>
  )
}
