import Link from "next/link"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

/**
 * The segmented pill row used for status / open-vs-handled filtering.
 * Shared by orders and inquiries, which used to carry near-identical copies.
 */
export function FilterTabs({
  children,
  className,
  bare = false,
}: {
  children: ReactNode
  className?: string
  /** `true` when the tabs already sit inside a toolbar card. */
  bare?: boolean
}) {
  return (
    <div
      className={cn(
        "flex w-fit flex-wrap items-center gap-1.5 rounded-xl p-1.5",
        !bare && "border border-border/60 bg-card shadow-sm",
        className,
      )}
    >
      {children}
    </div>
  )
}

export function FilterTab({
  href,
  active,
  count,
  children,
}: {
  href: string
  active: boolean
  count?: number
  children: ReactNode
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-brand/30 bg-brand text-white"
          : "border-transparent text-muted-foreground hover:border-border hover:bg-accent hover:text-foreground",
      )}
    >
      {children}
      {count != null && (
        <span
          className={cn(
            "rounded px-1 text-[0.625rem] font-semibold tnum",
            active ? "bg-white/20" : "bg-muted text-muted-foreground",
          )}
        >
          {count}
        </span>
      )}
    </Link>
  )
}
