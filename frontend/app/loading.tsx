import { Skeleton } from "@/components/ui/skeleton"

/**
 * Route-level loading state. Mirrors the shop grid so the swap from skeleton to
 * content doesn't jump — the header block and the 4-up grid land in the same
 * place the real page puts them.
 */
export default function Loading() {
  return (
    <>
      <div className="border-b border-border bg-gradient-to-b from-brand-subtle/50 to-card">
        <div className="container-page py-8 md:py-10">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="mt-4 h-10 w-64" />
          <Skeleton className="mt-3 h-4 w-full max-w-xl" />
        </div>
      </div>

      <div className="container-page grid gap-8 py-8 lg:grid-cols-[16rem_1fr] lg:gap-10 lg:py-10">
        <div className="hidden flex-col gap-6 lg:flex">
          {[0, 1, 2].map((group) => (
            <div key={group} className="flex flex-col gap-2.5">
              <Skeleton className="h-3 w-20" />
              {[0, 1, 2, 3].map((row) => (
                <Skeleton key={row} className="h-6 w-full" />
              ))}
            </div>
          ))}
        </div>

        <div className="min-w-0">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-44" />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="flex flex-col gap-3">
                <Skeleton className="aspect-square w-full rounded-xl" />
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-5 w-24" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
