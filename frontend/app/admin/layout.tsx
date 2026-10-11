import type { Metadata } from "next"
import { redirect } from "next/navigation"
import type { ReactNode } from "react"
import { ShieldCheck } from "lucide-react"
import { AdminSidebar, type SidebarCounts } from "@/components/admin/admin-sidebar"
import { api } from "@/lib/api"
import type { AdminStats } from "@/lib/api-types"
import { getCurrentUser, sessionToken } from "@/lib/auth"
import { site } from "@/lib/site"

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin" },
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

/**
 * Badges on the sidebar come from the same stats endpoint the dashboard uses.
 * A hiccup there should cost the counts, not the whole admin area.
 */
async function readCounts(): Promise<SidebarCounts> {
  try {
    const stats = await api.get<AdminStats>("/api/admin/stats", await sessionToken())
    return {
      lowStock: (stats.lowStock ?? 0) + (stats.outOfStock ?? 0),
      pendingOrders: stats.byStatus?.PENDING ?? 0,
      openInquiries: stats.openInquiries ?? 0,
    }
  } catch {
    return {}
  }
}

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // proxy.ts gates /admin, but the role check is repeated here: the layout is
  // what actually decides whether admin UI is rendered, and it should not
  // depend on a matcher elsewhere staying correct.
  const user = await getCurrentUser()
  if (!user) redirect("/login?next=%2Fadmin")
  if (user.role !== "ADMIN") redirect("/account")

  const counts = await readCounts()

  return (
    <div className="container-page py-8 md:py-10">
      <div className="grid gap-8 lg:grid-cols-[15rem_1fr] lg:gap-10">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-subtle text-brand">
                <ShieldCheck className="size-4.5" />
              </span>
              <div className="min-w-0">
                <p className="text-eyebrow text-brand">Control room</p>
                <p className="mt-1 truncate text-sm font-semibold">{site.name}</p>
              </div>
            </div>
            <p className="mt-3 truncate border-t border-border pt-3 text-xs text-muted-foreground">
              {user.email}
            </p>
          </div>

          <div className="mt-5">
            <AdminSidebar counts={counts} />
          </div>

          <p className="mt-6 hidden text-xs leading-relaxed text-muted-foreground lg:block">
            Everything you change here goes live on the storefront straight away.
          </p>
        </aside>

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  )
}
