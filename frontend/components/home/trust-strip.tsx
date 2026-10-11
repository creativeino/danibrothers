import { BadgeCheck, Banknote, PackageCheck, Wrench } from "lucide-react"
import { Reveal } from "@/components/motion/reveal"

const POINTS = [
  {
    icon: Wrench,
    title: "Checked before it leaves",
    body: "Storage health, battery cycles, thermals, ports and screen — every machine is bench-tested and the report stays with the unit.",
    color: "text-brand",
    bg: "bg-brand-subtle",
    glow: "group-hover:shadow-brand/20",
    border: "group-hover:border-brand/25",
    accent: "from-brand to-brand/40",
  },
  {
    icon: BadgeCheck,
    title: "Warranty, in writing",
    body: "Brand new stock carries manufacturer warranty. Pre-owned gets a 15-day check window.",
    color: "text-success",
    bg: "bg-success-subtle",
    glow: "group-hover:shadow-success/20",
    border: "group-hover:border-success/25",
    accent: "from-success to-success/40",
  },
  {
    icon: Banknote,
    title: "Cash on delivery",
    body: "Pay when the courier hands it over, or by bank transfer if you prefer. No card details, no advance payment.",
    color: "text-warning",
    bg: "bg-warning-subtle",
    glow: "group-hover:shadow-warning/20",
    border: "group-hover:border-warning/25",
    accent: "from-warning to-warning/40",
  },
  {
    icon: PackageCheck,
    title: "We buy as well as sell",
    body: "Upgrading? Bring your old laptop in for a same-day valuation, or send photos on WhatsApp for a ballpark figure.",
    color: "text-brand",
    bg: "bg-brand-subtle",
    glow: "group-hover:shadow-brand/20",
    border: "group-hover:border-brand/25",
    accent: "from-brand to-brand/40",
  },
]

export function TrustStrip() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {POINTS.map(({ icon: Icon, title, body, color, bg, glow, border, accent }, index) => (
        <Reveal key={title} delay={index * 0.08}>
          <div className={`group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6 transition-all duration-500 hover:-translate-y-1 ${border} ${glow} hover:shadow-xl`}>
            {/* Top accent line */}
            <div className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${accent} opacity-0 scale-x-0 transition-all duration-500 group-hover:opacity-100 group-hover:scale-x-100`} />

            {/* Icon */}
            <div className="relative mb-4">
              <div className={`absolute -inset-2 rounded-xl ${bg} opacity-0 blur-lg transition-all duration-500 group-hover:opacity-100`} />
              <span className={`relative grid size-12 place-items-center rounded-xl ${bg} ${color} transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg ${glow}`}>
                <Icon className="size-6" strokeWidth={1.5} />
              </span>
            </div>

            {/* Content */}
            <h3 className="text-[0.9rem] font-bold tracking-tight text-foreground transition-colors duration-300 group-hover:text-foreground">
              {title}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground/80">
              {body}
            </p>
          </div>
        </Reveal>
      ))}
    </div>
  )
}
