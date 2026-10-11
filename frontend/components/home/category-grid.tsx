import Link from "next/link"
import {
  ArrowUpRight,
  Cable,
  Camera,
  Cpu,
  HardDrive,
  Headphones,
  Keyboard,
  Laptop,
  Monitor,
  PcCase,
  type LucideIcon,
} from "lucide-react"
import { Stagger, StaggerItem } from "@/components/motion/reveal"
import type { Category } from "@/lib/db-types"

const ICONS: Record<string, LucideIcon> = {
  laptop: Laptop,
  "pc-case": PcCase,
  monitor: Monitor,
  keyboard: Keyboard,
  "hard-drive": HardDrive,
  cpu: Cpu,
  headphones: Headphones,
  cable: Cable,
  cctv: Camera,
}

const THEMES = [
  {
    bg: "from-blue-600/10 via-blue-500/5 to-transparent",
    icon: "bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white group-hover:shadow-blue-500/30",
    glow: "group-hover:shadow-[0_0_40px_-8px_rgba(59,130,246,0.4)]",
    ring: "group-hover:ring-blue-500/30",
    count: "bg-blue-500/10 text-blue-600",
    accent: "bg-blue-500",
  },
  {
    bg: "from-purple-600/10 via-purple-500/5 to-transparent",
    icon: "bg-purple-500/10 text-purple-500 group-hover:bg-purple-500 group-hover:text-white group-hover:shadow-purple-500/30",
    glow: "group-hover:shadow-[0_0_40px_-8px_rgba(168,85,247,0.4)]",
    ring: "group-hover:ring-purple-500/30",
    count: "bg-purple-500/10 text-purple-600",
    accent: "bg-purple-500",
  },
  {
    bg: "from-emerald-600/10 via-emerald-500/5 to-transparent",
    icon: "bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white group-hover:shadow-emerald-500/30",
    glow: "group-hover:shadow-[0_0_40px_-8px_rgba(16,185,129,0.4)]",
    ring: "group-hover:ring-emerald-500/30",
    count: "bg-emerald-500/10 text-emerald-600",
    accent: "bg-emerald-500",
  },
  {
    bg: "from-orange-600/10 via-orange-500/5 to-transparent",
    icon: "bg-orange-500/10 text-orange-500 group-hover:bg-orange-500 group-hover:text-white group-hover:shadow-orange-500/30",
    glow: "group-hover:shadow-[0_0_40px_-8px_rgba(249,115,22,0.4)]",
    ring: "group-hover:ring-orange-500/30",
    count: "bg-orange-500/10 text-orange-600",
    accent: "bg-orange-500",
  },
  {
    bg: "from-rose-600/10 via-rose-500/5 to-transparent",
    icon: "bg-rose-500/10 text-rose-500 group-hover:bg-rose-500 group-hover:text-white group-hover:shadow-rose-500/30",
    glow: "group-hover:shadow-[0_0_40px_-8px_rgba(244,63,94,0.4)]",
    ring: "group-hover:ring-rose-500/30",
    count: "bg-rose-500/10 text-rose-600",
    accent: "bg-rose-500",
  },
  {
    bg: "from-cyan-600/10 via-cyan-500/5 to-transparent",
    icon: "bg-cyan-500/10 text-cyan-500 group-hover:bg-cyan-500 group-hover:text-white group-hover:shadow-cyan-500/30",
    glow: "group-hover:shadow-[0_0_40px_-8px_rgba(6,182,212,0.4)]",
    ring: "group-hover:ring-cyan-500/30",
    count: "bg-cyan-500/10 text-cyan-600",
    accent: "bg-cyan-500",
  },
  {
    bg: "from-amber-600/10 via-amber-500/5 to-transparent",
    icon: "bg-amber-500/10 text-amber-500 group-hover:bg-amber-500 group-hover:text-white group-hover:shadow-amber-500/30",
    glow: "group-hover:shadow-[0_0_40px_-8px_rgba(245,158,11,0.4)]",
    ring: "group-hover:ring-amber-500/30",
    count: "bg-amber-500/10 text-amber-600",
    accent: "bg-amber-500",
  },
  {
    bg: "from-indigo-600/10 via-indigo-500/5 to-transparent",
    icon: "bg-indigo-500/10 text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white group-hover:shadow-indigo-500/30",
    glow: "group-hover:shadow-[0_0_40px_-8px_rgba(99,102,241,0.4)]",
    ring: "group-hover:ring-indigo-500/30",
    count: "bg-indigo-500/10 text-indigo-600",
    accent: "bg-indigo-500",
  },
]

export function CategoryGrid({
  categories,
}: {
  categories: (Category & { productCount: number })[]
}) {
  return (
    <Stagger className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
      {categories.map((category, index) => {
        const Icon = ICONS[category.icon] ?? Laptop
        const theme = THEMES[index % THEMES.length]
        return (
          <StaggerItem key={category.id}>
            <Link
              href={`/shop?category=${category.slug}`}
              className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card ring-1 ring-transparent transition-all duration-500 hover:-translate-y-1.5 hover:border-transparent hover:ring-1 ${theme.ring} ${theme.glow}`}
            >
              {/* Background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${theme.bg} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />

              {/* Top accent bar */}
              <div className={`absolute inset-x-0 top-0 h-[3px] ${theme.accent} opacity-0 scale-x-0 transition-all duration-500 group-hover:opacity-100 group-hover:scale-x-100`} />

              {/* Dot grid pattern */}
              <div
                className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-[0.03]"
                style={{
                  backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
                  backgroundSize: "16px 16px",
                }}
              />

              <div className="relative p-3.5 sm:p-5 md:p-6">
                {/* Icon */}
                <div className="relative mb-3 sm:mb-4">
                  <div className={`absolute -inset-3 rounded-2xl opacity-0 blur-xl transition-all duration-700 group-hover:opacity-60 ${theme.icon.split(" ").find(c => c.startsWith("bg-"))}`} />
                  <span className={`relative grid size-11 sm:size-12 md:size-14 place-items-center rounded-2xl transition-all duration-500 ${theme.icon}`}>
                    <Icon className="size-5 sm:size-6 md:size-7" strokeWidth={1.5} />
                  </span>
                </div>

                {/* Text */}
                <h3 className="text-[0.85rem] sm:text-[0.95rem] font-bold tracking-tight text-foreground transition-colors duration-300">
                  {category.name}
                </h3>
                <p className="mt-1 line-clamp-2 text-[0.7rem] sm:text-xs leading-relaxed text-muted-foreground/70">
                  {category.description}
                </p>

                {/* Bottom row */}
                <div className="mt-3 sm:mt-4 flex items-center justify-between">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[0.65rem] font-bold tracking-wide tnum transition-all duration-300 ${theme.count}`}>
                    {category.productCount} items
                  </span>

                  <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground transition-all duration-300 group-hover:text-foreground">
                    View
                    <ArrowUpRight className="size-3.5 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </div>
              </div>
            </Link>
          </StaggerItem>
        )
      })}
    </Stagger>
  )
}
