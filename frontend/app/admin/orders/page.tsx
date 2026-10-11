import type { Metadata } from "next"
import type { ReactNode } from "react"
import Link from "next/link"
import { Search, ShoppingCart } from "lucide-react"
import { AdminHeader } from "@/components/admin/admin-header"
import { EmptyState } from "@/components/admin/admin-empty"
import { CELL_CLASS, ROW_CLASS, TableWrap, Th } from "@/components/admin/admin-table"
import { FilterTab, FilterTabs } from "@/components/admin/admin-tabs"
import { Initials } from "@/components/admin/admin-avatar"
import { OrderStatusBadge } from "@/components/admin/order-status-badge"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import type { AdminOrderList } from "@/lib/api-types"
import { sessionToken } from "@/lib/auth"
import { formatDateTime, formatPrice } from "@/lib/format"
import { ORDER_STATUS_LABEL, ORDER_STATUSES, type OrderStatus } from "@/lib/site"

export const metadata: Metadata = { title: "Orders" }

export const dynamic = "force-dynamic"

type SearchParams = Record<string, string | string[] | undefined>

function first(value: string | string[] | undefined): string {
  const v = Array.isArray(value) ? value[0] : value
  return v?.trim() ?? ""
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const sp = await searchParams
  const status = first(sp.status)
  const q = first(sp.q)
  const page = Math.max(1, Number(first(sp.page)) || 1)

  const filters = new URLSearchParams()
  if (status) filters.set("status", status)
  if (q) filters.set("q", q)
  filters.set("page", String(page))

  const listing = await api.get<AdminOrderList>(
    `/api/admin/orders?${filters.toString()}`,
    await sessionToken(),
  )

  const { orders, total, pageCount } = listing
  const byStatus = new Map(Object.entries(listing.byStatus))
  const pending = byStatus.get("PENDING") ?? 0

  function tabHref(next: string) {
    const params = new URLSearchParams()
    if (next) params.set("status", next)
    if (q) params.set("q", q)
    const qs = params.toString()
    return qs ? `/admin/orders?${qs}` : "/admin/orders"
  }

  function pageHref(target: number) {
    const params = new URLSearchParams()
    if (status) params.set("status", status)
    if (q) params.set("q", q)
    if (target > 1) params.set("page", String(target))
    const qs = params.toString()
    return qs ? `/admin/orders?${qs}` : "/admin/orders"
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminHeader
        title="Orders"
        description={
          total === 0
            ? "Nothing in this view yet."
            : `${total} ${total === 1 ? "order" : "orders"} matching the current view.`
        }
        meta={
          pending > 0 ? (
            <p className="text-xs font-medium text-muted-foreground">
              <span className="mr-1.5 inline-block size-1.5 rounded-full bg-warning align-middle" />
              {pending} {pending === 1 ? "order is" : "orders are"} still waiting to be confirmed
            </p>
          ) : undefined
        }
      />

      <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-3 shadow-sm xl:flex-row xl:items-center xl:justify-between">
        <FilterTabs bare>
          <FilterTab href={tabHref("")} active={!status}>
            All
          </FilterTab>
          {ORDER_STATUSES.map((s) => (
            <FilterTab
              key={s}
              href={tabHref(s)}
              active={status === s}
              count={byStatus.get(s) ?? 0}
            >
              {ORDER_STATUS_LABEL[s as OrderStatus]}
            </FilterTab>
          ))}
        </FilterTabs>

        <form action="/admin/orders" className="flex min-w-0 flex-1 items-center gap-2 xl:max-w-md">
          {status && <input type="hidden" name="status" value={status} />}
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Order number, name, phone or city"
              className="h-9 w-full rounded-lg border border-input bg-card pr-3 pl-9 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
            />
          </div>
          <Button type="submit" variant="outline">
            <Search />
            <span className="sr-only sm:not-sr-only">Search</span>
          </Button>
          {q && (
            <Button
              type="button"
              variant="ghost"
              nativeButton={false}
              render={<Link href={tabHref(status)} />}
            >
              Reset
            </Button>
          )}
        </form>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="No orders here yet"
          description={
            status
              ? "Nothing with that status right now — try another tab or clear the search."
              : "Orders land here the moment a customer checks out."
          }
          action={
            status || q ? (
              <Button variant="outline" nativeButton={false} render={<Link href="/admin/orders" />}>
                Show all orders
              </Button>
            ) : undefined
          }
        />
      ) : (
        <TableWrap>
          <table className="w-full min-w-[44rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left">
                <Th>Order</Th>
                <Th>Customer</Th>
                <Th>Placed</Th>
                <Th>Status</Th>
                <Th className="text-right">Total</Th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className={ROW_CLASS}>
                  <td className={CELL_CLASS}>
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-medium tracking-wide tnum hover:text-brand hover:underline"
                    >
                      {order.orderNumber}
                    </Link>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {order.itemCount} {order.itemCount === 1 ? "item" : "items"} ·{" "}
                      {order.paymentMethod === "COD" ? "COD" : "Bank transfer"}
                    </span>
                  </td>
                  <td className={CELL_CLASS}>
                    <div className="flex items-center gap-3">
                      <Initials name={order.customerName} size="sm" />
                      <div className="min-w-0">
                        <span className="block truncate font-medium">{order.customerName}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {order.phone} · {order.city}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className={`${CELL_CLASS} whitespace-nowrap text-muted-foreground`}>
                    {formatDateTime(order.createdAt)}
                  </td>
                  <td className={CELL_CLASS}>
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className={`${CELL_CLASS} text-right font-medium tnum`}>
                    {formatPrice(order.total)}
                  </td>
                </tr>
              ))}
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
            <StepLink href={page > 1 ? pageHref(page - 1) : null}>Previous</StepLink>
            <StepLink href={page < pageCount ? pageHref(page + 1) : null}>Next</StepLink>
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
