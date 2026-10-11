import type { Metadata } from "next"
import Link from "next/link"
import { PackageSearch, MessageCircle, X } from "lucide-react"
import { ShopFilters } from "@/components/product/shop-filters"
import { ProductGrid } from "@/components/product/product-card"
import { ShopPagination } from "@/components/product/shop-pagination"
import { ShopToolbar } from "@/components/product/shop-toolbar"
import { PageHero } from "@/components/site/page-hero"
import { Button } from "@/components/ui/button"
import { whatsappLink } from "@/lib/site"
import {
  getBrands,
  getCategories,
  getPriceBounds,
  getProducts,
  SORT_OPTIONS,
  type SortKey,
} from "@/lib/products"

type SearchParams = Record<string, string | string[] | undefined>

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Browse new, refurbished and pre-owned laptops, desktops, monitors, CCTV security cameras and accessories at Dani Brothers.",
}

const PER_PAGE = 12

/** Query strings are user input — a repeated `?brand=a&brand=b` arrives as an array. */
function first(value: string | string[] | undefined): string | undefined {
  const v = Array.isArray(value) ? value[0] : value
  return v?.trim() ? v.trim() : undefined
}

function many(value: string | string[] | undefined): string[] {
  if (value == null) return []
  return (Array.isArray(value) ? value : [value]).map((v) => v.trim()).filter(Boolean)
}

function toNumber(value: string | undefined): number | undefined {
  if (value == null) return undefined
  const n = Number(value)
  return Number.isFinite(n) && n >= 0 ? n : undefined
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const sp = await searchParams

  const category = first(sp.category)
  const brands = many(sp.brand)
  const conditions = many(sp.condition)
  const q = first(sp.q)
  const minPrice = toNumber(first(sp.min))
  const maxPrice = toNumber(first(sp.max))

  const sortParam = first(sp.sort)
  const sort: SortKey = SORT_OPTIONS.some((o) => o.value === sortParam)
    ? (sortParam as SortKey)
    : "newest"
  const page = Math.max(1, toNumber(first(sp.page)) ?? 1)

  const [result, facets, brands_, priceBounds] = await Promise.all([
    getProducts({ category, brands, conditions, minPrice, maxPrice, q, sort, page, perPage: PER_PAGE }),
    getCategories(),
    getBrands(),
    getPriceBounds(),
  ])

  const { products, total, pageCount } = result

  // The heading should read as a sentence about what the shopper is looking at.
  const activeCategory = facets.find((c) => c.slug === category)
  const heading = q
    ? `Results for “${q}”`
    : activeCategory
      ? activeCategory.name
      : "All products"
  const blurb = q
    ? `${total} ${total === 1 ? "product matches" : "products match"} your search.`
    : activeCategory
      ? (activeCategory.description ??
        `${total} ${total === 1 ? "product" : "products"} in this department.`)
      : "Everything currently on the shelves — new, refurbished and pre-owned, plus CCTV and security gear."

  // Active filter chips shown above the grid for quick visual feedback.
  const activeFilters: { key: string; label: string; removeUrl: string }[] = []
  if (activeCategory) {
    const params = new URLSearchParams()
    if (q) params.set("q", q)
    brands.forEach((b) => params.append("brand", b))
    conditions.forEach((c) => params.append("condition", c))
    if (minPrice != null) params.set("min", String(minPrice))
    if (maxPrice != null) params.set("max", String(maxPrice))
    if (sort !== "newest") params.set("sort", sort)
    const qs = params.toString()
    activeFilters.push({
      key: "category",
      label: activeCategory.name,
      removeUrl: qs ? `/shop?${qs}` : "/shop",
    })
  }
  if (q) {
    const params = new URLSearchParams()
    if (category) params.set("category", category)
    brands.forEach((b) => params.append("brand", b))
    conditions.forEach((c) => params.append("condition", c))
    const qs = params.toString()
    activeFilters.push({ key: "q", label: `“${q}”`, removeUrl: qs ? `/shop?${qs}` : "/shop" })
  }
  for (const brand of brands) {
    const params = new URLSearchParams()
    if (category) params.set("category", category)
    if (q) params.set("q", q)
    brands.filter((b) => b !== brand).forEach((b) => params.append("brand", b))
    conditions.forEach((c) => params.append("condition", c))
    if (minPrice != null) params.set("min", String(minPrice))
    if (maxPrice != null) params.set("max", String(maxPrice))
    if (sort !== "newest") params.set("sort", sort)
    activeFilters.push({ key: `brand-${brand}`, label: brand, removeUrl: `/shop?${params}` })
  }
  for (const condition of conditions) {
    const params = new URLSearchParams()
    if (category) params.set("category", category)
    if (q) params.set("q", q)
    brands.forEach((b) => params.append("brand", b))
    conditions.filter((c) => c !== condition).forEach((c) => params.append("condition", c))
    if (sort !== "newest") params.set("sort", sort)
    activeFilters.push({ key: `condition-${condition}`, label: condition, removeUrl: `/shop?${params}` })
  }
  if (minPrice != null || maxPrice != null) {
    const params = new URLSearchParams()
    if (category) params.set("category", category)
    if (q) params.set("q", q)
    brands.forEach((b) => params.append("brand", b))
    conditions.forEach((c) => params.append("condition", c))
    if (minPrice != null && maxPrice != null) params.set("min", String(minPrice))
    if (maxPrice != null) params.set("max", String(maxPrice))
    if (sort !== "newest") params.set("sort", sort)
    const label =
      minPrice != null && maxPrice != null
        ? `Rs ${minPrice} – Rs ${maxPrice}`
        : minPrice != null
          ? `From Rs ${minPrice}`
          : `Up to Rs ${maxPrice}`
    activeFilters.push({ key: "price", label, removeUrl: `/shop?${params}` })
  }

  return (
    <>
      <PageHero
        compact
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: activeCategory ? activeCategory.name : "Shop" },
        ]}
        title={heading}
        description={blurb}
      />

      <div className="container-page grid gap-8 py-8 lg:grid-cols-[16rem_1fr] lg:gap-10 lg:py-10">
        {/* Sidebar filters */}
        <aside className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
          <div className="rounded-xl border border-border bg-card p-4">
            <ShopFilters facets={{ categories: facets, brands: brands_, priceBounds }} />
          </div>
        </aside>

        <div className="min-w-0">
          <ShopToolbar
            total={total}
            sort={sort}
            facets={{ categories: facets, brands: brands_, priceBounds }}
            page={page}
            pageCount={pageCount}
          />

          {activeFilters.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Filters:</span>
              {activeFilters.map((filter) => (
                <Link
                  key={filter.key}
                  href={filter.removeUrl}
                  className="group inline-flex items-center gap-1 rounded-full border border-brand/25 bg-brand/10 px-3 py-1 text-xs font-semibold text-brand transition-all hover:border-brand/40 hover:bg-brand/15"
                >
                  {filter.label}
                  <X className="size-3 opacity-60 transition-opacity group-hover:opacity-100" />
                </Link>
              ))}
              <Link
                href="/shop"
                className="text-xs font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-destructive hover:underline"
              >
                Clear all
              </Link>
            </div>
          )}

          {products.length === 0 ? (
            <div className="mt-10 flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 py-20 text-center">
              <span className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
                <PackageSearch className="size-5" />
              </span>
              <h2 className="mt-4 text-base font-semibold">Nothing matched those filters</h2>
              <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
                Try widening the price range or clearing a brand. Stock also moves fast — ask us
                on WhatsApp and we&apos;ll check the back room.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button variant="outline" nativeButton={false} render={<Link href="/shop" />}>
                  Clear all filters
                </Button>
                <Button
                  variant="ghost"
                  nativeButton={false}
                  render={
                    <a
                      href={whatsappLink("Hi Dani Brothers, do you have this in stock?")}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  }
                >
                  <MessageCircle />
                  Ask on WhatsApp
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="mt-6">
                <ProductGrid products={products} priorityCount={4} />
              </div>
              <ShopPagination
                page={page}
                pageCount={pageCount}
                total={total}
                perPage={PER_PAGE}
                buildHref={(p) => {
                  const params = new URLSearchParams()
                  if (category) params.set("category", category)
                  if (q) params.set("q", q)
                  brands.forEach((b) => params.append("brand", b))
                  conditions.forEach((c) => params.append("condition", c))
                  if (minPrice != null) params.set("min", String(minPrice))
                  if (maxPrice != null) params.set("max", String(maxPrice))
                  if (sort !== "newest") params.set("sort", sort)
                  if (p > 1) params.set("page", String(p))
                  const qs = params.toString()
                  return qs ? `/shop?${qs}` : "/shop"
                }}
              />
            </>
          )}
        </div>
      </div>
    </>
  )
}

