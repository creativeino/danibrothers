import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  Check,
  FileImage,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  Receipt,
  Truck,
} from "lucide-react"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminPanel } from "@/components/admin/admin-panel"
import { AnimatedBar } from "@/components/admin/animated-bar"
import { Initials } from "@/components/admin/admin-avatar"
import { OrderStatusBadge } from "@/components/admin/order-status-badge"
import { Button } from "@/components/ui/button"
import { ProductThumb } from "@/components/product/product-thumb"
import { updateOrderStatusAction } from "@/app/actions/admin"
import { ApiError, api } from "@/lib/api"
import type { ApiOrder } from "@/lib/api-types"
import { sessionToken } from "@/lib/auth"
import { formatDateTime, formatPrice } from "@/lib/format"
import { ORDER_STATUS_LABEL, ORDER_STATUSES, whatsappLink } from "@/lib/site"
import { cn } from "@/lib/utils"
import { digits } from "@/lib/validation"

export const metadata: Metadata = { title: "Order" }

export const dynamic = "force-dynamic"

/** The happy path a customer order walks through. */
const FLOW = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"] as const

const FLOW_HINT: Record<string, string> = {
  PENDING: "Placed, not confirmed",
  CONFIRMED: "Payment sorted",
  SHIPPED: "On its way",
  DELIVERED: "Handed over",
}

export default async function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  let order: ApiOrder
  try {
    order = await api.get<ApiOrder>(
      `/api/admin/orders/${encodeURIComponent(id)}`,
      await sessionToken(),
    )
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound()
    throw error
  }

  const waNumber = digits(order.phone).replace(/^0/, "92")
  const cancelled = order.status === "CANCELLED"
  const current = FLOW.indexOf(order.status as (typeof FLOW)[number])

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/admin/orders"
        className="group inline-flex w-fit items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
        All orders
      </Link>

      <AdminHeader
        eyebrow="Order"
        title={<span className="tnum">{order.orderNumber}</span>}
        description={`Placed ${formatDateTime(order.createdAt)}${
          order.user ? " · registered account" : " · guest checkout"
        }`}
        meta={
          <div className="flex flex-wrap items-center gap-3">
            <OrderStatusBadge status={order.status} />
            <span className="text-xs font-medium text-muted-foreground tnum">
              {order.itemCount} {order.itemCount === 1 ? "item" : "items"} ·{" "}
              {formatPrice(order.total)}
            </span>
          </div>
        }
        actions={
          <>
            <Button
              size="sm"
              nativeButton={false}
              render={
                <a
                  href={whatsappLink(
                    `Hi ${order.customerName}, about your order ${order.orderNumber} from Dani Brothers —`,
                    waNumber,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              <MessageCircle />
              WhatsApp
            </Button>
            <Button
              size="sm"
              variant="outline"
              nativeButton={false}
              render={<a href={`tel:${digits(order.phone)}`} />}
            >
              <Phone />
              Call
            </Button>
          </>
        }
      />

      <AdminPanel title="Progress" description={cancelled ? "This order was cancelled" : "Where it has got to so far"}>
        {cancelled && (
          <p className="mb-5 rounded-xl border border-destructive/30 bg-destructive-subtle px-3.5 py-2.5 text-sm font-medium text-destructive">
            Cancelled — the items were returned to stock.
          </p>
        )}

        <ol className="flex flex-col gap-5 sm:flex-row sm:gap-0">
          {FLOW.map((step, index) => {
            const done = !cancelled && index < current
            const isNow = !cancelled && index === current
            return (
              <li key={step} className="flex-1 sm:pr-4">
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "grid size-8 shrink-0 place-items-center rounded-full border-2 text-xs font-bold transition-colors",
                      done && "border-brand bg-brand text-white",
                      isNow && "border-brand bg-brand-subtle text-brand",
                      !done && !isNow && "border-border bg-muted text-muted-foreground",
                    )}
                  >
                    {done ? <Check className="size-4" /> : index + 1}
                  </span>
                  {index < FLOW.length - 1 && (
                    <span className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
                      <AnimatedBar percent={done ? 100 : 0} className="bg-brand" duration="duration-500" />
                    </span>
                  )}
                </div>
                <p
                  className={cn(
                    "mt-2.5 text-xs font-semibold",
                    isNow ? "text-brand" : "text-foreground",
                  )}
                >
                  {ORDER_STATUS_LABEL[step]}
                </p>
                <p className="text-[0.7rem] text-muted-foreground">{FLOW_HINT[step]}</p>
              </li>
            )
          })}
        </ol>

        <div className="mt-6 border-t border-border pt-4">
          <p className="text-xs font-medium text-muted-foreground">
            Cancelling an order returns its items to stock. Un-cancelling takes them back out again.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {ORDER_STATUSES.map((status) => {
              const active = order.status === status
              return (
                <form key={status} action={updateOrderStatusAction}>
                  <input type="hidden" name="id" value={order.id} />
                  <input type="hidden" name="status" value={status} />
                  <Button
                    type="submit"
                    size="sm"
                    variant={active ? "default" : "outline"}
                    disabled={active}
                  >
                    {active && <Check />}
                    {ORDER_STATUS_LABEL[status]}
                  </Button>
                </form>
              )
            })}
          </div>
        </div>
      </AdminPanel>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <AdminPanel title="Items" padded={false} className="h-full">
          <ul className="divide-y divide-border">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center gap-4 px-5 py-3.5">
                <span className="relative size-12 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                  <ProductThumb src={item.image} alt={item.name} sizes="3rem" />
                </span>
                <span className="min-w-0 flex-1">
                  {item.productSlug ? (
                    <Link
                      href={`/product/${item.slug}`}
                      className="line-clamp-1 text-sm font-medium hover:text-brand hover:underline"
                    >
                      {item.name}
                    </Link>
                  ) : (
                    <span className="line-clamp-1 text-sm font-medium">{item.name}</span>
                  )}
                  <span className="mt-0.5 block text-xs text-muted-foreground tnum">
                    {item.qty} × {formatPrice(item.price)}
                    {!item.productSlug && " · product since deleted"}
                  </span>
                </span>
                <span className="text-sm font-medium tnum">
                  {formatPrice(item.price * item.qty)}
                </span>
              </li>
            ))}
          </ul>

          <dl className="flex flex-col gap-2 border-t border-border px-5 py-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="tnum">{formatPrice(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Delivery</dt>
              <dd className="tnum">{formatPrice(order.shipping)}</dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-border pt-3">
              <dt className="font-medium">Total</dt>
              <dd className="text-lg font-semibold tracking-tight tnum">
                {formatPrice(order.total)}
              </dd>
            </div>
          </dl>
        </AdminPanel>

        <div className="flex flex-col gap-6">
          <AdminPanel title="Customer" className="h-full">
            <div className="flex items-center gap-3">
              <Initials name={order.customerName} size="lg" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{order.customerName}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {order.email || order.phone}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-1 text-sm">
              <a
                href={`tel:${digits(order.phone)}`}
                className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
              >
                <Phone className="size-3.5" />
                {order.phone}
              </a>
              {order.email && (
                <a
                  href={`mailto:${order.email}`}
                  className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Receipt className="size-3.5" />
                  {order.email}
                </a>
              )}
            </div>

            <h3 className="mt-5 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              <MapPin className="size-3.5" />
              Deliver to
            </h3>
            <address className="mt-1.5 text-sm leading-relaxed not-italic">
              {order.address}
              <br />
              {order.city}
            </address>

            <h3 className="mt-5 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              <Truck className="size-3.5" />
              Payment
            </h3>
            <p className="mt-1.5 text-sm">
              {order.paymentMethod === "COD" ? "Cash on delivery" : "Bank transfer"}
            </p>

            {/* The customer's own proof that the money moved. Rendered as a
                link rather than an inline image: it decides whether the order
                ships, so it gets looked at full size, not at thumbnail size. */}
            {order.paymentMethod === "BANK_TRANSFER" && (
              <div className="mt-2">
                {order.paymentProof ? (
                  <a
                    href={order.paymentProof}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500/25 bg-blue-500/5 px-2.5 py-1.5 text-xs font-semibold text-blue-600 underline-offset-4 hover:underline"
                  >
                    <FileImage className="size-3.5" />
                    View payment receipt
                  </a>
                ) : (
                  <p className="text-xs leading-relaxed text-amber-600">
                    No receipt attached — ask the customer for it before shipping.
                  </p>
                )}
              </div>
            )}

            {order.notes && (
              <>
                <h3 className="mt-5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Customer notes
                </h3>
                <p className="mt-1.5 rounded-xl bg-muted px-3 py-2.5 text-sm leading-relaxed text-muted-foreground">
                  {order.notes}
                </p>
              </>
            )}
          </AdminPanel>

          <AdminPanel title="Customer view">
            <p className="text-xs leading-relaxed text-muted-foreground">
              The link below is what the customer sees. It is not indexed and only reachable by
              anyone holding the order id.
            </p>
            <Link
              href={`/order/${order.id}`}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-brand underline-offset-4 hover:underline"
            >
              <Package className="size-4" />
              Open customer order page →
            </Link>
          </AdminPanel>
        </div>
      </div>
    </div>
  )
}
