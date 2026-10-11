import type { Metadata } from "next"
import Link from "next/link"
import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  ExternalLink,
  Inbox,
  MessageSquare,
  Package,
  PackagePlus,
  ShoppingCart,
  Users,
} from "lucide-react"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminPanel } from "@/components/admin/admin-panel"
import { StatCard } from "@/components/admin/admin-stat"
import { Initials } from "@/components/admin/admin-avatar"
import { Button } from "@/components/ui/button"
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal"
import { api } from "@/lib/api"
import type { AdminInquiryList, AdminProductRow, AdminStats } from "@/lib/api-types"
import { sessionToken } from "@/lib/auth"
import { formatDate, formatDateTime } from "@/lib/format"
import { ORDER_STATUS_LABEL, ORDER_STATUSES, type OrderStatus } from "@/lib/site"
import { cn } from "@/lib/utils"

export const metadata: Metadata = { title: "Dashboard" }

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-warning",
  CONFIRMED: "bg-brand",
  SHIPPED: "bg-chart-4",
  DELIVERED: "bg-success",
  CANCELLED: "bg-destructive",
}

const PanelLink = ({ href, children }: { href: string; children: string }) => (
  <Link
    href={href}
    className="group inline-flex items-center gap-1 rounded-lg border border-brand/20 bg-brand/5 px-3 py-1.5 text-xs font-semibold text-brand transition-all hover:border-brand/40 hover:bg-brand/10"
  >
    {children}
    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
  </Link>
)

export default async function AdminDashboardPage() {
  const token = await sessionToken()
  const [stats, lowStock, openLeads] = await Promise.all([
    api.get<AdminStats>("/api/admin/stats", token),
    api.get<{ products: AdminProductRow[]; total: number }>("/api/admin/products?filter=low", token),
    api.get<AdminInquiryList>("/api/admin/inquiries?show=open", token),
  ])

  const { productCount, outOfStock, lowStock: lowCount, orderCount, customerCount, revenue } = stats
  const openInquiries = stats.openInquiries
  const byStatus = new Map(Object.entries(stats.byStatus))
  const needsAttention = outOfStock + lowCount

  return (
    <div className="flex flex-col gap-6">
      <AdminHeader
        title="Dashboard"
        description="What the shop is doing right now — takings, stock levels and everyone still waiting on a reply."
        actions={
          <>
            <Button nativeButton={false} render={<Link href="/admin/products/new" />}>
              <PackagePlus />
              New product
            </Button>
            <Button
              variant="outline"
              nativeButton={false}
              render={
                <a href="/" target="_blank" rel="noopener noreferrer" />
              }
            >
              <ExternalLink />
              View store
            </Button>
          </>
        }
        meta={
          <p className="text-xs font-medium text-muted-foreground">
            {formatDate(new Date())} · everything below goes live on the storefront instantly
          </p>
        }
      />

      <Stagger className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        <StaggerItem className="h-full">
          <StatCard
            icon={<Banknote />}
            label="Revenue"
            value={revenue}
            format="currency"
            tone="success"
            hint="Excludes cancelled orders"
          />
        </StaggerItem>
        <StaggerItem className="h-full">
          <StatCard
            icon={<ShoppingCart />}
            label="Orders"
            value={orderCount}
            tone="brand"
            href="/admin/orders"
            hint={`${byStatus.get("PENDING") ?? 0} awaiting confirmation`}
          />
        </StaggerItem>
        <StaggerItem className="h-full">
          <StatCard
            icon={<Package />}
            label="Products"
            value={productCount}
            tone="warning"
            href="/admin/products"
            hint={needsAttention > 0 ? `${needsAttention} need restocking` : "All stock healthy"}
          />
        </StaggerItem>
        <StaggerItem className="h-full">
          <StatCard
            icon={<Users />}
            label="Customers"
            value={customerCount}
            tone="violet"
            href="/admin/inquiries"
            hint={`${openInquiries} open ${openInquiries === 1 ? "inquiry" : "inquiries"}`}
          />
        </StaggerItem>
      </Stagger>

      {(outOfStock > 0 || lowCount > 0) && (
        <Reveal>
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-warning/30 bg-warning-subtle px-4 py-3.5">
            <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-warning/15">
              <AlertTriangle className="size-4 text-warning" />
            </span>
            <p className="flex-1 text-sm font-medium text-warning">
              {outOfStock > 0 && `${outOfStock} out of stock`}
              {outOfStock > 0 && lowCount > 0 && " · "}
              {lowCount > 0 && `${lowCount} running low`}
            </p>
            <Link
              href="/admin/products?filter=low"
              className="rounded-lg bg-warning/10 px-3 py-1.5 text-sm font-semibold text-warning transition-colors hover:bg-warning/20"
            >
              Review stock
            </Link>
          </div>
        </Reveal>
      )}

      <Reveal>
        <AdminPanel
          title="Orders by status"
          description={
            orderCount > 0
              ? `${orderCount} ${orderCount === 1 ? "order" : "orders"} in total`
              : "Nothing to break down yet"
          }
          action={<PanelLink href="/admin/orders">All orders</PanelLink>}
        >
          {orderCount === 0 ? (
            <p className="text-sm text-muted-foreground">
              Orders appear here the moment a customer checks out.
            </p>
          ) : (
            <>
              <div className="flex h-2.5 w-full gap-px overflow-hidden rounded-full bg-muted">
                {ORDER_STATUSES.map((status) => {
                  const count = byStatus.get(status) ?? 0
                  if (count === 0) return null
                  const share = (count / orderCount) * 100
                  return (
                    <span
                      key={status}
                      title={`${ORDER_STATUS_LABEL[status as OrderStatus]}: ${count}`}
                      style={{ width: `${share}%` }}
                      className={cn(
                        "h-full transition-opacity hover:opacity-80",
                        STATUS_COLORS[status] ?? "bg-brand",
                      )}
                    />
                  )
                })}
              </div>

              <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {ORDER_STATUSES.map((status) => {
                  const count = byStatus.get(status) ?? 0
                  const share = orderCount > 0 ? Math.round((count / orderCount) * 100) : 0
                  return (
                    <div
                      key={status}
                      className="rounded-xl border border-border/60 bg-background px-3.5 py-3"
                    >
                      <dt className="flex items-center gap-2 truncate text-xs text-muted-foreground">
                        <span
                          className={cn(
                            "size-2 shrink-0 rounded-full",
                            STATUS_COLORS[status] ?? "bg-muted-foreground",
                          )}
                        />
                        {ORDER_STATUS_LABEL[status as OrderStatus]}
                      </dt>
                      <dd className="mt-1.5 flex items-baseline gap-1.5">
                        <span className="text-xl font-semibold tracking-tight tnum">{count}</span>
                        <span className="text-xs text-muted-foreground tnum">{share}%</span>
                      </dd>
                    </div>
                  )
                })}
              </dl>
            </>
          )}
        </AdminPanel>
      </Reveal>

      <div className="grid gap-6 lg:grid-cols-2">
        <Reveal>
          <AdminPanel
            title="Needs restocking"
            description={
              lowStock.total > 0
                ? `${lowStock.total} ${lowStock.total === 1 ? "product" : "products"} at 5 or fewer`
                : "Every product has stock"
            }
            action={<PanelLink href="/admin/products?filter=low">Open catalogue</PanelLink>}
            padded={false}
            className="h-full"
          >
            {lowStock.total === 0 ? (
              <p className="flex items-center gap-2 px-5 py-8 text-sm text-muted-foreground">
                <Package className="size-4" />
                Nothing is running low.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {lowStock.products.slice(0, 5).map((product) => (
                  <li key={product.id}>
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-brand-subtle/40"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{product.name}</span>
                        <span className="text-xs text-muted-foreground">{product.category.name}</span>
                      </span>
                      <span
                        className={cn(
                          "rounded-lg px-2 py-1 text-xs font-semibold tnum",
                          product.stock <= 0
                            ? "bg-destructive-subtle text-destructive"
                            : "bg-warning-subtle text-warning",
                        )}
                      >
                        {product.stock <= 0 ? "Out of stock" : `${product.stock} left`}
                      </span>
                    </Link>
                  </li>
                ))}
                {lowStock.total > 5 && (
                  <li className="px-5 py-3 text-xs text-muted-foreground">
                    + {lowStock.total - 5} more
                  </li>
                )}
              </ul>
            )}
          </AdminPanel>
        </Reveal>

        <Reveal delay={0.08}>
          <AdminPanel
            title="Waiting for a reply"
            description={
              openInquiries > 0
                ? `${openInquiries} open ${openInquiries === 1 ? "lead" : "leads"}`
                : "Nothing waiting"
            }
            action={<PanelLink href="/admin/inquiries">Open inbox</PanelLink>}
            padded={false}
            className="h-full"
          >
            {openLeads.inquiries.length === 0 ? (
              <p className="flex items-center gap-2 px-5 py-8 text-sm text-muted-foreground">
                <Inbox className="size-4" />
                You&apos;re all caught up.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {openLeads.inquiries.slice(0, 4).map((inquiry) => (
                  <li key={inquiry.id}>
                    <Link
                      href="/admin/inquiries"
                      className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-brand-subtle/40"
                    >
                      <Initials name={inquiry.name} size="sm" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{inquiry.name}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {inquiry.message || inquiry.device || "No message"}
                        </span>
                      </span>
                      <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
                        <MessageSquare className="size-3.5" />
                        {formatDateTime(inquiry.createdAt)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </AdminPanel>
        </Reveal>
      </div>
    </div>
  )
}
