import type { ComponentType, ReactNode } from "react"
import { cn } from "@/lib/utils"

/** A page with nothing in it should still look designed, not broken. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: ComponentType<{ className?: string }>
  title: string
  description?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center",
        className,
      )}
    >
      <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-brand-subtle text-brand">
        <Icon className="size-5" />
      </span>
      <p className="mt-4 text-sm font-semibold">{title}</p>
      {description && (
        <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  )
}
