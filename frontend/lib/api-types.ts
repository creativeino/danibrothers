import type { Category, Inquiry, Order, User } from "@/lib/db-types"
import type { ProductRow } from "@/lib/products"

/**
 * Wire shapes as the API sends them: camelCase JSON, dates as ISO strings.
 * Pages that render server-fetched data type their reads with these.
 */

export type ApiUser = Omit<User, "createdAt"> & { createdAt: string }

export type ApiCategory = Category & { productCount: number }

/** Admin tables join a product to its category; the FK is never null. */
export type AdminProductRow = Omit<ProductRow, "category"> & {
  category: NonNullable<ProductRow["category"]>
}

export type ApiOrderItem = {
  id: string
  productId: string | null
  name: string
  slug: string
  image: string | null
  price: number
  qty: number
  /** Admin order detail only: live product, when it still exists. */
  productSlug: string | null
  productStock: number | null
}

export type ApiOrder = Omit<Order, "createdAt" | "updatedAt"> & {
  createdAt: string
  updatedAt: string
  items: ApiOrderItem[]
  itemCount: number
  user: { id: string; name: string; email: string } | null
}

export type ApiInquiry = Omit<Inquiry, "createdAt"> & { createdAt: string }

export type AdminStats = {
  productCount: number
  outOfStock: number
  lowStock: number
  orderCount: number
  customerCount: number
  revenue: number
  openInquiries: number
  byStatus: Record<string, number>
  recentOrders: ApiOrder[]
}

export type AdminOrderList = {
  orders: ApiOrder[]
  total: number
  page: number
  pageCount: number
  byStatus: Record<string, number>
}

export type AdminInquiryList = {
  inquiries: ApiInquiry[]
  openCount: number
  handledCount: number
}
