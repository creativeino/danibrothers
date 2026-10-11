import type { Category, Product } from "@/lib/db-types"
import type { SortKey } from "@/lib/sort-options"
import type { Spec, ProductView } from "@/lib/product-types"
import { ApiError, api } from "@/lib/api"

// Re-exported for server-side callers. Client components must import these
// from `@/lib/sort-options` directly — see the note in that file.
export { SORT_OPTIONS, type SortKey } from "@/lib/sort-options"

export type { Spec, ProductView } from "@/lib/product-types"
export { stockState } from "@/lib/product-types"

/**
 * `images` and `specs` are JSON strings in the column (the API passes them
 * through untouched so the admin forms can keep editing them as text). A
 * malformed value should degrade to an empty list rather than crash a page,
 * so parsing is defensive.
 */
function parseArray<T>(raw: string): T[] {
  try {
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as T[]) : []
  } catch {
    return []
  }
}

/** Row as it arrives from the API: JSON still encoded, dates still ISO strings. */
export type ProductRow = Omit<Product, "images" | "specs" | "createdAt" | "updatedAt"> & {
  images: string
  specs: string
  createdAt: string
  updatedAt: string
  category: Pick<Category, "id" | "name" | "slug"> | null
}

export function toProductView(row: ProductRow): ProductView {
  const images = parseArray<string>(row.images).filter(
    (src): src is string => typeof src === "string" && src.length > 0,
  )
  return {
    ...row,
    images,
    specs: parseArray<Spec>(row.specs).filter(
      (s): s is Spec => !!s && typeof s.label === "string" && typeof s.value === "string",
    ),
    category: row.category ?? null,
    primaryImage: images[0] ?? null,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  }
}

export type ProductFilters = {
  category?: string
  brands?: string[]
  conditions?: string[]
  minPrice?: number
  maxPrice?: number
  q?: string
  sort?: SortKey
  featuredOnly?: boolean
  page?: number
  perPage?: number
}

type ProductListResponse = {
  products: ProductRow[]
  total: number
  page: number
  perPage: number
  pageCount: number
}

function queryString(filters: ProductFilters, page: number, perPage: number): string {
  const params = new URLSearchParams()
  if (filters.category) params.append("category", filters.category)
  for (const brand of filters.brands ?? []) params.append("brand", brand)
  for (const condition of filters.conditions ?? []) params.append("condition", condition)
  if (filters.minPrice != null) params.set("min", String(filters.minPrice))
  if (filters.maxPrice != null) params.set("max", String(filters.maxPrice))
  if (filters.q) params.set("q", filters.q)
  if (filters.sort) params.set("sort", filters.sort)
  if (filters.featuredOnly) params.set("featured", "true")
  params.set("page", String(page))
  params.set("per_page", String(perPage))
  return params.toString()
}

export async function getProducts(filters: ProductFilters = {}) {
  const page = Math.max(1, filters.page ?? 1)
  const perPage = filters.perPage ?? 12

  const data = await api.get<ProductListResponse>(`/api/products?${queryString(filters, page, perPage)}`)

  return {
    products: data.products.map(toProductView),
    total: data.total,
    page: data.page,
    perPage: data.perPage,
    pageCount: data.pageCount,
  }
}

export async function getFeaturedProducts(take = 8): Promise<ProductView[]> {
  const rows = await api.get<ProductRow[]>(`/api/products/featured?take=${take}`)
  return rows.map(toProductView)
}

export async function getProductsByCategorySlugs(
  categorySlugs: string[],
  take = 8,
): Promise<ProductView[]> {
  const params = new URLSearchParams()
  for (const slug of categorySlugs) params.append("category", slug)
  params.set("per_page", String(take))
  const data = await api.get<ProductListResponse>(`/api/products?${params.toString()}`)
  return data.products.map(toProductView)
}

export async function getProductBySlug(slug: string): Promise<ProductView | null> {
  try {
    return toProductView(await api.get<ProductRow>(`/api/products/${encodeURIComponent(slug)}`))
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null
    throw error
  }
}

export async function getRelatedProducts(
  product: Pick<ProductView, "id" | "categoryId">,
  take = 4,
): Promise<ProductView[]> {
  const params = new URLSearchParams({
    category_id: product.categoryId,
    exclude: product.id,
    take: String(take),
  })
  const rows = await api.get<ProductRow[]>(`/api/products/related?${params.toString()}`)
  return rows.map(toProductView)
}

export async function getCategories(): Promise<(Category & { productCount: number })[]> {
  return api.get<(Category & { productCount: number })[]>("/api/categories")
}

export async function getBrands(): Promise<string[]> {
  return api.get<string[]>("/api/brands")
}

export async function getPriceBounds(): Promise<{ min: number; max: number }> {
  return api.get<{ min: number; max: number }>("/api/products/price-bounds")
}

export async function getProductSlugs(): Promise<string[]> {
  return api.get<string[]>("/api/products/slugs")
}
