"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Section } from "@/components/site/section"
import { site } from "@/lib/site"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Surfaces in the browser console and in the server logs; a real
    // deployment would forward this to an error tracker.
    console.error(error)
  }, [error])

  return (
    <div className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-destructive/10 blur-[100px]" />
      <Section className="relative flex min-h-[60vh] flex-col items-center justify-center text-center">
        <span className="grid size-14 place-items-center rounded-full bg-destructive-subtle text-destructive">
          <AlertTriangle className="size-6" />
        </span>
        <p className="text-eyebrow mt-6 text-destructive">Something broke</p>
        <h1 className="text-display-sm mt-3 text-balance">That wasn&apos;t supposed to happen</h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          The page failed to load. Trying again usually fixes it — if it doesn&apos;t, we&apos;re
          around on WhatsApp and we&apos;d rather hear about it than not.
        </p>

        {error.digest && (
          <p className="mt-4 rounded-md bg-muted px-2.5 py-1 font-mono text-xs text-muted-foreground">
            {error.digest}
          </p>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button onClick={reset}>
            <RefreshCw />
            Try again
          </Button>
          <Button variant="outline" nativeButton={false} render={<Link href="/" />}>
            Back to the home page
          </Button>
          <Button variant="ghost" nativeButton={false} render={<Link href="/contact" />}>
            Contact {site.name}
          </Button>
        </div>
      </Section>
    </div>
  )
}
