import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Hero } from "@/components/home/hero"
import { FlashDealSection } from "@/components/home/flash-deal-section"
import { CategoryGrid } from "@/components/home/category-grid"
import { TrustStrip } from "@/components/home/trust-strip"
import { Stats, BrandMarquee } from "@/components/home/stats"
import { SellDeviceCTA } from "@/components/home/sell-device-cta"
import { CctvSection } from "@/components/home/cctv-section"
import { Section, SectionHeading } from "@/components/site/section"
import { ProductGrid } from "@/components/product/product-card"
import { Reveal } from "@/components/motion/reveal"
import { FlashTimerBadge } from "@/components/site/flash-timer-badge"
import { getCategories, getProductsByCategorySlugs } from "@/lib/products"

// The catalogue comes from SQLite and changes whenever an admin edits a
// product, so this page is rendered per request rather than prerendered.
export const dynamic = "force-dynamic"

export default async function HomePage() {
  const [categories, deals, accessories, cctv] = await Promise.all([
    getCategories(),
    getProductsByCategorySlugs(["laptops", "desktop-pcs"], 8),
    getProductsByCategorySlugs(["accessories", "components", "audio", "storage"], 8),
    getProductsByCategorySlugs(["cctv"], 8),
  ])

  return (
    <>
      <Hero />

      <Section className="py-4 sm:py-6">
        <FlashDealSection dealProduct={deals[0] ?? null} />
      </Section>

      <Section id="categories">
        <SectionHeading
          eyebrow="Browse"
          title="Shop by category"
          description="Nine departments, one shop counter. If you don't see what you need, ask us — stock moves fast and not everything makes it online."
          action={{ href: "/shop", label: "View all products" }}
        />
        <CategoryGrid categories={categories} />
      </Section>

      <BrandMarquee />

      <Section>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <div className="mb-2 flex items-center gap-3">
              <p className="text-eyebrow text-brand">Hot right now</p>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-xs">
                <FlashTimerBadge compact />
              </div>
            </div>
            <h2 className="text-display-sm text-balance">Today&apos;s Deals</h2>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              Best value laptops and desktops, handpicked every week with verified check warranty.
            </p>
          </div>

          <Link
            href="/shop?category=laptops"
            className="group inline-flex shrink-0 items-center gap-1.5 rounded-full border border-brand/20 bg-brand/5 px-4 py-2 text-sm font-medium text-brand transition-all duration-300 hover:border-brand/40 hover:bg-brand/10 hover:shadow-sm hover:shadow-brand/10"
          >
            Browse all
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
        </div>
        <Reveal>
          <ProductGrid products={deals} priorityCount={4} />
        </Reveal>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="Complete your setup"
          title="Accessories"
          description="Keyboards, mice, audio gear and more to level up your workspace."
          action={{ href: "/shop?category=accessories", label: "View all accessories" }}
        />
        <Reveal>
          <ProductGrid products={accessories} priorityCount={4} />
        </Reveal>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="Stay protected"
          title="CCTV & Security"
          description="Cameras and NVRs for shops, homes and offices — installed or supplied."
          action={{ href: "/shop?category=cctv", label: "Shop CCTV" }}
        />
        <Reveal>
          <CctvSection products={cctv} />
        </Reveal>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="Why buy from us"
          title="A shop you can come back to"
          description="We have been on the same street since 2009. That only works if the machines are right and the pricing is honest."
        />
        <TrustStrip />
      </Section>

      <Section className="pt-0">
        <Stats />
      </Section>

      <Section className="pt-0">
        <Reveal>
          <SellDeviceCTA />
        </Reveal>
      </Section>
    </>
  )
}
