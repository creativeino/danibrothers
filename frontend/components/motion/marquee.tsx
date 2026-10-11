import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

/**
 * CSS-driven infinite marquee. The track renders its children twice and
 * translates by -50%, so the loop is seamless without measuring anything in JS.
 * The duplicate is `aria-hidden` to keep it out of the accessibility tree.
 *
 * Animation is defined in globals.css and disabled under
 * `prefers-reduced-motion: reduce`.
 */
export function Marquee({
  children,
  className,
  reverse = false,
}: {
  children: ReactNode
  className?: string
  reverse?: boolean
}) {
  return (
    <div
      className={cn(
        "group relative flex overflow-hidden",
        // Fade the edges so items don't pop in and out at the boundary.
        "[mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]",
        className,
      )}
    >
      <div
        className={cn(
          "flex w-max shrink-0 animate-marquee items-center group-hover:[animation-play-state:paused]",
          reverse && "[animation-direction:reverse]",
        )}
      >
        <div className="flex items-center">{children}</div>
        <div className="flex items-center" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  )
}
