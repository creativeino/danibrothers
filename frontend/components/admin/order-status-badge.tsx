import { ORDER_STATUS_LABEL, type OrderStatus } from "@/lib/site"
import { cn } from "@/lib/utils"

const TONE: Record<OrderStatus, string> = {
  PENDING: "bg-warning-subtle text-warning",
  CONFIRMED: "bg-brand-subtle text-brand",
  SHIPPED: "bg-brand-subtle text-brand",
  DELIVERED: "bg-success-subtle text-success",
  CANCELLED: "bg-destructive-subtle text-destructive",
}

export function OrderStatusBadge({
  status,
  className,
}: {
  status: string
  className?: string
}) {
  const key = (status in ORDER_STATUS_LABEL ? status : "PENDING") as OrderStatus
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-1.5 py-0.5 text-[0.6875rem] font-semibold tracking-wide uppercase",
        TONE[key],
        className,
      )}
    >
      {ORDER_STATUS_LABEL[key]}
    </span>
  )
}
