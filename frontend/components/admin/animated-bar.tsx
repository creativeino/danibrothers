"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

/**
 * A progress bar that grows from zero once it is on screen, instead of
 * rendering at full width and never appearing to move.
 *
 * The width is only set inside a rAF callback, never synchronously in the
 * effect body (react-hooks/set-state-in-effect).
 */
export function AnimatedBar({
  percent,
  className,
  duration = "duration-700",
}: {
  percent: number
  className?: string
  duration?: string
}) {
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const id = requestAnimationFrame(() => setWidth(percent))
    return () => cancelAnimationFrame(id)
  }, [percent])

  return (
    <div
      className={cn("h-full rounded-full transition-[width] ease-out", duration, className)}
      style={{ width: `${width}%` }}
    />
  )
}
