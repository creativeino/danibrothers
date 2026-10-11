import { CONDITION_LABEL, type Condition } from "@/lib/site"
import { cn } from "@/lib/utils"

const TONE: Record<Condition, string> = {
  NEW: "bg-success-subtle text-success",
  REFURBISHED: "bg-brand-subtle text-brand",
  USED: "bg-muted text-muted-foreground",
}

/** Condition is the single most important fact on a mixed new/used listing. */
export function ConditionBadge({
  condition,
  className,
}: {
  condition: string
  className?: string
}) {
  const key = (condition in CONDITION_LABEL ? condition : "NEW") as Condition
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-1.5 py-0.5 text-[0.6875rem] font-semibold tracking-wide uppercase",
        TONE[key],
        className,
      )}
    >
      {CONDITION_LABEL[key]}
    </span>
  )
}
