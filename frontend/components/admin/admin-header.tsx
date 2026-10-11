import type { ReactNode } from "react"
import { Reveal } from "@/components/motion/reveal"

/**
 * The band every admin page opens with: eyebrow, title, description and the
 * page's actions.
 *
 * It is deliberately *not* a card — the panels, tables and filters below it
 * already are, and a decorated header on top of that just stacked box on box.
 */
export function AdminHeader({
  eyebrow = "Admin",
  title,
  description,
  actions,
  meta,
}: {
  eyebrow?: string
  title: ReactNode
  description?: ReactNode
  /** Buttons, right-aligned and wrapping under the title on narrow screens. */
  actions?: ReactNode
  /** Small row under the description — badges, dates, counts. */
  meta?: ReactNode
}) {
  return (
    <Reveal y={12}>
      <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4 border-b border-border/60 pb-5">
        <div className="min-w-0">
          <p className="text-eyebrow text-brand">{eyebrow}</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
          {description && (
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
          {meta && <div className="mt-3">{meta}</div>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
      </header>
    </Reveal>
  )
}
