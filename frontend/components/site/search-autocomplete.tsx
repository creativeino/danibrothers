"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatPrice } from "@/lib/format"

type SearchResult = {
  id: string
  slug: string
  name: string
  brand: string
  price: number
  condition: string
  primaryImage: string | null
}

export function SearchAutocomplete({ className }: { className?: string }) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const fetchResults = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([])
      setOpen(false)
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setResults(data.products ?? [])
      setOpen(true)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchResults(query), 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, fetchResults])

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [])

  function handleSelect() {
    setQuery("")
    setOpen(false)
    inputRef.current?.blur()
  }

  return (
    <div ref={wrapperRef} className={cn("relative items-center", className)}>
      <div
        className={cn(
          "relative flex items-center rounded-xl border transition-all duration-300",
          focused
            ? "border-brand/40 ring-3 ring-brand/10 bg-card shadow-sm"
            : "border-border bg-muted/40 hover:bg-muted/60",
        )}
      >
        <Search className="pointer-events-none ml-3 size-4 text-muted-foreground/60" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { setFocused(true); if (results.length > 0) setOpen(true) }}
          onBlur={() => setFocused(false)}
          placeholder="Search products…"
          aria-label="Search products"
          className="h-9 w-48 bg-transparent pl-2.5 pr-3 text-sm outline-none placeholder:text-muted-foreground xl:w-64"
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(""); setResults([]); setOpen(false) }}
            className="mr-2 grid size-5 place-items-center rounded-full text-muted-foreground hover:text-foreground"
          >
            <X className="size-3" />
          </button>
        )}
        {loading && (
          <Loader2 className="mr-2 size-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* Dropdown */}
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 z-50 mt-2 w-full min-w-[20rem] max-w-lg overflow-hidden rounded-xl border border-border/60 bg-popover shadow-[0_24px_48px_-16px_rgb(0,0,0,0.15)]">
          <div className="max-h-80 overflow-y-auto p-2">
            {results.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                onClick={handleSelect}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-accent"
              >
                <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {product.primaryImage ? (
                    <Image
                      src={product.primaryImage}
                      alt={product.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[0.6rem] font-bold tracking-[0.1em] text-brand/70 uppercase">
                    {product.brand}
                  </p>
                  <p className="truncate text-sm font-medium text-foreground">
                    {product.name}
                  </p>
                  <p className="text-xs font-semibold tnum text-foreground">
                    {formatPrice(product.price)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
          <div className="border-t border-border/50 px-4 py-2.5">
            <Link
              href={`/shop?q=${encodeURIComponent(query)}`}
              onClick={handleSelect}
              className="text-center text-xs font-semibold text-brand hover:text-foreground transition-colors"
            >
              View all results for &ldquo;{query}&rdquo; →
            </Link>
          </div>
        </div>
      )}

      {open && query.length >= 2 && results.length === 0 && !loading && (
        <div className="absolute top-full left-0 z-50 mt-2 w-full min-w-[20rem] max-w-lg rounded-xl border border-border/60 bg-popover p-6 text-center shadow-[0_24px_48px_-16px_rgb(0,0,0,0.15)]">
          <p className="text-sm text-muted-foreground">No products found for &ldquo;{query}&rdquo;</p>
          <Link
            href={`/shop?q=${encodeURIComponent(query)}`}
            onClick={handleSelect}
            className="mt-2 inline-block text-xs font-semibold text-brand hover:text-foreground transition-colors"
          >
            Search all products →
          </Link>
        </div>
      )}
    </div>
  )
}
