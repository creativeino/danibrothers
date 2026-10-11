"use client"

import Link from "next/link"
import { useRef } from "react"
import { motion, useScroll, useTransform } from "motion/react"
import { ArrowRight, MessageCircle } from "lucide-react"
import { site, whatsappLink } from "@/lib/site"

export function SellDeviceCTA() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })

  const bgY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"])
  const orbY1 = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"])
  const orbY2 = useTransform(scrollYProgress, [0, 1], ["15%", "-15%"])

  return (
    <div ref={ref} className="group relative overflow-hidden rounded-3xl bg-zinc-950 px-5 py-10 text-white md:px-14 md:py-20 shadow-2xl shadow-black/40">
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
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-brand/8 blur-[120px] transition-all duration-1000 group-hover:bg-brand/15 group-hover:scale-125"
        style={{ y: orbY1 }}
      />
      <motion.div
        className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-emerald-500/10 blur-[100px]"
        style={{ y: orbY2 }}
      />
      <motion.div
        className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-blue-500/10 blur-[100px]"
        style={{ y: orbY1 }}
      />

      {/* Grid lines */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Border glow */}
      <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/5" />

      <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between lg:gap-16">
        {/* Left content */}
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-1.5 text-xs font-semibold text-emerald-400">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Same day valuation
          </div>

          <h2 className="mt-5 text-[clamp(1.75rem,4vw,3rem)] font-bold leading-[1.1] tracking-tight text-balance">
            <span className="text-white">Sell your old device</span>
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
              for a fair price
            </span>
          </h2>

          <p className="mt-5 text-sm leading-relaxed text-white/45 max-w-md">
            Bring it in or send photos on WhatsApp. We buy laptops, desktops and components, working or not.
          </p>

          {/* Trust points */}
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
            {["Same day cash", "No obligation", "Any condition"].map((item) => (
              <span key={item} className="flex items-center gap-2 text-xs text-white/40">
                <svg className="size-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Right side — CTA cards */}
        <div className="mt-8 sm:mt-10 lg:mt-0 flex flex-col sm:flex-row gap-3 sm:gap-4">
          {/* WhatsApp card */}
          <a
            href={whatsappLink("Hi Dani Brothers, I want to sell my laptop.")}
            target="_blank"
            rel="noopener noreferrer"
            className="group/card relative flex items-center gap-3 sm:gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5 transition-all duration-500 hover:border-emerald-400/30 hover:bg-emerald-400/[0.06] hover:shadow-lg hover:shadow-emerald-500/10"
          >
            <span className="grid size-10 sm:size-12 place-items-center rounded-xl bg-emerald-500/15 text-emerald-400 transition-all duration-500 group-hover/card:scale-110 group-hover/card:bg-emerald-500/25">
              <MessageCircle className="size-5 sm:size-6" />
            </span>
            <div>
              <p className="text-sm font-bold text-white">WhatsApp a photo</p>
              <p className="text-xs text-white/40 mt-0.5">Get a ballpark in minutes</p>
            </div>
            <ArrowRight className="ml-auto size-4 text-white/30 transition-all duration-300 group-hover/card:translate-x-1 group-hover/card:text-emerald-400" />
          </a>

          {/* Form card */}
          <Link
            href="/contact#sell"
            className="group/card relative flex items-center gap-3 sm:gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5 transition-all duration-500 hover:border-brand/30 hover:bg-brand/[0.06] hover:shadow-lg hover:shadow-brand/10"
          >
            <span className="grid size-10 sm:size-12 place-items-center rounded-xl bg-brand/15 text-blue-400 transition-all duration-500 group-hover/card:scale-110 group-hover/card:bg-brand/25">
              <ArrowRight className="size-5 sm:size-6" />
            </span>
            <div>
              <p className="text-sm font-bold text-white">Fill the form</p>
              <p className="text-xs text-white/40 mt-0.5">Detailed valuation</p>
            </div>
            <ArrowRight className="ml-auto size-4 text-white/30 transition-all duration-300 group-hover/card:translate-x-1 group-hover/card:text-blue-400" />
          </Link>
        </div>
      </div>

      {/* Bottom address */}
      <div className="relative mt-8 pt-6 border-t border-white/5">
        <p className="text-xs text-white/30">Visit us at {site.address}</p>
      </div>
    </div>
  )
}
