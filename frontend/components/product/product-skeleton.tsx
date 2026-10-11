import { Skeleton } from "@/components/ui/skeleton"

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
      {/* Image */}
      <div className="relative aspect-[4/3] bg-muted">
        <Skeleton className="absolute inset-0 rounded-none" />
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 md:p-5">
        {/* Brand */}
        <Skeleton className="h-2.5 w-16" />

        {/* Name */}
        <div className="mt-2 space-y-1.5">
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-3/4" />
        </div>

        {/* Price */}
        <div className="mt-4">
          <Skeleton className="h-5 w-24" />
        </div>

        {/* Stock + Buttons */}
        <div className="mt-3 flex items-center justify-between">
          <Skeleton className="h-5 w-16 rounded-full" />
          <div className="flex gap-1.5">
            <Skeleton className="size-7 rounded-md" />
            <Skeleton className="size-7 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:gap-x-5 sm:gap-y-7 md:grid-cols-3 md:gap-x-6 md:gap-y-8 xl:grid-cols-4 xl:gap-x-7 xl:gap-y-9">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}
