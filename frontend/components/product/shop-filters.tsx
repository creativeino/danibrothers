"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useTransition, useState, type ReactNode } from "react"
import { motion, AnimatePresence } from "motion/react"
import { SlidersHorizontal, ChevronDown } from "lucide-react"
import { CONDITIONS, CONDITION_LABEL } from "@/lib/site"
import { cn } from "@/lib/utils"

export type ShopFacets = {
  categories: { name: string; slug: string; productCount: number }[]
  brands: string[]
  priceBounds: { min: number; max: number }
}

export function ShopFilters({ facets }: { facets: ShopFacets }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const current = {
    category: searchParams.get("category") ?? "",
    brands: searchParams.getAll("brand"),
    conditions: searchParams.getAll("condition"),
    min: searchParams.get("min") ?? "",
    max: searchParams.get("max") ?? "",
  }

  const activeCount =
    (current.category ? 1 : 0) +
    current.brands.length +
    current.conditions.length +
    (current.min || current.max ? 1 : 0)

  const push = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString())
      mutate(params)
      params.delete("page")
      startTransition(() => {
        router.push(params.toString() ? `/shop?${params}` : "/shop", { scroll: false })
      })
    },
    [router, searchParams],
  )

  function toggleMulti(key: "brand" | "condition", value: string) {
    push((params) => {
      const existing = params.getAll(key)
      params.delete(key)
      const next = existing.includes(value)
        ? existing.filter((v) => v !== value)
        : [...existing, value]
      next.forEach((v) => params.append(key, v))
    })
  }

  function setSingle(key: string, value: string) {
    push((params) => {
      if (value) params.set(key, value)
      else params.delete(key)
    })
  }

  return (
    <div className={cn("flex flex-col gap-1", isPending && "opacity-50 pointer-events-none transition-opacity")}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="size-4 text-muted-foreground" />
          <span className="text-sm font-semibold">Filters</span>
          {activeCount > 0 && (
            <span className="grid size-5 place-items-center rounded-full bg-brand text-[0.6rem] font-bold text-white tnum">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={() => startTransition(() => router.push("/shop", { scroll: false }))}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Category */}
      <FilterSection title="Category">
        <div className="flex flex-col gap-0.5">
          <RadioRow
            label="All Categories"
            checked={!current.category}
            onChange={() => setSingle("category", "")}
          />
          {facets.categories.map((cat) => (
            <RadioRow
              key={cat.slug}
              label={cat.name}
              count={cat.productCount}
              checked={current.category === cat.slug}
              onChange={() => setSingle("category", cat.slug)}
            />
          ))}
        </div>
      </FilterSection>

      {/* Condition */}
      <FilterSection title="Condition">
        <div className="flex flex-col gap-0.5">
          {CONDITIONS.map((condition) => (
            <CheckRow
              key={condition}
              label={CONDITION_LABEL[condition]}
              checked={current.conditions.includes(condition)}
              onChange={() => toggleMulti("condition", condition)}
            />
          ))}
        </div>
      </FilterSection>

      {/* Brand */}
      <FilterSection title="Brand">
        <div className="flex max-h-48 flex-col gap-0.5 overflow-y-auto">
          {facets.brands.map((brand) => (
            <CheckRow
              key={brand}
              label={brand}
              checked={current.brands.includes(brand)}
              onChange={() => toggleMulti("brand", brand)}
            />
          ))}
        </div>
      </FilterSection>

      {/* Price */}
      <FilterSection title="Price (Rs)">
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            placeholder="Min"
            defaultValue={current.min}
            aria-label="Minimum price"
            onBlur={(e) => setSingle("min", e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
            className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none tnum transition-all duration-300 focus:border-brand focus:ring-3 focus:ring-brand/15 hover:border-brand/40"
          />
          <span className="text-muted-foreground">–</span>
          <input
            type="number"
            inputMode="numeric"
            placeholder="Max"
            defaultValue={current.max}
            aria-label="Maximum price"
            onBlur={(e) => setSingle("max", e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
            className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none tnum transition-all duration-300 focus:border-brand focus:ring-3 focus:ring-brand/15 hover:border-brand/40"
          />
        </div>
      </FilterSection>
    </div>
  )
}

/* ── Collapsible section ────────────────────────────────────── */

function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string
  children: ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-border py-3 last:border-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-sm font-medium hover:text-brand transition-colors"
      >
        {title}
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="size-4 text-muted-foreground" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── Radio row ──────────────────────────────────────────────── */

function RadioRow({
  label,
  count,
  checked,
  onChange,
}: {
  label: string
  count?: number
  checked: boolean
  onChange: () => void
}) {
  return (
    <label
      onClick={onChange}
      className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent"
    >
      <span
        className={cn(
          "flex size-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
          checked ? "border-brand" : "border-muted-foreground/40",
        )}
      >
        {checked && <span className="size-2 rounded-full bg-brand" />}
      </span>
      <span className={cn("flex-1", checked && "font-medium")}>{label}</span>
      {count != null && (
        <span className="text-xs text-muted-foreground tnum">{count}</span>
      )}
    </label>
  )
}

/* ── Checkbox row ───────────────────────────────────────────── */

function CheckRow({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <label
      onClick={onChange}
      className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent"
    >
      <span
        className={cn(
          "flex size-4 shrink-0 items-center justify-center rounded border-2 transition-colors",
          checked ? "border-brand bg-brand" : "border-muted-foreground/40",
        )}
      >
        {checked && (
          <svg className="size-3 text-white" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span className={cn("flex-1", checked && "font-medium")}>{label}</span>
    </label>
  )
}
