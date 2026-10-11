"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useTransition } from "react"
import { SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ShopFilters, type ShopFacets } from "@/components/product/shop-filters"
// Not `@/lib/products` — that stays server-only, and this is a Client Component.
// See lib/sort-options.ts.
import { SORT_OPTIONS, type SortKey } from "@/lib/sort-options"

export function ShopToolbar({
  total,
  sort,
  facets,
  page,
  pageCount,
}: {
  total: number
  sort: SortKey
  facets: ShopFacets
  page?: number
  pageCount?: number
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // Base UI resolves the trigger's label from this map rather than from the
  // popup's children, which stay unmounted until the select is opened.
  const sortItems = Object.fromEntries(SORT_OPTIONS.map((o) => [o.value, o.label]))

  function changeSort(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "newest") params.delete("sort")
    else params.set("sort", value)
    params.delete("page")
    startTransition(() => {
      router.push(params.toString() ? `/shop?${params}` : "/shop", { scroll: false })
    })
  }

  return (
    <div
      className={`flex items-center justify-between gap-3 border-b border-border pb-4 transition-opacity duration-300 ${
        isPending ? "opacity-60" : "opacity-100"
      }`}
    >
      <div className="flex items-center gap-2">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          <span className="font-semibold text-foreground tnum">{total}</span>{" "}
          {total === 1 ? "product" : "products"}
        </p>
        {pageCount && pageCount > 1 && (
          <span className="text-[0.7rem] text-muted-foreground font-semibold bg-muted/70 px-2.5 py-0.5 rounded-full border border-border/50">
            Page {page ?? 1} of {pageCount}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Sheet>
          <SheetTrigger
            render={
              <Button
                variant="outline"
                size="sm"
                className="lg:hidden transition-all duration-300 hover:border-brand/30 hover:bg-brand/5 hover:text-brand"
              />
            }
          >
            <SlidersHorizontal />
            Filters
          </SheetTrigger>
          <SheetContent side="left" className="w-[18rem] overflow-y-auto p-0">
            <SheetHeader className="p-5 pb-0">
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="p-5">
              <ShopFilters facets={facets} />
            </div>
          </SheetContent>
        </Sheet>

        <Select
          items={sortItems}
          value={sort}
          onValueChange={(value) => changeSort(String(value))}
        >
          <SelectTrigger
            size="sm"
            className="h-8 min-w-[11rem] transition-all duration-300 hover:border-brand/40 focus:ring-3 focus:ring-brand/15"
            aria-label="Sort products"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end" alignItemWithTrigger={false}>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isPending && <span className="sr-only">Updating results</span>}
    </div>
  )
}
