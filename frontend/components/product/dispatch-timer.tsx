"use client"

import { useEffect, useState } from "react"
import { Clock, Truck, Zap } from "lucide-react"

export function DispatchTimer() {
  const [mounted, setMounted] = useState(false)
  const [timeLeft, setTimeLeft] = useState<{
    hours: string
    minutes: string
    seconds: string
    isSameDay: boolean
  }>({
    hours: "00",
    minutes: "00",
    seconds: "00",
    isSameDay: true,
  })

  useEffect(() => {
    setMounted(true)

    const calculateTime = () => {
      const now = new Date()
      // Cutoff time: 5:00 PM (17:00) PKT
      const cutoff = new Date()
      cutoff.setHours(17, 0, 0, 0)

      if (now.getTime() > cutoff.getTime()) {
        // Cutoff passed for today, countdown to tomorrow's cutoff
        const tomorrowCutoff = new Date(cutoff)
        tomorrowCutoff.setDate(tomorrowCutoff.getDate() + 1)
        const diff = Math.max(0, tomorrowCutoff.getTime() - now.getTime())
        const totalSec = Math.floor(diff / 1000)
        setTimeLeft({
          hours: String(Math.floor(totalSec / 3600)).padStart(2, "0"),
          minutes: String(Math.floor((totalSec % 3600) / 60)).padStart(2, "0"),
          seconds: String(totalSec % 60).padStart(2, "0"),
          isSameDay: false,
        })
      } else {
        const diff = Math.max(0, cutoff.getTime() - now.getTime())
        const totalSec = Math.floor(diff / 1000)
        setTimeLeft({
          hours: String(Math.floor(totalSec / 3600)).padStart(2, "0"),
          minutes: String(Math.floor((totalSec % 3600) / 60)).padStart(2, "0"),
          seconds: String(totalSec % 60).padStart(2, "0"),
          isSameDay: true,
        })
      }
    }

    calculateTime()
    const interval = setInterval(calculateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  if (!mounted) {
    return (
      <div className="mt-3.5 flex items-center gap-2 rounded-xl border border-border/60 bg-muted/40 px-3.5 py-2.5 text-xs text-muted-foreground">
        <Truck className="size-4 text-brand shrink-0" />
        <span>Karachi Flat Delivery: Rs. 500 · Quick Dispatch</span>
      </div>
    )
  }

  return (
    <div className="mt-3.5 overflow-hidden rounded-xl border border-emerald-500/25 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent p-3 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
          </span>
          <span className="text-xs font-bold text-foreground">
            {timeLeft.isSameDay ? (
              <>Order within next for <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">Same-Day Dispatch!</span></>
            ) : (
              <>Order now for <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">Next-Morning Dispatch!</span></>
            )}
          </span>
        </div>

        {/* Countdown Badge */}
        <div className="inline-flex items-center gap-1.5 rounded-lg bg-background/80 px-2 py-1 font-mono text-xs font-bold text-foreground border border-border/60 shadow-xs tabular-nums">
          <Clock className="size-3 text-emerald-600 dark:text-emerald-400" />
          <span className="text-emerald-600 dark:text-emerald-400">{timeLeft.hours}h</span>
          <span className="text-muted-foreground/40">:</span>
          <span className="text-emerald-600 dark:text-emerald-400">{timeLeft.minutes}m</span>
          <span className="text-muted-foreground/40">:</span>
          <span className="text-emerald-600 dark:text-emerald-400">{timeLeft.seconds}s</span>
        </div>
      </div>

      <div className="mt-1.5 flex items-center gap-2 text-[0.7rem] text-muted-foreground">
        <Truck className="size-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span>Karachi: Rs. 500 flat door-to-door courier · Cash on Delivery available</span>
      </div>
    </div>
  )
}
