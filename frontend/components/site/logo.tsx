import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { site } from "@/lib/site"

/**
 * The shop's logo lockup from /public/logodanibro.svg (mark + wordmark).
 * Light mode renders the file as-is; dark mode applies brightness-0 + invert
 * so the whole lockup reads pure white on dark surfaces.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("flex items-center rounded-lg outline-none", className)}
      aria-label={`${site.name} — home`}
    >
      {/* viewBox is cropped to the artwork itself; width/height just carry the
          aspect ratio for next/image. */}
      <Image
        src="/logodanibro.svg"
        alt={`${site.name} logo`}
        width={1895}
        height={545}
        unoptimized
        className="h-12 w-auto shrink-0 dark:brightness-0 dark:invert"
      />
    </Link>
  )
}
