import { cn } from "@/lib/utils"

/**
 * Initials chip — customers in the orders table and leads in inquiries get a
 * face-ish anchor instead of a wall of plain text.
 *
 * Deterministic from the name, so the same person is always the same colour.
 */
const PALETTES = [
  "bg-brand-subtle text-brand",
  "bg-success-subtle text-success",
  "bg-warning-subtle text-warning",
  "bg-chart-4/10 text-chart-4",
  "bg-destructive-subtle text-destructive",
]

export function Initials({
  name,
  className,
  size = "md",
}: {
  name: string
  className?: string
  size?: "sm" | "md" | "lg"
}) {
  const initials =
    name
      .trim()
      .split(/\s+/)
      .filter((word) => /[a-z0-9]/i.test(word))
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase() ?? "")
      .join("") || "?"

  const hash = [...name].reduce((total, char) => total + char.charCodeAt(0), 0)

  return (
    <span
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center rounded-xl font-semibold select-none",
        PALETTES[hash % PALETTES.length],
        size === "sm" && "size-8 text-[0.6875rem]",
        size === "md" && "size-10 text-xs",
        size === "lg" && "size-12 text-sm",
        className,
      )}
    >
      {initials}
    </span>
  )
}
