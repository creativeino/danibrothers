import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

/** Scroll container + card chrome, so every table sits in the same frame. */
export function TableWrap({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "overflow-x-auto rounded-2xl border border-border/60 bg-card shadow-sm",
        className,
      )}
    >
      {children}
    </div>
  )
}

export function Th({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <th
      className={cn(
        "px-4 py-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase",
        className,
      )}
    >
      {children}
    </th>
  )
}

/** Body-row recipe: hairline separators, brand-tinted hover, no layout shift. */
export const ROW_CLASS =
  "border-b border-border bg-card transition-colors last:border-0 hover:bg-brand-subtle/40"

export const CELL_CLASS = "px-4 py-3 align-middle"
