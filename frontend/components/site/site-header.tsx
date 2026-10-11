"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "motion/react"
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  Menu,
  Search,
  ShoppingBag,
  User,
  Phone,
  Package,
  Heart,
  Camera,
  Cable,
  Cpu,
  HardDrive,
  Headphones,
  Keyboard,
  Laptop,
  Monitor,
  MessageCircle,
  Flame,
} from "lucide-react"
import { FlashTimerBadge } from "@/components/site/flash-timer-badge"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Logo } from "@/components/site/logo"
import { SearchAutocomplete } from "@/components/site/search-autocomplete"
import { ThemeToggle } from "@/components/site/theme-toggle"
import { useCartCount } from "@/components/site/use-cart-count"
import { useCart } from "@/lib/cart"
import { useWishlist } from "@/lib/wishlist"
import { cn } from "@/lib/utils"
import { site, whatsappLink } from "@/lib/site"
import type { SessionUser } from "@/lib/auth"

type NavCategory = { name: string; slug: string }

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  laptops: <Laptop className="size-4" />,
  desktops: <Monitor className="size-4" />,
  "desktop-pcs": <Monitor className="size-4" />,
  monitors: <Monitor className="size-4" />,
  "keyboards-mice": <Keyboard className="size-4" />,
  storage: <HardDrive className="size-4" />,
  components: <Cpu className="size-4" />,
  "audio-webcams": <Headphones className="size-4" />,
  audio: <Headphones className="size-4" />,
  networking: <Cable className="size-4" />,
  accessories: <Cable className="size-4" />,
  "security-cctv": <Camera className="size-4" />,
  cctv: <Camera className="size-4" />,
}

const STATIC_LINKS = [
  { href: "/shop", label: "All Products" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
]

/* The pill that slides behind whichever nav item is hovered or active.
 * One layoutId across all items — motion animates it between them. */
function NavPill({ toneActive }: { toneActive: boolean }) {
  return (
    <motion.span
      layoutId="nav-pill"
      aria-hidden
      transition={{ type: "spring", stiffness: 450, damping: 36 }}
      className={cn(
        "absolute inset-0 rounded-full",
        toneActive ? "bg-brand/10" : "bg-accent",
      )}
    />
  )
}

export function SiteHeader({
  categories,
  user,
}: {
  categories: NavCategory[]
  user: SessionUser | null
}) {
  const pathname = usePathname()
  const cartCount = useCartCount()
  const openCart = useCart((s) => s.open)
  const wishlistCount = useWishlist((s) => s.items.length)

  const [scrolled, setScrolled] = useState(false)
  const [shopOpen, setShopOpen] = useState(false)
  const [shopMounted, setShopMounted] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [hoverNav, setHoverNav] = useState<string | null>(null)
  const shopRef = useRef<HTMLDivElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const shopCloseTimer = useRef<number | null>(null)

  // Which item the sliding pill sits behind, and whether it wears the brand
  // tone (current page / open menu) or the plain hover tone.
  const activeKey = pathname.startsWith("/shop")
    ? "shop"
    : STATIC_LINKS.find((l) => pathname === l.href)?.href ?? null
  const pillKey = hoverNav ?? (shopOpen ? "shop" : activeKey)
  const toneActive =
    pillKey !== null &&
    (pillKey === activeKey || (shopOpen && pillKey === "shop"))

  const openShop = () => {
    if (shopCloseTimer.current) {
      window.clearTimeout(shopCloseTimer.current)
      shopCloseTimer.current = null
    }
    setShopMounted(true)
    setShopOpen(true)
  }

  const scheduleCloseShop = () => {
    if (shopCloseTimer.current) window.clearTimeout(shopCloseTimer.current)
    shopCloseTimer.current = window.setTimeout(() => setShopOpen(false), 120)
  }

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8)
      const bar = progressBarRef.current
      if (bar) {
        const max = document.documentElement.scrollHeight - window.innerHeight
        bar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`
      }
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Close menus on route change — adjusted during render (React's "derive
  // state from props" pattern) instead of an effect, which causes a cascade.
  const [lastPathname, setLastPathname] = useState(pathname)
  if (lastPathname !== pathname) {
    setLastPathname(pathname)
    setShopOpen(false)
    setMobileOpen(false)
    setHoverNav(null)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setShopOpen(false)
    const onClick = (e: MouseEvent) => {
      if (shopRef.current && !shopRef.current.contains(e.target as Node)) setShopOpen(false)
    }
    if (shopMounted) {
      document.addEventListener("keydown", onKey)
      document.addEventListener("mousedown", onClick)
    }
    return () => {
      document.removeEventListener("keydown", onKey)
      document.removeEventListener("mousedown", onClick)
    }
  }, [shopMounted])

  // Keep the panel mounted briefly after close so it can fade out.
  useEffect(() => {
    if (shopOpen) return
    const timer = setTimeout(() => setShopMounted(false), 200)
    return () => clearTimeout(timer)
  }, [shopOpen])

  useEffect(() => {
    return () => {
      if (shopCloseTimer.current) window.clearTimeout(shopCloseTimer.current)
    }
  }, [])

  return (
    <>
      <AnnouncementBar />

      <header
        className={cn(
          "sticky top-0 z-40 border-b transition-all duration-500",
          scrolled
            ? "border-border/50 bg-background/80 backdrop-blur-xl shadow-[0_8px_32px_-12px_rgb(0,0,0,0.08)]"
            : "border-transparent bg-background/95 backdrop-blur-md",
        )}
      >
        <div className="container-page flex h-16 items-center gap-4">
          <Logo />

          {/* Desktop nav — sliding pill highlight */}
          <nav
            className="ml-1 hidden items-center gap-1 lg:flex"
            onMouseLeave={() => setHoverNav(null)}
          >
            <div
              className="relative"
              ref={shopRef}
              onMouseEnter={() => {
                setHoverNav("shop")
                openShop()
              }}
              onMouseLeave={() => {
                setHoverNav(null)
                scheduleCloseShop()
              }}
            >
              <button
                type="button"
                onClick={() => {
                  if (shopOpen) setShopOpen(false)
                  else openShop()
                }}
                onFocus={openShop}
                aria-expanded={shopOpen}
                aria-haspopup="true"
                className={cn(
                  "relative inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-sm font-medium transition-colors duration-200",
                  pillKey === "shop" && toneActive
                    ? "text-brand"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {pillKey === "shop" && <NavPill toneActive={toneActive} />}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Package className="size-4" />
                  Shop
                  <ChevronDown
                    className={cn(
                      "size-3.5 transition-transform duration-300",
                      shopOpen && "rotate-180",
                    )}
                  />
                </span>
              </button>

              {shopMounted && (
                /* Full-width mega-menu — breaks out of the container to span
                   the viewport, like the big retail sites do. */
                <div
                  className={cn(
                    // NB: the header's backdrop-blur makes it the containing
                    // block for position:fixed, so top-16 = flush under the
                    // header bar at any scroll position. Full viewport width
                    // via inset-x-0 relative to the (full-width) header.
                    "fixed inset-x-0 top-16 z-50 overflow-hidden border-b border-border/60 bg-background/95 shadow-[0_32px_80px_-24px_rgb(0,0,0/0.35)] backdrop-blur-2xl transition-all duration-300 ease-out",
                    shopOpen
                      ? "pointer-events-auto translate-y-0 opacity-100"
                      : "pointer-events-none -translate-y-4 opacity-0",
                  )}
                >
                  {/* brand wash along the top edge */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[55rem] -translate-x-1/2 rounded-full bg-brand/10 blur-3xl"
                  />

                  <div className="container-page relative grid gap-6 py-6 lg:grid-cols-[1.6fr_1fr]">
                    {/* Column 1 — categories */}
                    <div>
                      <p className="text-eyebrow mb-3 text-muted-foreground/60">
                        Shop by category
                      </p>
                      <div className="grid grid-cols-2 gap-1">
                        {categories.map((category, i) => (
                          <Link
                            key={category.slug}
                            href={`/shop?category=${category.slug}`}
                            style={
                              shopOpen
                                ? { animationDelay: `${60 + i * 30}ms` }
                                : undefined
                            }
                            className={cn(
                              "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ease-out hover:bg-brand/[0.07]",
                              shopOpen && "mega-rise",
                            )}
                          >
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-card text-muted-foreground shadow-sm transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-brand/30 group-hover:bg-brand/10 group-hover:text-brand">
                              {CATEGORY_ICONS[category.slug] ?? (
                                <ChevronDown className="size-4" />
                              )}
                            </span>
                            <span className="min-w-0 flex-1 truncate transition-colors group-hover:text-brand">
                              {category.name}
                            </span>
                            <ArrowUpRight className="size-3.5 shrink-0 -translate-x-1 -translate-y-1 text-brand opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100" />
                          </Link>
                        ))}
                      </div>
                      <Link
                        href="/shop"
                        className="group mt-2.5 inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand/25 transition-all duration-300 hover:shadow-brand/40 hover:brightness-110"
                      >
                        Browse everything
                        <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </Link>
                    </div>

                    {/* Column 2 — help card */}
                    <div
                      style={shopOpen ? { animationDelay: "200ms" } : undefined}
                      className={cn(
                        "relative flex flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-brand via-blue-700 to-indigo-900 p-5 text-white shadow-xl shadow-brand/20",
                        shopOpen && "mega-rise",
                      )}
                    >
                      <div className="pointer-events-none absolute -right-10 -bottom-10 size-36 rounded-full bg-white/10 blur-2xl" />
                      <div className="relative">
                        <p className="text-eyebrow text-white/60">
                          Not sure what to buy?
                        </p>
                        <p className="mt-2 text-[0.95rem] leading-snug font-semibold text-balance">
                          Tell us your budget and use — we&apos;ll shortlist
                          the right machine, same day.
                        </p>
                        <ul className="mt-3 space-y-1.5 text-xs text-white/75">
                          <li className="flex items-center gap-2">
                            <Check className="size-3.5 text-emerald-300" />
                            Honest advice, no pushy sales
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="size-3.5 text-emerald-300" />
                            Testing &amp; warranty included
                          </li>
                        </ul>
                      </div>
                      <div className="relative mt-4 flex flex-col gap-2">
                        <a
                          href={whatsappLink(
                            "Hi Dani Brothers, I need help choosing a product.",
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-white text-sm font-semibold text-brand transition-transform duration-200 hover:scale-[1.02] active:scale-100"
                        >
                          <MessageCircle className="size-4" />
                          Chat on WhatsApp
                        </a>
                        <a
                          href={site.phoneHref}
                          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-white/30 text-sm font-semibold text-white/90 transition-colors hover:bg-white/10"
                        >
                          <Phone className="size-4" />
                          Call the shop
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {STATIC_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onMouseEnter={() => setHoverNav(link.href)}
                className={cn(
                  "relative inline-flex h-9 items-center rounded-full px-3.5 text-sm font-medium transition-colors duration-200",
                  pillKey === link.href && toneActive
                    ? "text-brand"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {pillKey === link.href && <NavPill toneActive={toneActive} />}
                <span className="relative z-10">{link.label}</span>
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1">
            <SearchAutocomplete className="hidden md:flex" />

            <span
              aria-hidden
              className="mx-1.5 hidden h-5 w-px bg-border lg:block"
            />

            <Button
              variant="ghost"
              size="icon"
              className="hidden rounded-full transition-transform duration-200 hover:scale-105 active:scale-95 md:inline-flex"
              nativeButton={false}
              render={
                <Link href={user ? "/account" : "/login"} aria-label={user ? "Your account" : "Sign in"} />
              }
            >
              <User />
            </Button>

            <ThemeToggle className="hidden md:grid" />

            <Button
              variant="ghost"
              size="icon"
              nativeButton={false}
              render={
                <Link href="/wishlist" aria-label={`Wishlist${wishlistCount > 0 ? `, ${wishlistCount} items` : ""}`} />
              }
              className={cn(
                "relative rounded-full overflow-visible transition-all duration-200 active:scale-95",
                wishlistCount > 0
                  ? "text-rose-500 hover:text-rose-500 hover:bg-rose-500/10"
                  : "hover:scale-105"
              )}
            >
              <Heart className={cn("size-4", wishlistCount > 0 && "fill-rose-500 text-rose-500")} />
              {wishlistCount > 0 && (
                <motion.span
                  key={wishlistCount}
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 520, damping: 26 }}
                  className="absolute -top-1.5 -right-1.5 grid min-w-5 h-5 place-items-center rounded-full bg-rose-500 px-1 text-[0.65rem] font-bold leading-none text-white tnum shadow-md shadow-rose-500/30 ring-2 ring-background"
                >
                  {wishlistCount > 99 ? "99+" : wishlistCount}
                </motion.span>
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={openCart}
              className={cn(
                "relative rounded-full overflow-visible transition-all duration-200 active:scale-95",
                cartCount > 0
                  ? "bg-brand/10 text-brand hover:bg-brand/20 hover:text-brand border border-brand/25 shadow-sm shadow-brand/10"
                  : "hover:scale-105"
              )}
              aria-label={`Open cart${cartCount > 0 ? `, ${cartCount} items` : ""}`}
            >
              <ShoppingBag className="size-4" />
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 520, damping: 26 }}
                  className="absolute -top-1.5 -right-1.5 grid min-w-5 h-5 place-items-center rounded-full bg-brand px-1 text-[0.65rem] font-bold leading-none text-white tnum shadow-md shadow-brand/30 ring-2 ring-background"
                >
                  {cartCount > 99 ? "99+" : cartCount}
                </motion.span>
              )}
            </Button>

            {/* Mobile menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger
                render={<Button variant="ghost" size="icon" className="rounded-full lg:hidden" />}
                aria-label="Open menu"
              >
                <Menu />
              </SheetTrigger>
              <SheetContent side="right" className="w-[85vw] max-w-sm gap-0 p-0">
                <div className="flex items-center justify-between border-b border-border/50 p-4">
                  <SheetTitle>Menu</SheetTitle>
                  <a
                    href={whatsappLink("Hi Dani Brothers, I have a question.")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-600 transition-all hover:bg-emerald-500/20"
                  >
                    <Phone className="size-3.5" />
                    WhatsApp
                  </a>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  <SearchAutocomplete className="mb-5 md:hidden" />

                  <p className="mb-3 text-[0.65rem] font-bold tracking-[0.14em] text-muted-foreground/60 uppercase">
                    Shop by category
                  </p>
                  <div className="mb-5 flex flex-col gap-1">
                    {categories.map((category) => (
                      <Link
                        key={category.slug}
                        href={`/shop?category=${category.slug}`}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground">
                          {CATEGORY_ICONS[category.slug] ?? <ChevronDown className="size-3.5" />}
                        </span>
                        {category.name}
                      </Link>
                    ))}
                  </div>

                  <div className="border-t border-border/50 pt-3">
                    {STATIC_LINKS.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent",
                          pathname === link.href && "text-brand",
                        )}
                      >
                        <span className="w-4.5 text-center">
                          {link.label === "All Products" ? (
                            <Search className="size-3.5" />
                          ) : link.label === "About" ? (
                            <span>🌐</span>
                          ) : (
                            <Phone className="size-3.5" />
                          )}
                        </span>
                        {link.label}
                      </Link>
                    ))}
                    <Link
                      href={user ? "/account" : "/login"}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
                    >
                      <User className="size-3.5 shrink-0 text-muted-foreground/60" />
                      {user ? "My account" : "Sign in"}
                    </Link>
                    <Link
                      href="/wishlist"
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
                    >
                      <Heart className="size-3.5 shrink-0 text-muted-foreground/60" />
                      Wishlist
                      {wishlistCount > 0 && (
                        <span className="ml-auto grid min-w-[1.125rem] place-items-center rounded-full bg-red-500 px-1 py-0.5 text-[0.6rem] font-bold text-white">
                          {wishlistCount}
                        </span>
                      )}
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Reading progress — grows as you scroll the page */}
        <div
          ref={progressBarRef}
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-gradient-to-r from-brand via-blue-400 to-brand transition-transform duration-150 ease-out"
        />
      </header>
    </>
  )
}

function AnnouncementBar() {
  return (
    <div className="relative border-b border-amber-500/10 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 text-white">
      <div className="container-page flex min-h-8 flex-wrap items-center justify-between py-1 text-xs gap-x-4 gap-y-1">
        {/* Left: Delivery notice */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[0.7rem] font-semibold text-emerald-400 border border-emerald-500/25">
            <Package className="size-3" />
            Karachi Delivery
          </span>
          <span className="font-medium text-zinc-200">Rs. 500 Flat</span>
          <span className="hidden lg:inline text-zinc-600">•</span>
          <span className="hidden lg:inline text-zinc-400 text-[0.75rem]">
            Outside Karachi: Shipping confirmed via call
          </span>
        </div>

        {/* Center: Live Flash Deals Countdown */}
        <div className="hidden sm:flex items-center gap-2 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
          <span className="flex items-center gap-1 text-[0.7rem] font-bold text-amber-400 tracking-wide uppercase">
            <Flame className="size-3 animate-pulse text-amber-400" />
            Flash Deals
          </span>
          <span className="text-zinc-600">•</span>
          <FlashTimerBadge compact />
          <Link
            href="/shop"
            className="text-[0.7rem] font-semibold text-amber-300 underline underline-offset-2 hover:text-white transition-colors"
          >
            Shop Now →
          </Link>
        </div>

        {/* Right: Contact & WhatsApp */}
        <div className="flex items-center gap-3.5 text-xs font-medium ml-auto sm:ml-0">
          <a
            href={site.phoneHref}
            className="hidden md:inline-flex items-center gap-1.5 text-zinc-300 transition-colors hover:text-white"
          >
            <Phone className="size-3 text-emerald-400" />
            <span>{site.phone}</span>
          </a>
          <span className="hidden md:inline text-zinc-700">•</span>
          <a
            href={whatsappLink("Hello Dani Brothers, I have an inquiry")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold transition-colors hover:text-emerald-300"
          >
            <MessageCircle className="size-3" />
            <span>WhatsApp Support</span>
          </a>
        </div>
      </div>
    </div>
  )
}
