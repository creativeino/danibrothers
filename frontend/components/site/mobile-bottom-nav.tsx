"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Grid, Heart, ShoppingBag, MessageCircle, Laptop } from "lucide-react"
import { useCart } from "@/lib/cart"
import { useCartCount } from "@/components/site/use-cart-count"
import { useWishlist } from "@/lib/wishlist"
import { cn } from "@/lib/utils"
import { whatsappLink, site } from "@/lib/site"

export function MobileBottomNav() {
  const pathname = usePathname()
  const cartCount = useCartCount()
  const openCart = useCart((s) => s.open)
  const wishlistCount = useWishlist((s) => s.items.length)

  // Avoid cluttering inside checkout or admin screens
  if (pathname.startsWith("/admin") || pathname.startsWith("/checkout")) {
    return null
  }

  const items = [
    {
      label: "Home",
      href: "/",
      icon: Home,
      isActive: pathname === "/",
    },
    {
      label: "Shop",
      href: "/shop",
      icon: Laptop,
      isActive: pathname.startsWith("/shop"),
    },
    {
      label: "WhatsApp",
      href: whatsappLink("Hi Dani Brothers, I need assistance with a product."),
      icon: MessageCircle,
      isExternal: true,
      color: "text-emerald-500",
    },
    {
      label: "Wishlist",
      href: "/wishlist",
      icon: Heart,
      badge: wishlistCount,
      isActive: pathname === "/wishlist",
    },
    {
      label: "Cart",
      onClick: openCart,
      icon: ShoppingBag,
      badge: cartCount,
      isActive: false,
    },
  ]

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed inset-x-0 bottom-0 z-40 block border-t border-border/60 bg-background/90 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_-8px_rgba(0,0,0,0.12)] backdrop-blur-xl lg:hidden"
    >
      <div className="flex h-15 items-center justify-around px-2">
        {items.map((item) => {
          const Icon = item.icon
          const content = (
            <div className="relative flex flex-col items-center justify-center gap-1 py-1 px-3">
              <div className="relative">
                <Icon
                  className={cn(
                    "size-5 transition-transform duration-200",
                    item.isActive
                      ? "text-brand scale-110"
                      : item.color ?? "text-muted-foreground",
                  )}
                />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -right-2.5 -top-1.5 flex min-w-4 h-4 items-center justify-center rounded-full bg-red-600 px-1 text-[0.6rem] font-bold text-white shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  "text-[0.65rem] font-semibold tracking-tight transition-colors",
                  item.isActive
                    ? "text-brand font-bold"
                    : "text-muted-foreground",
                )}
              >
                {item.label}
              </span>
              {item.isActive && (
                <span className="absolute -bottom-1 h-0.5 w-6 rounded-full bg-brand" />
              )}
            </div>
          )

          if (item.onClick) {
            return (
              <button
                key={item.label}
                type="button"
                onClick={item.onClick}
                className="flex flex-1 items-center justify-center cursor-pointer"
              >
                {content}
              </button>
            )
          }

          if (item.isExternal) {
            return (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center"
              >
                {content}
              </a>
            )
          }

          return (
            <Link
              key={item.label}
              href={item.href!}
              className="flex flex-1 items-center justify-center"
            >
              {content}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
