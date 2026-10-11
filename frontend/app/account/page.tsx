import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { LogOut, PackageOpen, ShieldCheck, UserRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { OrderStatusBadge } from "@/components/admin/order-status-badge"
import { logoutAction } from "@/app/actions/auth"
import { ApiError, api } from "@/lib/api"
import type { ApiOrder, ApiUser } from "@/lib/api-types"
import { getCurrentUser, sessionToken } from "@/lib/auth"
import { formatDate, formatPrice } from "@/lib/format"
import { site } from "@/lib/site"
import { PageHero } from "@/components/site/page-hero"
import { Reveal } from "@/components/motion/reveal"

export const metadata: Metadata = {
  title: "Your account",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

export default async function AccountPage() {
  // proxy.ts already guards this route; the check here means the page is still
  // safe on its own if the matcher is ever changed.
  const user = await getCurrentUser()
  if (!user) redirect("/login?next=%2Faccount")

  const token = await sessionToken()

  let profile: ApiUser
  let orders: ApiOrder[]
  try {
    const [me, mine] = await Promise.all([
      api.get<ApiUser>("/api/auth/me", token),
      api.get<{ orders: ApiOrder[] }>("/api/orders/mine", token),
    ])
    profile = me
    orders = mine.orders
  } catch (error) {
    // Account deleted server-side, or the session no longer resolves there.
    if (error instanceof ApiError && error.status === 401) {
      redirect("/login?next=%2Faccount")
    }
    throw error
  }

  const totalSpent = orders
    .filter((o) => o.status !== "CANCELLED")
    .reduce((sum, o) => sum + o.total, 0)

  return (
    <>
      <PageHero
        compact
        eyebrow="Your account"
        title={user.name}
        description={user.email}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Account" }]}
      >
        {user.role === "ADMIN" && (
          <Button variant="outline" nativeButton={false} render={<Link href="/admin" />}>
            <ShieldCheck />
            Admin dashboard
          </Button>
        )}
        <form action={logoutAction}>
          <Button type="submit" variant="ghost" className="text-muted-foreground">
            <LogOut />
            Sign out
          </Button>
        </form>
      </PageHero>

      <div className="container-page py-10 md:py-14">
      <Reveal>
      <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3">
        <Stat label="Orders placed" value={String(orders.length)} />
        <Stat label="Total spent" value={formatPrice(totalSpent)} />
        <Stat
          label="Member since"
          value={profile ? formatDate(profile.createdAt) : "—"}
        />
      </div>
      </Reveal>

      <h2 className="mt-10 text-lg font-semibold tracking-tight">Order history</h2>

      {orders.length === 0 ? (
        <div className="mt-4 flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <span className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
            <PackageOpen className="size-5" />
          </span>
          <h3 className="mt-4 text-base font-semibold">No orders yet</h3>
          <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
            When you place an order it will show up here, with the status and a link to the
            invoice.
          </p>
          <Button className="mt-6" nativeButton={false} render={<Link href="/shop" />}>
            Start shopping
          </Button>
        </div>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/order/${order.id}`}
                className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-foreground/20 hover:bg-accent"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-sm font-semibold tracking-wide tnum">
                      {order.orderNumber}
                    </span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDate(order.createdAt)} · {order.items.length}{" "}
                    {order.items.length === 1 ? "item" : "items"} ·{" "}
                    {order.items
                      .slice(0, 2)
                      .map((i) => i.name)
                      .join(", ")}
                    {order.items.length > 2 && ` +${order.items.length - 2} more`}
                  </p>
                </div>
                <span className="text-sm font-semibold tnum">{formatPrice(order.total)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-10 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-5">
        <span className="grid size-9 place-items-center rounded-lg bg-brand-subtle text-brand">
          <UserRound className="size-4.5" />
        </span>
        <p className="flex-1 text-sm text-muted-foreground">
          Need to change your details, or chasing a warranty claim? Message us and quote your
          order number.
        </p>
        <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/contact" />}>
          Contact the shop
        </Button>
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        {site.name} · {site.address}
      </p>
      </div>
    </>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card px-5 py-5">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="mt-1.5 text-xl font-semibold tracking-tight tnum">{value}</p>
    </div>
  )
}
