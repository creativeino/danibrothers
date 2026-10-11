"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ExternalLink,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Package,
  ShoppingCart,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { logoutAction } from "@/app/actions/auth"

export type SidebarCounts = {
  /** Products at or below the low-stock line (including zero). */
  lowStock?: number
  /** Orders still sitting in PENDING. */
  pendingOrders?: number
  /** Leads not marked handled yet. */
  openInquiries?: number
}

type Tone = "warning" | "brand" | "success"

const TONES: Record<Tone, string> = {
  warning: "bg-warning-subtle text-warning",
  brand: "bg-brand-subtle text-brand",
  success: "bg-success-subtle text-success",
}

export function AdminSidebar({ counts = {} }: { counts?: SidebarCounts }) {
  const pathname = usePathname()

  const links = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    {
      href: "/admin/products",
      label: "Products",
      icon: Package,
      badge: counts.lowStock,
      badgeLabel: "needing stock",
      tone: "warning" as Tone,
    },
    {
      href: "/admin/orders",
      label: "Orders",
      icon: ShoppingCart,
      badge: counts.pendingOrders,
      badgeLabel: "pending",
      tone: "brand" as Tone,
    },
    {
      href: "/admin/inquiries",
      label: "Inquiries",
      icon: MessageSquare,
      badge: counts.openInquiries,
      badgeLabel: "open",
      tone: "success" as Tone,
    },
  ]

  return (
    <nav className="flex flex-col" aria-label="Admin">
      <p className="px-3.5 pb-2 text-[0.65rem] font-bold tracking-[0.14em] text-muted-foreground/60 uppercase">
        Manage
      </p>

      <div className="flex flex-col gap-1">
        {links.map(({ href, label, icon: Icon, exact, badge, badgeLabel, tone }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)
          const showBadge = typeof badge === "number" && badge > 0

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              title={showBadge ? `${badge} ${badgeLabel}` : undefined}
              className={cn(
                "group relative flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-brand-subtle font-semibold text-brand"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span className="truncate">{label}</span>
              {showBadge && (
                <span
                  className={cn(
                    "ml-auto rounded-full px-1.5 py-0.5 text-[0.625rem] font-bold tnum",
                    active ? "bg-brand text-white" : TONES[tone!],
                  )}
                >
                  {badge}
                </span>
              )}
            </Link>
          )
        })}
      </div>

      <div className="my-3 border-t border-border" />

      <div className="flex flex-col gap-1">
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-300 hover:bg-accent hover:text-foreground"
        >
          <ExternalLink className="size-4" />
          View storefront
        </Link>

        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-300 hover:bg-destructive/5 hover:text-destructive"
          >
            <LogOut className="size-4" />
            Sign out
          </button>
        </form>
      </div>
    </nav>
  )
}
