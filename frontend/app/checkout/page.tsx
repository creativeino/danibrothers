import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { CheckoutForm } from "@/components/checkout/checkout-form"
import { api } from "@/lib/api"
import type { ApiUser } from "@/lib/api-types"
import { getCurrentUser, sessionToken } from "@/lib/auth"
import { PageHero } from "@/components/site/page-hero"
import { Reveal } from "@/components/motion/reveal"
import { Shield, Truck, Clock } from "lucide-react"

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
}

export default async function CheckoutPage() {
  // proxy.ts already gates this route — the layout-level re-check keeps that
  // guarantee local to the page, the same way /admin and /account do.
  const user = await getCurrentUser()
  if (!user) redirect("/login?next=%2Fcheckout")

  const profile = await api
    .get<ApiUser>("/api/auth/me", await sessionToken())
    .catch(() => null)

  return (
    <>
      <PageHero
        compact
        eyebrow="Secure checkout"
        title="Checkout"
        description="Two minutes to place the order. We'll call you to confirm it and lock in the delivery window before anything ships."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Cart", href: "/cart" }, { label: "Checkout" }]}
      >
        <div className="flex flex-wrap gap-4">
          {[
            { icon: Shield, text: "Secure checkout", color: "text-success", bg: "bg-success-subtle" },
            { icon: Truck, text: "Karachi delivery (Rs. 500)", color: "text-brand", bg: "bg-brand-subtle" },
            { icon: Clock, text: "Same day confirm", color: "text-warning", bg: "bg-warning-subtle" },
          ].map(({ icon: Icon, text, color, bg }) => (
            <div key={text} className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <span className={`grid size-7 place-items-center rounded-lg ${bg} ${color}`}>
                <Icon className="size-3.5" />
              </span>
              {text}
            </div>
          ))}
        </div>
      </PageHero>

      <div className="container-page py-10 md:py-14">
      {/* Step indicator */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-full bg-brand text-xs font-bold text-white">1</span>
          <span className="text-xs font-semibold text-foreground">Delivery</span>
        </div>
        <div className="h-px flex-1 bg-border" />
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-full bg-muted text-xs font-bold text-muted-foreground">2</span>
          <span className="text-xs font-medium text-muted-foreground/60">Payment</span>
        </div>
        <div className="h-px flex-1 bg-border" />
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-full bg-muted text-xs font-bold text-muted-foreground">3</span>
          <span className="text-xs font-medium text-muted-foreground/60">Confirm</span>
        </div>
      </div>

      <Reveal className="mt-8">
        <CheckoutForm user={profile ?? null} />
      </Reveal>
      </div>
    </>
  )
}
