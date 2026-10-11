"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import type { ReactNode } from "react"
import { Mail, MapPin, Phone, Clock, ArrowUpRight, Truck, BadgeCheck, MessageCircle } from "lucide-react"
import { Logo } from "@/components/site/logo"
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from "@/components/site/social-icons"
import { site, whatsappLink } from "@/lib/site"

const shopLinks = [
  { href: "/shop?category=laptops", label: "Laptops" },
  { href: "/shop?category=desktop-pcs", label: "Desktops & PCs" },
  { href: "/shop?category=monitors", label: "Monitors" },
  { href: "/shop?category=components", label: "Components & Parts" },
  { href: "/shop?category=storage", label: "Storage & Drives" },
  { href: "/shop?category=cctv", label: "Security & CCTV" },
  { href: "/shop?category=accessories", label: "Accessories" },
]

const helpLinks = [
  { href: "/about", label: "About us" },
  { href: "/contact", label: "Contact" },
  { href: "/contact#sell", label: "Sell your device" },
  { href: "/account", label: "Track your order" },
  { href: "/shop?condition=REFURBISHED", label: "Refurbished stock" },
  { href: "/shop?condition=USED", label: "Pre-owned deals" },
]

function useInView() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = "1"
          el.style.transform = "translateY(0)"
          observer.unobserve(el)
        }
      },
      { threshold: 0.05 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return ref
}

function FadeIn({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            el.style.opacity = "1"
            el.style.transform = "translateY(0)"
          }, delay)
          observer.unobserve(el)
        }
      },
      { threshold: 0.05 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [delay])

  return (
    <div
      ref={ref}
      className={className}
      style={{ opacity: 0, transform: "translateY(16px)", transition: "opacity 0.6s cubic-bezier(0.22,1,0.36,1), transform 0.6s cubic-bezier(0.22,1,0.36,1)" }}
    >
      {children}
    </div>
  )
}

export function SiteFooter() {
  const footerRef = useInView()

  return (
    <footer ref={footerRef} className="mt-24 border-t border-border bg-card" style={{ opacity: 0, transform: "translateY(16px)", transition: "opacity 0.7s cubic-bezier(0.22,1,0.36,1), transform 0.7s cubic-bezier(0.22,1,0.36,1)" }}>
      {/* Trust strip */}
      <div className="border-b border-border/50">
        <div className="container-page flex flex-wrap items-center justify-center gap-x-8 gap-y-3 py-4">
          {[
            { icon: Truck, text: "Karachi delivery (Rs. 500)", color: "text-blue-500" },
            { icon: BadgeCheck, text: "Bench-tested units", color: "text-amber-500" },
            { icon: MessageCircle, text: "WhatsApp support", color: "text-green-500" },
          ].map(({ icon: Icon, text, color }) => (
            <span key={text} className="flex items-center gap-2 text-xs font-medium text-muted-foreground/70">
              <Icon className={`size-3.5 ${color}`} />
              {text}
            </span>
          ))}
        </div>
      </div>

      <div className="container-page py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-12">
          {/* Brand */}
          <FadeIn className="lg:col-span-4" delay={0}>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground/70">
              Buying and selling computers in Karachi since {site.since}. Every machine is
              inspected, tested and backed by a warranty before it leaves the shop.
            </p>

            <div className="mt-5 flex gap-2">
              {site.social.facebook && (
                <SocialLink href={site.social.facebook} label="Facebook">
                  <FacebookIcon className="size-4" />
                </SocialLink>
              )}
              {site.social.instagram && (
                <SocialLink href={site.social.instagram} label="Instagram">
                  <InstagramIcon className="size-4" />
                </SocialLink>
              )}
              <SocialLink href={whatsappLink()} label="WhatsApp">
                <WhatsAppIcon className="size-4" />
              </SocialLink>
            </div>

            <a
              href={whatsappLink("Hi Dani Brothers, I have a question.")}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/15 px-4 py-2.5 text-xs font-semibold text-emerald-600 transition-all duration-300 hover:bg-emerald-500/15 hover:shadow-sm"
            >
              <MessageCircle className="size-3.5" />
              Chat with us on WhatsApp
            </a>
          </FadeIn>

          {/* Shop */}
          <FadeIn className="lg:col-span-2" delay={100}>
            <h3 className="text-[0.65rem] font-bold tracking-[0.14em] uppercase text-muted-foreground/50">Shop</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-1 text-muted-foreground transition-colors duration-300 hover:text-foreground"
                  >
                    {link.label}
                    <ArrowUpRight className="size-3 opacity-0 -translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 text-brand" />
                  </Link>
                </li>
              ))}
            </ul>
          </FadeIn>

          {/* Help */}
          <FadeIn className="lg:col-span-2" delay={200}>
            <h3 className="text-[0.65rem] font-bold tracking-[0.14em] uppercase text-muted-foreground/50">Help</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {helpLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-1 text-muted-foreground transition-colors duration-300 hover:text-foreground"
                  >
                    {link.label}
                    <ArrowUpRight className="size-3 opacity-0 -translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 text-brand" />
                  </Link>
                </li>
              ))}
            </ul>
          </FadeIn>

          {/* Contact */}
          <FadeIn className="lg:col-span-4" delay={300}>
            <h3 className="text-[0.65rem] font-bold tracking-[0.14em] uppercase text-muted-foreground/50">Visit the shop</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground/60">
                  <MapPin className="size-3.5" />
                </span>
                <span className="text-muted-foreground leading-relaxed">{site.address}</span>
              </li>
              <li className="flex gap-3">
                <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground/60">
                  <Clock className="size-3.5" />
                </span>
                <span className="text-muted-foreground">{site.hours}</span>
              </li>
              <li className="flex gap-3">
                <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground/60">
                  <Phone className="size-3.5" />
                </span>
                <a href={site.phoneHref} className="text-muted-foreground transition-colors duration-300 hover:text-foreground">
                  {site.phone}
                </a>
              </li>
              <li className="flex gap-3">
                <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground/60">
                  <Mail className="size-3.5" />
                </span>
                <a href={`mailto:${site.email}`} className="text-muted-foreground transition-colors duration-300 hover:text-foreground">
                  {site.email}
                </a>
              </li>
            </ul>
          </FadeIn>
        </div>

        {/* Bottom */}
        <div className="mt-12 flex flex-col gap-3 border-t border-border/50 pt-6 text-xs text-muted-foreground/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Cash on delivery
            </span>
            <span className="text-border">·</span>
            <span>Bank transfer</span>
            <span className="text-border">·</span>
            <span>15-day returns on unused items</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string
  label: string
  children: ReactNode
}) {
  return (
    <a
      href={href}
      aria-label={label}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      className="grid size-9 place-items-center rounded-xl border border-border bg-muted/30 text-muted-foreground transition-all duration-300 hover:border-brand/20 hover:bg-brand/5 hover:text-brand hover:scale-110 hover:rotate-3"
    >
      {children}
    </a>
  )
}
