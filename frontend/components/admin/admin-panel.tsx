import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

/**
 * The one card recipe used across the admin area: rounded-2xl, hairline
 * border, soft shadow, an optional titled header bar. Pages used to hand-roll
 * two or three slightly different versions of this; keeping it in one place
 * is what makes the pages read as one interface.
 */
export function AdminPanel({
  title,
  description,
  action,
  children,
  className,
  bodyClassName,
  padded = true,
}: {
  title?: ReactNode
  description?: ReactNode
  action?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
  /** `false` when the body is a list that should run flush to the edges. */
  padded?: boolean
}) {
  const header =
    title || description || action ? (
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div className="min-w-0">
          {title && <h2 className="text-sm font-semibold">{title}</h2>}
          {description && (
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
      </header>
    ) : null

  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm",
        className,
      )}
    >
      {header}
      <div className={cn(padded && "p-5", bodyClassName)}>{children}</div>
    </section>
  )
}
