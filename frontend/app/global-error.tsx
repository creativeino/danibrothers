"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Section } from "@/components/site/section"
import { whatsappLink } from "@/lib/site"
import "./globals.css"

/**
 * Last-resort boundary for errors thrown in the root layout itself — the one
 * segment `app/error.tsx` does *not* wrap. Renders its own document, so it
 * imports the global styles and carries no theme provider (the provider lives
 * in the layout this replaces).
 */
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="en" data-scroll-behavior="smooth" className="antialiased">
      <body className="bg-background text-foreground flex min-h-full flex-col">
        <div className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-destructive/10 blur-[100px]"
          />
          <Section className="relative flex min-h-screen flex-col items-center justify-center text-center">
            <span className="bg-destructive-subtle text-destructive grid size-14 place-items-center rounded-full">
              <AlertTriangle className="size-7" />
            </span>
            <p className="text-eyebrow mt-6 text-destructive">Something broke</p>
            <h1 className="text-display-sm mt-3 text-balance">
              We lost our connection
            </h1>
            <p className="text-muted-foreground mt-3 max-w-md text-sm leading-relaxed">
              The site couldn&apos;t reach our servers. Trying again usually fixes it — if it
              doesn&apos;t, message us on WhatsApp and we&apos;d rather hear about it than not.
            </p>

            {error.digest && (
              <p className="text-muted-foreground bg-muted mt-4 rounded-md px-2.5 py-1 font-mono text-xs">
                {error.digest}
              </p>
            )}

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button onClick={retry}>
                <RefreshCw />
                Try again
              </Button>
              <Button variant="outline" nativeButton={false} render={<Link href="/" />}>
                Back to the home page
              </Button>
              <Button
                variant="ghost"
                nativeButton={false}
                render={
                  <a
                    href={whatsappLink("Hi Dani Brothers — the website isn't loading for me.")}
                    target="_blank"
                    rel="noreferrer"
                  />
                }
              >
                Message us
              </Button>
            </div>
          </Section>
        </div>
      </body>
    </html>
  )
}
