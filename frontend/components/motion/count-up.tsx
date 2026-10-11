"use client"

import { useEffect, useRef, useState } from "react"
import { useInView, useReducedMotion } from "motion/react"

/**
 * Counts from 0 to `value` once the element scrolls into view.
 *
 * Driven by rAF rather than a spring so the easing curve is explicit and the
 * final frame lands exactly on `value` — a spring can settle at 2399.8 and
 * render "2399" next to a label that says 2400.
 *
 * `setDisplay` only runs inside a rAF callback, never synchronously in the
 * effect body (react-hooks/set-state-in-effect).
 */
export function CountUp({
  value,
  duration = 1600,
  suffix = "",
  prefix = "",
  decimals = 0,
  format,
  className,
}: {
  value: number
  duration?: number
  suffix?: string
  prefix?: string
  decimals?: number
  /** Overrides the default locale formatting — e.g. `Rs 1.2M` for money. */
  format?: (n: number) => string
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: "-40px" })
  const reduceMotion = useReducedMotion()
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!inView) return

    if (reduceMotion) {
      const id = requestAnimationFrame(() => setDisplay(value))
      return () => cancelAnimationFrame(id)
    }

    let frame = 0
    const start = performance.now()

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration)
      // easeOutExpo — fast start, soft landing
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      setDisplay(value * eased)
      if (progress < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [inView, value, duration, reduceMotion])

  const formatted = format
    ? format(display)
    : display.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  )
}
