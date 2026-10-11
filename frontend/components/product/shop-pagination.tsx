import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export function ShopPagination({
  page,
  pageCount,
  total,
  perPage = 12,
  buildHref,
}: {
  page: number
  pageCount: number
  total?: number
  perPage?: number
  buildHref: (page: number) => string
}) {
  const fromItem = total && total > 0 ? (page - 1) * perPage + 1 : 1
  const toItem = total && total > 0 ? Math.min(page * perPage, total) : total ?? 0
  const pages = pageWindow(page, pageCount)

  return (
    <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-6 sm:flex-row">
      {/* Summary status text */}
      <p className="text-xs sm:text-sm text-muted-foreground">
        {total && total > 0 ? (
          <>
            Showing{" "}
            <span className="font-semibold text-foreground tnum">
              {fromItem}–{toItem}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-foreground tnum">
              {total}
            </span>{" "}
            products
          </>
        ) : (
          `Page ${page} of ${Math.max(1, pageCount)}`
        )}
      </p>

      {/* Controls */}
      {pageCount > 1 ? (
        <nav aria-label="Pagination" className="flex items-center gap-1.5">
          <Step
            label="Previous page"
            disabled={page <= 1}
            href={page > 1 ? buildHref(page - 1) : undefined}
          >
            <ChevronLeft className="size-4" />
            <span className="hidden sm:inline text-xs font-semibold pr-1">Prev</span>
          </Step>

          {pages.map((p, i) =>
            p === "…" ? (
              <span key={`gap-${i}`} className="px-1 text-sm text-muted-foreground/50 select-none">
                …
              </span>
            ) : (
              <Link
                key={p}
                href={buildHref(p)}
                scroll={false}
                aria-current={p === page ? "page" : undefined}
                className={cn(
                  "grid size-9 place-items-center rounded-xl border text-xs font-bold tnum transition-all",
                  p === page
                    ? "border-brand bg-brand text-white shadow-sm shadow-brand/20 scale-105"
                    : "border-border/80 bg-card text-foreground hover:border-brand/40 hover:bg-brand/5 hover:text-brand",
                )}
              >
                {p}
              </Link>
            ),
          )}

          <Step
            label="Next page"
            disabled={page >= pageCount}
            href={page < pageCount ? buildHref(page + 1) : undefined}
          >
            <span className="hidden sm:inline text-xs font-semibold pl-1">Next</span>
            <ChevronRight className="size-4" />
          </Step>
        </nav>
      ) : (
        <div className="text-xs text-muted-foreground font-medium bg-muted/60 px-3.5 py-1.5 rounded-full border border-border/50">
          All {total ?? ""} items loaded
        </div>
      )}
    </div>
  )
}

function Step({
  label,
  disabled,
  href,
  children,
}: {
  label: string
  disabled: boolean
  href?: string
  children: React.ReactNode
}) {
  const cls = cn(
    "inline-flex h-9 items-center justify-center rounded-xl border px-3 text-xs font-semibold text-muted-foreground transition-all",
    disabled
      ? "pointer-events-none border-border/40 opacity-40 bg-muted/20"
      : "border-border/80 bg-card hover:border-brand/40 hover:bg-brand/5 hover:text-brand cursor-pointer",
  )
  if (disabled || !href) {
    return (
      <span aria-disabled className={cls}>
        {children}
      </span>
    )
  }
  return (
    <Link href={href} aria-label={label} scroll={false} className={cls}>
      {children}
    </Link>
  )
}

/** 1 … 4 5 [6] 7 8 … 12 style windowing. */
function pageWindow(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const out: (number | "…")[] = [1]
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  if (start > 2) out.push("…")
  for (let p = start; p <= end; p++) out.push(p)
  if (end < total - 1) out.push("…")
  out.push(total)
  return out
}
