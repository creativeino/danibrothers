"use client"

import { useEffect, useState } from "react"
import { Clock, Flame, Zap } from "lucide-react"

export function FlashTimerBadge({
  compact = false,
  targetHoursFromNow = 8,
}: {
  compact?: boolean
  targetHoursFromNow?: number
}) {
  const [timeLeft, setTimeLeft] = useState<{
    hours: string
    minutes: string
    seconds: string
  }>({
    hours: "00",
    minutes: "00",
    seconds: "00",
  })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Calculate end of current deal cycle (e.g. midnight or fixed interval)
    const updateCountdown = () => {
      const now = new Date()
      // Deals reset at 11:59:59 PM today
      const endOfDay = new Date()
      endOfDay.setHours(23, 59, 59, 999)

      const diff = Math.max(0, endOfDay.getTime() - now.getTime())
      const totalSeconds = Math.floor(diff / 1000)

      const h = Math.floor(totalSeconds / 3600)
      const m = Math.floor((totalSeconds % 3600) / 60)
      const s = totalSeconds % 60

      setTimeLeft({
        hours: String(h).padStart(2, "0"),
        minutes: String(m).padStart(2, "0"),
        seconds: String(s).padStart(2, "0"),
      })
    }

    updateCountdown()
    const timer = setInterval(updateCountdown, 1000)
    return () => clearInterval(timer)
  }, [targetHoursFromNow])

  if (!mounted) {
    return (
      <span className="inline-flex items-center gap-1.5 opacity-70 text-xs font-mono">
        <Clock className="size-3 animate-pulse text-amber-400" />
        <span>--h : --m : --s</span>
      </span>
    )
  }

  if (compact) {
    return (
      <span className="inline-flex items-center gap-1 font-mono text-[0.7rem] font-bold text-amber-300">
        <Clock className="size-3 text-amber-400 animate-spin-slow" />
        <span>
          {timeLeft.hours}h : {timeLeft.minutes}m : {timeLeft.seconds}s
        </span>
      </span>
    )
  }

  return (
    <div className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900/90 px-2.5 py-1 text-xs font-mono font-bold tracking-tight text-white border border-amber-500/30 shadow-inner">
      <Flame className="size-3.5 text-amber-400 animate-pulse" />
      <span className="text-[0.65rem] uppercase tracking-wider text-amber-400 font-sans mr-0.5">Ends in:</span>
      <span className="text-amber-300 font-bold">{timeLeft.hours}</span>
      <span className="text-zinc-500">:</span>
      <span className="text-amber-300 font-bold">{timeLeft.minutes}</span>
      <span className="text-zinc-500">:</span>
      <span className="text-amber-300 font-bold">{timeLeft.seconds}</span>
    </div>
  )
}
