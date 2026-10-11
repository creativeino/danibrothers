"use client"

import Image from "next/image"
import { useState } from "react"
import { cn } from "@/lib/utils"

/**
 * Product image with a designed fallback.
 *
 * Photos are uploaded by the shop from the admin panel, and a product may have
 * none yet — a missing, broken or still-empty image would otherwise leave a
 * broken-image icon in the middle of the grid. Falling back to a typographic
 * tile keyed off the product name keeps the card looking deliberate rather
 * than broken.
 *
 * Must be a Client Component because of the error handler.
 */
export function ProductThumb({
  src,
  alt,
  sizes,
  className,
  priority = false,
  fit = "cover",
}: {
  src: string | null
  alt: string
  sizes: string
  className?: string
  priority?: boolean
  fit?: "cover" | "contain"
}) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return <ThumbPlaceholder alt={alt} />
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      onError={() => setFailed(true)}
      className={cn(fit === "contain" ? "object-contain" : "object-cover", className)}
    />
  )
}

/** Deterministic from the name, so a product always gets the same tile. */
function ThumbPlaceholder({ alt }: { alt: string }) {
  const initials = alt
    .split(/\s+/)
    .filter((word) => /[a-z0-9]/i.test(word))
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("")

  return (
    <span
      role="img"
      aria-label={alt ? `${alt} — photo coming soon` : "Photo coming soon"}
      className="absolute inset-0 grid place-items-center bg-gradient-to-br from-muted to-muted/40"
    >
      <span
        aria-hidden
        className="text-lg font-semibold tracking-tight text-muted-foreground/45 select-none"
      >
        {initials || "DB"}
      </span>
    </span>
  )
}
