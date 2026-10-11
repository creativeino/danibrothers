import Link from "next/link"
import { ChevronRight } from "lucide-react"
import type { ReactNode } from "react"
import { Reveal } from "@/components/motion/reveal"
import { cn } from "@/lib/utils"

type Crumb = { label: string; href?: string }

/**
 * Elevated page header used across shop, about, contact and utility pages.
 *
 * The tinted gradient + glow orbs give every sub-page the same visual beat
 * without hand-rolling decorations per route; `children` slots CTAs below the
 * description.
 */
export function PageHero({
  eyebrow,
  title,
  description,
  breadcrumbs,
  children,
  className,
  compact = false,
}: {
  eyebrow?: string
  title: string
  description?: string
  breadcrumbs?: Crumb[]
  children?: ReactNode
  className?: string
  /** Tighter padding for utility pages like cart/wishlist. */
  compact?: boolean
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden border-b border-border bg-gradient-to-b from-brand-subtle/70 via-card to-card",
        className,
      )}
    >
      {/* Glow orbs */}
      <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-brand/10 blur-[100px]" />
      <div aria-hidden className="pointer-events-none absolute -bottom-32 -left-20 h-56 w-56 rounded-full bg-brand/5 blur-[90px]" />
      {/* Dot grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />

      <div className={cn("container-page relative", compact ? "py-8 md:py-10" : "py-12 md:py-16")}>
        <Reveal y={12}>
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
              {breadcrumbs.map((crumb, i) => (
                <span key={crumb.label} className="flex items-center gap-1.5">
                  {i > 0 && <ChevronRight className="size-3.5" aria-hidden />}
                  {crumb.href ? (
                    <Link href={crumb.href} className="transition-colors hover:text-foreground">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="font-medium text-foreground">{crumb.label}</span>
                  )}
                </span>
              ))}
            </nav>
          )}

          {eyebrow && <p className="text-eyebrow text-brand">{eyebrow}</p>}
          <h1 className={cn("mt-2 text-balance", compact ? "text-display-sm" : "text-display")}>{title}</h1>
          {description && (
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">{description}</p>
          )}
          {children && <div className="mt-7 flex flex-wrap gap-3">{children}</div>}
        </Reveal>
      </div>
    </div>
  )
}
