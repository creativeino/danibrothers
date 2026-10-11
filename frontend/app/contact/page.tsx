import type { Metadata } from "next"
import type { ComponentType } from "react"
import Link from "next/link"
import {
  ArrowUpRight,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Section, SectionHeading } from "@/components/site/section"
import { PageHero } from "@/components/site/page-hero"
import { InquiryForm } from "@/components/contact/inquiry-form"
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal"
import { site, whatsappLink } from "@/lib/site"

export const metadata: Metadata = {
  title: "Contact",
  description: `Visit ${site.name} at ${site.address}, call ${site.phone}, or send us a message — including valuations for your old laptop.`,
}

const MAP_QUERY = encodeURIComponent(site.address)
const MAP_LINK = `https://www.google.com/maps/search/?api=1&query=${MAP_QUERY}`

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Get in touch"
        title="Ask us anything — or bring it in."
        description="Stock questions, repairs, trade-ins, bulk orders for an office. The fastest route is WhatsApp; the most reliable is walking through the door."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
      >
        <Button
          size="lg"
          className="h-11 px-5 text-sm"
          nativeButton={false}
          render={
            <a
              href={whatsappLink(`Hi ${site.name}, I'd like to ask about…`)}
              target="_blank"
              rel="noopener noreferrer"
            />
          }
        >
          <MessageCircle />
          WhatsApp us
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="h-11 px-5 text-sm"
          nativeButton={false}
          render={<a href={site.phoneHref} />}
        >
          <Phone />
          {site.phone}
        </Button>
      </PageHero>

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-14">
          {/* Left — info + map */}
          <div className="flex flex-col gap-5">
            <Stagger className="grid gap-3 sm:grid-cols-2" gap={0.08}>
              {[
                {
                  icon: MapPin,
                  title: "Visit the shop",
                  body: site.address,
                  href: MAP_LINK,
                  external: true,
                },
                {
                  icon: Clock,
                  title: "Opening hours",
                  body: `${site.hours} · Closed Sundays`,
                },
                {
                  icon: Phone,
                  title: "Call or WhatsApp",
                  body: site.phone,
                  href: site.phoneHref,
                },
                {
                  icon: Mail,
                  title: "Email",
                  body: site.email,
                  href: `mailto:${site.email}`,
                },
              ].map((item) => (
                <StaggerItem key={item.title}>
                  <InfoCard {...item} />
                </StaggerItem>
              ))}
            </Stagger>

            <Reveal delay={0.1}>
              <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
                <iframe
                  title={`Map showing ${site.name}`}
                  src={`https://www.google.com/maps?q=${MAP_QUERY}&output=embed`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-72 w-full border-0 grayscale-[0.3] transition-all duration-500 group-hover:grayscale-0"
                />
                <a
                  href={MAP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/95 px-3.5 py-2 text-xs font-semibold shadow-sm backdrop-blur-sm transition-all hover:border-brand/30 hover:text-brand"
                >
                  <Navigation className="size-3.5" />
                  Open in Maps
                  <ArrowUpRight className="size-3" />
                </a>
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/40 px-4 py-3">
                <Navigation className="mt-0.5 size-4 shrink-0 text-brand" />
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Parking is tight on the main boulevard — the side street behind the centre
                  usually has space. We&apos;re on the first floor, second counter on the left.
                </p>
              </div>
            </Reveal>
          </div>

          {/* Right — form */}
          <div id="sell" className="scroll-mt-28">
            <Reveal y={14}>
              <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-sm sm:p-7">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -top-20 -right-16 h-48 w-48 rounded-full bg-brand/8 blur-[80px]"
                />

                <div className="relative">
                  <SectionHeading
                    eyebrow="Sell or ask"
                    title="Tell us what you have"
                    description="Selling an old machine, or need a recommendation? Send the details and we'll come back with a figure or an answer — usually the same day."
                    className="mb-6"
                  />
                  <InquiryForm />
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                Prefer to talk it through? Walk in with the machine and we&apos;ll value it on
                the spot. No appointment needed during {site.hours}. Read more{" "}
                <Link
                  href="/about"
                  className="font-medium text-brand underline-offset-4 hover:underline"
                >
                  about how we work
                </Link>
                .
              </p>
            </Reveal>
          </div>
        </div>
      </Section>
    </>
  )
}

function InfoCard({
  icon: Icon,
  title,
  body,
  href,
  external,
}: {
  icon: ComponentType<{ className?: string }>
  title: string
  body: string
  href?: string
  external?: boolean
}) {
  const content = (
    <>
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-subtle text-brand transition-transform duration-300 group-hover:scale-110">
        <Icon className="size-4.5" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {title}
        </p>
        <p className="mt-1 text-sm leading-snug font-medium text-foreground">
          {body}
        </p>
      </div>
      {href && (
        <ArrowUpRight className="ml-auto size-4 shrink-0 text-muted-foreground/40 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand" />
      )}
    </>
  )

  const className =
    "group flex items-start gap-3.5 rounded-2xl border border-border/60 bg-card p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/25 hover:shadow-md hover:shadow-brand/5"

  if (href) {
    return (
      <a
        href={href}
        className={className}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {content}
      </a>
    )
  }

  return <div className={className}>{content}</div>
}
