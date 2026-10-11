const grouped = new Intl.NumberFormat("en-US")

/**
 * Prices are whole rupees — `Rs 249,999`. Intl's `en-PK` + `PKR` currency
 * style renders inconsistently across browsers ("₨", "PKR", "Rs"), so the
 * prefix is written explicitly to keep every price on the site identical.
 */
export function formatPrice(value: number): string {
  return `Rs ${grouped.format(Math.round(value))}`
}

/** Compact form for stat tiles and admin tables: Rs 1.2M, Rs 850K. */
export function formatPriceCompact(value: number): string {
  if (value >= 1_000_000) return `Rs ${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`
  if (value >= 1_000) return `Rs ${Math.round(value / 1_000)}K`
  return `Rs ${value}`
}

export function formatDate(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date)
}

export function formatDateTime(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export function discountPercent(price: number, compareAt: number): number {
  if (compareAt <= price) return 0
  return Math.round(((compareAt - price) / compareAt) * 100)
}

/** `DB-2026-0481` — sequential-looking, but unique per order. */
export function orderNumberFromId(id: string): string {
  const year = new Date().getFullYear()
  const suffix = id.replace(/[^a-z0-9]/gi, "").slice(-6).toUpperCase()
  return `DB-${year}-${suffix}`
}
