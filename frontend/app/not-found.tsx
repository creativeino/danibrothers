import Link from "next/link"
import { ArrowRight, Compass } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Section } from "@/components/site/section"

export default function NotFound() {
  return (
    <div className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-brand/10 blur-[100px]" />
      <Section className="relative flex min-h-[60vh] flex-col items-center justify-center text-center">
        <span className="grid size-14 place-items-center rounded-full bg-brand-subtle text-brand">
          <Compass className="size-6" />
        </span>
        <p className="text-eyebrow mt-6 text-brand">Error 404</p>
        <h1 className="text-display-sm mt-3 text-balance">This page has been sold</h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          Or it never existed, or the link is old. Either way, the machine you were looking for
          isn&apos;t on this shelf.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button nativeButton={false} render={<Link href="/shop" />}>
            Browse the shop
            <ArrowRight />
          </Button>
          <Button variant="outline" nativeButton={false} render={<Link href="/" />}>
            Back to the home page
          </Button>
        </div>
      </Section>
    </div>
  )
}
