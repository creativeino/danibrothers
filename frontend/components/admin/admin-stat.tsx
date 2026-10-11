"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { CountUp } from "@/components/motion/count-up"
import { formatPriceCompact } from "@/lib/format"
import { cn } from "@/lib/utils"

type Tone = "brand" | "success" | "warning" | "violet"

const TONES: Record<Tone, string> = {
  brand: "bg-brand-subtle text-brand",
  success: "bg-success-subtle text-success",
  warning: "bg-warning-subtle text-warning",
  violet: "bg-chart-4/10 text-chart-4",
}

/**
 * A dashboard number: label, value, one line of context. The tone only tints
 * the icon chip — no glows, bars or lifts, so four of these in a row read as
 * one row of data rather than four competing widgets.
 *
 * The money/plain choice is a prop rather than a callback because props
 * crossing the server → client boundary are serialised; functions can't.
 */
export function StatCard({
  icon,
  label,
  value,
  hint,
  href,
  tone = "brand",
  format = "plain",
}: {
  icon: ReactNode
  label: string
  value: number
  hint?: string
  href?: string
  tone?: Tone
  format?: "plain" | "currency"
}) {
  const formatValue = format === "currency" ? formatPriceCompact : undefined

  const body = (
    <>
      <div className="flex items-center gap-3">
        <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl", TONES[tone])}>
          <span className="[&_svg]:size-4.5">{icon}</span>
        </span>
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {label}
        </p>
      </div>

      <p className="mt-4 text-3xl font-bold tracking-tight tnum">
        <CountUp value={value} format={formatValue} />
      </p>
      {hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
    </>
  )

  if (href) {
    return (
      <Link
        href={href}
        className="block h-full rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-colors hover:border-brand/30"
      >
        {body}
      </Link>
    )
  }

  return (
    <div className="h-full rounded-2xl border border-border/60 bg-card p-5 shadow-sm">{body}</div>
  )
}
