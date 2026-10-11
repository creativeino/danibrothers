import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  Banknote,
  ChevronRight,
  MessageCircle,
  RefreshCw,
  Shield,
  Star,
  Truck,
  Wrench,
  Zap,
  Check,
} from "lucide-react"
import { ProductGallery } from "@/components/product/gallery"
import { BuyBox } from "@/components/product/buy-box"
import { DispatchTimer } from "@/components/product/dispatch-timer"
import { ConditionBadge } from "@/components/product/condition-badge"
import { ProductGrid } from "@/components/product/product-card"
import { CompareSection } from "@/components/product/compare-section"
import { ReviewSection } from "@/components/product/review-section"
import { TrackView } from "@/components/product/track-view"
import { ShareButton } from "@/components/product/share-button"
import { Section, SectionHeading } from "@/components/site/section"
import { Reveal } from "@/components/motion/reveal"
import { getProductBySlug, getRelatedProducts, stockState } from "@/lib/products"
import { CONDITION_DESCRIPTION, SHIPPING_FLAT, site, whatsappLink, type Condition } from "@/lib/site"
import { discountPercent, formatPrice } from "@/lib/format"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return { title: "Product not found" }

  return {
    title: product.name,
    description: product.description.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.description.slice(0, 160),
      images: product.primaryImage ? [{ url: product.primaryImage }] : undefined,
    },
  }
}

const ASSURANCES = [
  { icon: Truck, title: "Karachi delivery", body: "Rs. 500 flat courier fee", color: "text-brand", bg: "bg-brand-subtle" },
  { icon: Banknote, title: "Cash on delivery", body: "Pay when it arrives", color: "text-success", bg: "bg-success-subtle" },
  { icon: Shield, title: "Written warranty", body: "Printed on your invoice", color: "text-warning", bg: "bg-warning-subtle" },
  { icon: Wrench, title: "Bench-tested", body: "Full health report included", color: "text-brand", bg: "bg-brand-subtle" },
]

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()

  const related = await getRelatedProducts(product, 4)
  const stock = stockState(product.stock)
  const discount = product.compareAtPrice
    ? discountPercent(product.price, product.compareAtPrice)
    : 0
  const conditionKey = (
    product.condition in CONDITION_DESCRIPTION ? product.condition : "NEW"
  ) as Condition

  return (
    <>
      <TrackView product={product} />

      {/* Breadcrumb */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <nav
          aria-label="Breadcrumb"
          className="container-page flex items-center gap-1.5 py-3.5 text-xs text-muted-foreground"
        >
          <Link href="/" className="transition-colors hover:text-foreground">Home</Link>
          <ChevronRight className="size-3.5" aria-hidden />
          <Link href="/shop" className="transition-colors hover:text-foreground">Shop</Link>
          {product.category && (
            <>
              <ChevronRight className="size-3.5" aria-hidden />
              <Link href={`/shop?category=${product.category.slug}`} className="transition-colors hover:text-foreground">
                {product.category.name}
              </Link>
            </>
          )}
          <ChevronRight className="size-3.5" aria-hidden />
          <span className="truncate text-foreground font-medium">{product.name}</span>
        </nav>
      </div>

      {/* Product main section */}
      <div className="container-page grid gap-10 py-8 lg:grid-cols-2 lg:gap-14 lg:py-12">
        <Reveal y={16}>
          <ProductGallery images={product.images} alt={product.name} />
        </Reveal>

        <Reveal y={16} delay={0.08} className="flex flex-col">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2.5">
            <ConditionBadge condition={product.condition} className="px-2.5 py-1" />
            <Link
              href={`/shop?brand=${encodeURIComponent(product.brand)}`}
              className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase transition-all hover:bg-foreground/5 hover:text-foreground"
            >
              {product.brand}
            </Link>
            {discount > 0 && (
              <span className="inline-flex items-center rounded-full bg-gradient-to-r from-red-500 to-orange-500 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
                SAVE {discount}%
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-balance sm:text-3xl">
            {product.name}
          </h1>

          {/* Quick trust row */}
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {[
              { icon: Check, text: "Tested", color: "text-success" },
              { icon: Shield, text: "Warranty", color: "text-warning" },
              { icon: Truck, text: "Karachi delivery (Rs. 500)", color: "text-brand" },
            ].map(({ icon: Icon, text, color }) => (
              <span key={text} className="flex items-center gap-1 text-xs font-medium text-muted-foreground/70">
                <Icon className={`size-3 ${color}`} />
                {text}
              </span>
            ))}
          </div>

          {/* Price */}
          <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-3xl font-bold tracking-tight tnum text-foreground">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <>
                <span className="text-base text-muted-foreground/50 line-through tnum">
                  {formatPrice(product.compareAtPrice)}
                </span>
                <span className="rounded-lg bg-success-subtle px-2.5 py-0.5 text-xs font-bold text-success tnum">
                  You save {formatPrice(product.compareAtPrice - product.price)}
                </span>
              </>
            )}
          </div>

          {/* Stock */}
          <div className={cn(
            "mt-3 inline-flex items-center gap-2 self-start rounded-full px-3 py-1.5 text-xs font-semibold",
            stock.tone === "success" && "bg-success-subtle text-success",
            stock.tone === "warning" && "bg-warning-subtle text-warning",
            stock.tone === "destructive" && "bg-destructive-subtle text-destructive",
          )}>
            <span className={cn(
              "size-1.5 rounded-full",
              stock.tone === "success" && "bg-success",
              stock.tone === "warning" && "bg-warning animate-pulse",
              stock.tone === "destructive" && "bg-destructive",
            )} />
            {stock.label}
            {stock.tone === "warning" && (
              <span className="opacity-80">— order soon!</span>
            )}
          </div>

          {/* Description */}
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground/80">
            {product.description}
          </p>

          <DispatchTimer />

          {/* Divider */}
          <div className="my-6 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

          <BuyBox product={product} />

          {/* Assurances */}
          <div className="mt-7 grid grid-cols-2 gap-2.5">
            {ASSURANCES.map(({ icon: Icon, title, body, color, bg }) => (
              <div
                key={title}
                className="group flex items-start gap-3 rounded-xl border border-border/50 bg-card p-3.5 transition-all duration-300 hover:border-border hover:shadow-sm"
              >
                <span className={cn("grid size-8 shrink-0 place-items-center rounded-lg transition-all duration-300 group-hover:scale-110", bg, color)}>
                  <Icon className="size-4" strokeWidth={2} />
                </span>
                <div>
                  <p className="text-[0.7rem] font-bold text-foreground leading-tight">{title}</p>
                  <p className="mt-0.5 text-[0.65rem] text-muted-foreground/60 leading-tight">{body}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Share + WhatsApp */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <a
              href={whatsappLink(`Hi ${site.name}, I'm interested in the ${product.name}.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-2.5 text-xs font-semibold text-emerald-600 transition-all duration-300 hover:bg-emerald-500/10 hover:border-emerald-500/30"
            >
              <MessageCircle className="size-3.5" />
              Ask on WhatsApp
            </a>
            <ShareButton
              title={product.name}
              text={`${product.name} at ${site.name} — ${formatPrice(product.price)}`}
              url={`${site.url}/product/${product.slug}`}
            />
          </div>

          <p className="mt-4 text-[0.65rem] text-muted-foreground/50">
            Delivery charges calculated and confirmed upon order. 15-day return window on unused
            items.
          </p>
        </Reveal>
      </div>

      {/* Specs + Info section */}
      <Section className="pt-4">
        <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr] lg:gap-14">
          <div>
            {/* Condition info */}
            <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6">
              <div className="absolute -top-12 -right-12 h-24 w-24 rounded-full bg-brand/5 blur-3xl" />
              <div className="relative">
                <div className="flex items-center gap-2.5">
                  <span className="grid size-8 place-items-center rounded-lg bg-brand/10 text-brand">
                    <Star className="size-4" />
                  </span>
                  <h2 className="text-base font-bold tracking-tight">What you should know</h2>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground/80">
                  {CONDITION_DESCRIPTION[conditionKey]}
                </p>
              </div>
            </div>

            {/* Specs */}
            {product.specs.length > 0 && (
              <div className="mt-8">
                <div className="flex items-center gap-2.5 mb-4">
                  <h2 className="text-base font-bold tracking-tight">Full specifications</h2>
                </div>
                <dl className="overflow-hidden rounded-2xl border border-border/50">
                  {product.specs.map((spec, i) => (
                    <div
                      key={spec.label}
                      className={cn(
                        "grid grid-cols-[minmax(0,10rem)_1fr] gap-4 px-5 py-3.5 text-sm",
                        i % 2 === 0 ? "bg-card" : "bg-muted/20",
                      )}
                    >
                      <dt className="text-muted-foreground/60 font-medium">{spec.label}</dt>
                      <dd className="font-semibold text-foreground">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 lg:self-start space-y-5">
            {/* Trade-in card */}
            <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6">
              <div className="absolute -top-16 -right-16 h-32 w-32 rounded-full bg-amber-500/5 blur-3xl" />
              <div className="relative">
                <div className="flex items-center gap-2.5">
                  <span className="grid size-8 place-items-center rounded-lg bg-amber-500/10 text-amber-500">
                    <RefreshCw className="size-4" />
                  </span>
                  <h2 className="text-sm font-bold">Buying used?</h2>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground/80">
                  Ask for the bench-test report before you pay. We photograph storage health,
                  battery cycles and screen for every pre-owned unit.
                </p>
                <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground/80">
                  <Zap className="mt-0.5 size-3.5 shrink-0 text-amber-500" />
                  Trading in? We buy laptops, desktops and components — working or not.
                </p>
                <Link
                  href="/contact#sell"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-amber-500/10 px-4 py-2.5 text-xs font-bold text-amber-600 transition-all duration-300 hover:bg-amber-500/20"
                >
                  Get a valuation →
                </Link>
              </div>
            </div>

            {/* WhatsApp card */}
            <a
              href={whatsappLink(`Hi ${site.name}, I have a question about the ${product.name}.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.03] p-5 transition-all duration-500 hover:border-emerald-500/30 hover:bg-emerald-500/[0.06] hover:shadow-lg hover:shadow-emerald-500/10"
            >
              <span className="grid size-11 place-items-center rounded-xl bg-emerald-500/10 text-emerald-500 transition-all duration-500 group-hover:scale-110 group-hover:bg-emerald-500/20">
                <MessageCircle className="size-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-foreground">Questions?</p>
                <p className="text-xs text-muted-foreground/60">Chat with us on WhatsApp</p>
              </div>
            </a>
          </aside>
        </div>
      </Section>

      {/* Reviews */}
      <Section className="pt-4">
        <ReviewSection productId={product.id} />
      </Section>

      {/* Compare section */}
      {related.length > 0 && (
        <Section className="pt-4">
          <CompareSection product={product} related={related} />
        </Section>
      )}

      {/* Related products */}
      {related.length > 0 && (
        <Section className="pt-0">
          <SectionHeading
            eyebrow="You might also like"
            title={product.category ? `More in ${product.category.name}` : "Related products"}
            action={{ href: "/shop", label: "Browse all" }}
          />
          <Reveal>
            <ProductGrid products={related} />
          </Reveal>
        </Section>
      )}
    </>
  )
}
