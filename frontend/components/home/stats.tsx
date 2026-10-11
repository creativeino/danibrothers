"use client"

import type { MouseEvent } from "react"
import { motion, useReducedMotion } from "motion/react"
import { Boxes, CalendarClock, Laptop, Store, ThumbsUp } from "lucide-react"
import { CountUp } from "@/components/motion/count-up"
import { Marquee } from "@/components/motion/marquee"
import { Stagger, StaggerItem } from "@/components/motion/reveal"
import { site } from "@/lib/site"

const STATS = [
  { icon: Laptop, value: 2400, suffix: "+", label: "Machines sold", hint: "And counting, every week" },
  { icon: CalendarClock, value: 16, suffix: "+", label: "Years in the trade", hint: `Same street since ${site.since}` },
  { icon: Boxes, value: 40, suffix: "+", label: "Brands stocked", hint: "New and certified pre-owned" },
  { icon: ThumbsUp, value: 98, suffix: "%", label: "Would buy again", hint: "From customers who reviewed us" },
]

const BRANDS = [
  "Dell",
  "HP",
  "Lenovo",
  "Apple",
  "Asus",
  "Acer",
  "MSI",
  "Samsung",
  "Logitech",
  "Kingston",
  "Corsair",
  "AMD",
  "Intel",
  "TP-Link",
  "Anker",
  "UGREEN",
  "Hikvision",
  "Dahua",
]

const EASE = [0.22, 1, 0.36, 1] as const
// Soft overshoot — enough bounce to feel alive, never cartoonish.
const SPRING_POP = { type: "spring", stiffness: 300, damping: 15 } as const
const SPRING_RISE = { type: "spring", stiffness: 220, damping: 17 } as const

/** Writes the cursor position into CSS vars so the spotlight can follow it. */
function trackPointer(event: MouseEvent<HTMLDivElement>) {
  const rect = event.currentTarget.getBoundingClientRect()
  event.currentTarget.style.setProperty("--mx", `${event.clientX - rect.left}px`)
  event.currentTarget.style.setProperty("--my", `${event.clientY - rect.top}px`)
}

export function Stats() {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.7, ease: EASE }}
      className="group/card relative"
    >
      {/* Conic ring that orbits the card border on hover — sits 1px outside
          the card, so only the sliver peeking around the edge is visible. */}
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition-opacity duration-500 group-hover/card:opacity-100"
        style={{
          background:
            "conic-gradient(from var(--orbit-angle), transparent 0deg 240deg, var(--brand) 300deg, var(--brand-subtle) 330deg, transparent 360deg)",
          animation: reduceMotion ? "none" : "border-orbit 4s linear infinite",
        }}
      />

      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card shadow-lg shadow-black/[0.03] transition-shadow duration-500 group-hover/card:shadow-xl group-hover/card:shadow-brand/10 dark:shadow-black/20">
        {/* Dot-grid texture */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle, color-mix(in oklab, var(--foreground) 7%, transparent) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <Stagger
          className="grid grid-cols-1 divide-y divide-border/60 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4"
          gap={0.08}
        >
          {STATS.map(({ icon: Icon, value, suffix, label, hint }, index) => (
            <StaggerItem key={label} y={20} className="group/stat relative">
              <div
                className="relative flex h-full flex-col items-start px-7 py-11 transition-colors duration-300 group-hover/stat:bg-brand-subtle/30 sm:px-8"
                onMouseMove={trackPointer}
              >
                {/* Icon pops in with a counter-rotation, a ripple ring waves
                    out from it, then on hover the tile itself bounces. */}
                <motion.span
                  initial={reduceMotion ? false : { scale: 0.4, opacity: 0, rotate: -10 }}
                  whileInView={{ scale: 1, opacity: 1, rotate: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={reduceMotion ? { duration: 0 } : { ...SPRING_POP, delay: 0.05 }}
                  className="relative grid size-10 place-items-center"
                >
                  <motion.span
                    aria-hidden
                    initial={reduceMotion ? false : { scale: 0.5, opacity: 0.9 }}
                    whileInView={{ scale: 2.2, opacity: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={reduceMotion ? { duration: 0 } : { duration: 0.9, delay: 0.3, ease: EASE }}
                    className="pointer-events-none absolute inset-0 rounded-xl ring-2 ring-brand/45"
                  />
                  <span className="grid size-10 place-items-center rounded-xl bg-brand/8 text-brand transition-all duration-300 ease-out group-hover/stat:-rotate-6 group-hover/stat:scale-110 group-hover/stat:bg-brand/12 group-hover/stat:shadow-lg group-hover/stat:shadow-brand/30">
                    <Icon className="size-[18px]" strokeWidth={1.75} />
                  </span>
                </motion.span>

                {/* Number rises with a blur-out landing; on hover a brand
                    glow bleeds out of the digits. The suffix is painted in
                    brand colour at half size. */}
                <div className="mt-6 transition-[filter] duration-500 [filter:drop-shadow(0_0_0px_transparent)] group-hover/stat:[filter:drop-shadow(0_4px_18px_color-mix(in_oklab,var(--brand)_35%,transparent))]">
                  <motion.p
                    initial={reduceMotion ? false : { opacity: 0, y: 22, scale: 0.88, filter: "blur(10px)" }}
                    whileInView={
                      reduceMotion
                        ? { opacity: 1, y: 0, scale: 1 }
                        : { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }
                    }
                    viewport={{ once: true, margin: "-40px" }}
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : {
                            ...SPRING_RISE,
                            delay: 0.14,
                            filter: { duration: 0.6, delay: 0.14, ease: EASE },
                          }
                    }
                    className="font-display tnum origin-left bg-gradient-to-b from-foreground to-foreground/55 bg-clip-text text-[clamp(2.5rem,6vw,3.75rem)] leading-none font-semibold tracking-[-0.035em] text-transparent"
                  >
                    <CountUp value={value} duration={1400} />
                    <span className="ml-1.5 text-[0.5em] font-bold text-brand">{suffix}</span>
                  </motion.p>
                </div>

                <motion.div
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={reduceMotion ? { duration: 0 } : { duration: 0.5, delay: 0.45, ease: EASE }}
                >
                  <p className="mt-3.5 text-[11px] font-semibold tracking-[0.15em] text-muted-foreground uppercase transition-[color,letter-spacing] duration-300 ease-out group-hover/stat:tracking-[0.2em] group-hover/stat:text-brand">
                    {label}
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground/60 transition-colors duration-300 group-hover/stat:text-muted-foreground">
                    {hint}
                  </p>
                </motion.div>

                {/* Spotlight that trails the cursor inside the cell. */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/stat:opacity-100"
                  style={{
                    background:
                      "radial-gradient(340px circle at var(--mx, 50%) var(--my, 25%), color-mix(in oklab, var(--brand) 13%, transparent), transparent 70%)",
                  }}
                />
              </div>

              {/* Hairline accent that draws in on hover. */}
              <span
                aria-hidden
                className="absolute inset-x-10 top-0 h-px origin-center scale-x-0 bg-gradient-to-r from-transparent via-brand to-transparent transition-transform duration-500 ease-out group-hover/stat:scale-x-100"
              />

              {/* Horizontal hairline above the second row (2-col layout only). */}
              {index === 2 && (
                <motion.span
                  aria-hidden
                  initial={reduceMotion ? false : { scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={reduceMotion ? { duration: 0 } : { duration: 0.7, delay: 0.35, ease: EASE }}
                  className="absolute inset-x-8 top-0 hidden h-px origin-left bg-border/60 transition-colors duration-300 group-hover/stat:bg-brand/40 sm:block lg:hidden"
                />
              )}

              {/* Vertical hairline between columns — hidden at each row start:
                  odd indexes start no row in the 2-col layout; index 2 only
                  starts a row at lg, where it becomes column 3. */}
              {index > 0 && (
                <motion.span
                  aria-hidden
                  initial={reduceMotion ? false : { scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={reduceMotion ? { duration: 0 } : { duration: 0.7, delay: 0.35, ease: EASE }}
                  className={`absolute inset-y-8 left-0 w-px origin-center bg-border/60 transition-colors duration-300 group-hover/stat:bg-brand/40 ${
                    index % 2 === 1 ? "hidden sm:block" : "hidden lg:block"
                  }`}
                />
              )}
            </StaggerItem>
          ))}
        </Stagger>

        {/* One-shot sheen that sweeps the card once it enters view. */}
        {!reduceMotion && (
          <motion.span
            aria-hidden
            initial={{ x: "-160%" }}
            whileInView={{ x: "260%" }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 1.5, delay: 0.55, ease: EASE }}
            className="pointer-events-none absolute inset-y-0 left-0 w-2/5 -skew-x-12 bg-gradient-to-r from-transparent via-brand/10 to-transparent blur-lg dark:via-white/10"
          />
        )}

        {/* Footnote strip */}
        <div className="relative flex items-center justify-center gap-2 border-t border-border/60 bg-brand-subtle/30 px-5 py-3.5 text-center text-xs text-muted-foreground">
          <Store className="size-3.5 shrink-0 text-brand" />
          <span>
            Straight from our own counter since {site.since} — not a marketing deck.
          </span>
        </div>
      </div>
    </motion.div>
  )
}

export function BrandMarquee() {
  return (
    <div className="border-y border-border bg-card py-8">
      <p className="container-page text-eyebrow mb-6 text-muted-foreground">
        Brands we stock and service
      </p>
      <Marquee>
        {BRANDS.map((brand) => (
          <span
            key={brand}
            className="mx-6 text-xl font-semibold tracking-tight text-muted-foreground/60 transition-colors duration-300 hover:text-foreground sm:mx-8 sm:text-2xl"
          >
            {brand}
          </span>
        ))}
      </Marquee>
      <p className="container-page mt-6 text-xs text-muted-foreground">
        Walk into {site.name} — {site.address}
      </p>
    </div>
  )
}
