"use client"

import { useRef, type ReactNode } from "react"
import { motion, useScroll, useTransform } from "motion/react"
import { BadgeCheck, Lock, MapPin, Phone } from "lucide-react"
import { Logo } from "@/components/site/logo"
import { site } from "@/lib/site"

/**
 * Split layout for the auth pages: the form on the left, a quiet reassurance
 * panel on the right. Both auth pages share it so the pair feels like one
 * place rather than two unrelated screens.
 *
 * The right panel mirrors the homepage SellDeviceCTA — dark surface, blurred
 * product backdrop, parallax glow orbs, grid lines.
 */
export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: ReactNode
}) {
  const panelRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: panelRef,
    offset: ["start end", "end start"],
  })

  const bgY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"])
  const orbY1 = useTransform(scrollYProgress, [0, 1], ["-18%", "18%"])
  const orbY2 = useTransform(scrollYProgress, [0, 1], ["12%", "-12%"])

  return (
    <div className="relative overflow-hidden">
      {/* Soft background glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-24 h-72 w-72 rounded-full bg-brand/10 blur-[110px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 top-1/3 h-64 w-64 rounded-full bg-brand/8 blur-[100px]"
      />

      <div className="container-page relative grid flex-1 gap-12 py-12 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-20">
        {/* Left — form */}
        <div className="mx-auto w-full max-w-sm">
          {/* Logo links home on its own — wrapping it in another Link would
              nest <a> inside <a> and break hydration. */}
          <div className="lg:hidden">
            <Logo />
          </div>

          <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/5 px-3.5 py-1.5 text-xs font-semibold text-brand lg:mt-0">
            <Lock className="size-3.5" />
            Secure sign-in
          </div>

          <h1 className="mt-4 text-display-sm text-balance">{title}</h1>
          <p className="mt-3 mb-8 text-sm leading-relaxed text-muted-foreground">{subtitle}</p>

          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm sm:p-6">
            {children}
          </div>
        </div>

        {/* Right — homepage-style CTA panel */}
        <aside
          ref={panelRef}
          className="group relative hidden overflow-hidden rounded-3xl bg-zinc-950 p-10 text-white shadow-2xl shadow-black/40 lg:block"
        >
          {/* Parallax background image */}
          <motion.div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('/images/pc with laptop.png')",
              filter: "blur(20px) brightness(0.3) saturate(1.2)",
              transform: "scale(1.2)",
              y: bgY,
            }}
          />

          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-950/80 via-zinc-900/70 to-zinc-950/90" />

          {/* Glow orbs with parallax */}
          <motion.div
            className="absolute top-1/2 left-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/10 blur-[120px] transition-all duration-1000 group-hover:bg-brand/18 group-hover:scale-110"
            style={{ y: orbY1 }}
          />
          <motion.div
            className="absolute -top-28 -right-28 h-72 w-72 rounded-full bg-emerald-500/10 blur-[100px]"
            style={{ y: orbY2 }}
          />
          <motion.div
            className="absolute -bottom-28 -left-28 h-72 w-72 rounded-full bg-blue-500/10 blur-[100px]"
            style={{ y: orbY1 }}
          />

          {/* Grid lines */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          {/* Border glow */}
          <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/8" />

          <div className="relative flex h-full flex-col">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-1.5 text-xs font-semibold text-emerald-400">
              <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
              Trusted since {site.since}
            </div>

            <p className="mt-7 text-[clamp(1.5rem,2.5vw,1.875rem)] leading-[1.15] font-bold tracking-tight text-balance">
              <span className="text-white">An account keeps your</span>
              <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                orders &amp; warranties safe
              </span>
            </p>

            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/50">
              Track deliveries, re-order without digging through WhatsApp, and checkout faster
              with saved details.
            </p>

            {/* Trust points */}
            <ul className="mt-7 flex flex-col gap-3 text-sm text-white/55">
              {[
                "Track every order from confirmed to delivered.",
                "Re-order consumables without digging through WhatsApp.",
                "Faster checkout — your delivery details are remembered.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-emerald-500/15 text-emerald-400">
                    <BadgeCheck className="size-3" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            {/* Bottom address */}
            <div className="mt-auto pt-10">
              <div className="border-t border-white/8 pt-5">
                <p className="flex items-start gap-2 text-xs text-white/35">
                  <MapPin className="mt-0.5 size-3.5 shrink-0 text-emerald-400/70" />
                  {site.address}
                </p>
                <p className="mt-2 flex items-center gap-2 text-xs text-white/35">
                  <Phone className="size-3.5 shrink-0 text-emerald-400/70" />
                  {site.hours} · {site.phone}
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
