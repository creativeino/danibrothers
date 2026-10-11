import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRight,
  MessageCircle,
  Scale,
  Sparkles,
  Wrench,
  Banknote,
  HeartHandshake,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Section, SectionHeading } from "@/components/site/section"
import { PageHero } from "@/components/site/page-hero"
import { Stats } from "@/components/home/stats"
import { TrustStrip } from "@/components/home/trust-strip"
import { SellDeviceCTA } from "@/components/home/sell-device-cta"
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal"
import { site, whatsappLink } from "@/lib/site"

export const metadata: Metadata = {
  title: "About us",
  description: `Dani Brothers has been buying, selling and repairing computers from Gulshan-e-Maymar, Karachi since ${site.since}.`,
}

const TIMELINE = [
  {
    year: "2009",
    title: "One counter, second-hand stock",
    body: "We started buying and reselling used laptops from a single counter. Word of mouth did the rest.",
  },
  {
    year: "2014",
    title: "Refurbishing in-house",
    body: "We brought servicing in-house — new batteries, thermal paste, storage upgrades — so a refurbished machine left the shop genuinely ready to use.",
  },
  {
    year: "2019",
    title: "Corporate supply",
    body: "Offices started buying from us in batches. We now supply and maintain fleets for a number of small firms across Karachi.",
  },
  {
    year: "Today",
    title: "Same street, trusted service",
    body: "Still at the same address, delivering safely across Karachi with cash on delivery and bank transfer.",
  },
]

const PROMISES = [
  {
    icon: Scale,
    title: "Honest grading",
    body: "If a machine has a scuff, a tired battery or a replaced keyboard, you hear about it before you pay — not after.",
    color: "text-brand",
    bg: "bg-brand-subtle",
  },
  {
    icon: Banknote,
    title: "We buy too",
    body: "Upgrading? We take trade-ins and buy outright, working or faulty. Bring it in for a same-day valuation.",
    color: "text-success",
    bg: "bg-success-subtle",
  },
  {
    icon: Wrench,
    title: "Repairs that last",
    body: "Our bench handles screen replacements, storage upgrades, thermal service and board-level work on most consumer machines.",
    color: "text-warning",
    bg: "bg-warning-subtle",
  },
  {
    icon: HeartHandshake,
    title: "No pressure",
    body: "Come in, use the machine, ask questions. We would rather sell you the right laptop than the fastest one.",
    color: "text-brand",
    bg: "bg-brand-subtle",
  },
]

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow={`Since ${site.since}`}
        title="A computer shop that answers the phone."
        description={`${site.name} has been buying, selling and repairing machines from ${site.address} for over a decade. No showroom gloss — just a counter, a bench, and a stock list we actually know.`}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "About us" }]}
      >
        <Button size="lg" className="h-11 px-5 text-sm" nativeButton={false} render={<Link href="/shop" />}>
          Browse the shop
          <ArrowRight />
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="h-11 px-5 text-sm"
          nativeButton={false}
          render={
            <a
              href={whatsappLink(`Hi ${site.name}, I have a question.`)}
              target="_blank"
              rel="noopener noreferrer"
            />
          }
        >
          <MessageCircle />
          Talk to us
        </Button>
      </PageHero>

      <Section>
        <Reveal>
          <Stats />
        </Reveal>
      </Section>

      {/* Story + timeline */}
      <Section className="pt-0">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <div>
            <SectionHeading
              eyebrow="Our story"
              title="Built one used laptop at a time"
              className="mb-0"
            />
            <p className="mt-5 text-base leading-relaxed text-muted-foreground">
              Every machine we sell passes through the same bench that serviced it. That is the
              whole idea: we only sell what we would be comfortable using, because the person
              buying it is going to come back to us if something goes wrong — and we would like
              that to be a good conversation.
            </p>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Prices are quoted in rupees, including tax, and they are the same whether you walk
              in or order online. No haggling required, though we won&apos;t be offended if you
              try.
            </p>

            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/5 px-4 py-2 text-xs font-semibold text-brand">
              <Sparkles className="size-3.5" />
              Same bench, same standards since {site.since}
            </div>
          </div>

          <ol className="relative flex flex-col gap-0">
            {TIMELINE.map((entry, index) => (
              <Reveal key={entry.year} delay={index * 0.06}>
                <li className="relative flex gap-5 pb-8 last:pb-0">
                  {/* Rail */}
                  {index < TIMELINE.length - 1 && (
                    <span
                      aria-hidden
                      className="absolute top-7 left-[11px] h-full w-px bg-gradient-to-b from-brand/40 via-border to-transparent"
                    />
                  )}

                  <span
                    aria-hidden
                    className="relative z-10 mt-1 grid size-6 shrink-0 place-items-center rounded-full border-2 border-background bg-brand shadow-sm shadow-brand/25"
                  >
                    <span className="size-1.5 rounded-full bg-white" />
                  </span>

                  <div className="group flex-1 rounded-xl border border-border/60 bg-card p-4 transition-all duration-300 hover:border-brand/25 hover:shadow-sm hover:shadow-brand/5 sm:p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-eyebrow text-brand tnum">{entry.year}</span>
                      <span className="h-px flex-1 bg-border" />
                    </div>
                    <h3 className="mt-2 text-sm font-semibold sm:text-base">{entry.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {entry.body}
                    </p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </Section>

      {/* Promise cards */}
      <Section className="pt-0">
        <SectionHeading
          eyebrow="What we stand behind"
          title="The short version"
          description="Four things we will not compromise on, whatever the machine costs."
        />

        <Stagger className="grid gap-4 sm:grid-cols-2">
          {PROMISES.map((promise) => (
            <StaggerItem key={promise.title}>
              <div className="group relative h-full overflow-hidden rounded-2xl border border-border/60 bg-card p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/25 hover:shadow-lg hover:shadow-brand/5">
                <div
                  aria-hidden
                  className="absolute -top-16 -right-16 h-32 w-32 rounded-full bg-brand/5 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                />
                <div className="relative flex items-start gap-4">
                  <span
                    className={`grid size-11 shrink-0 place-items-center rounded-xl ${promise.bg} ${promise.color} transition-transform duration-300 group-hover:scale-110`}
                  >
                    <promise.icon className="size-5" strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold tracking-tight">{promise.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {promise.body}
                    </p>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </Section>

      {/* Trust strip */}
      <Section className="pt-0">
        <SectionHeading
          eyebrow="Why people come back"
          title="What you get with every order"
          description="Bench-tested stock, written warranty, and payment only when the machine is in your hands."
        />
        <TrustStrip />
      </Section>

      {/* Final CTA — same as homepage */}
      <Section className="pt-0">
        <Reveal>
          <SellDeviceCTA />
        </Reveal>
      </Section>
    </>
  )
}
