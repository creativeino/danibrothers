"use client"

import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"
import { useSyncExternalStore } from "react"
import { cn } from "@/lib/utils"

// Hydration guard: false on the server and during the first client render,
// true afterwards. Unlike a `useState` + `useEffect` pair this never calls
// setState from an effect.
const subscribe = () => () => {}
const getSnapshot = () => true
const getServerSnapshot = () => false

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  if (!mounted) {
    return (
      <div className={cn("grid size-9 place-items-center rounded-full", className)}>
        <Sun className="size-4 text-muted-foreground/40" />
      </div>
    )
  }

  const isDark = theme === "dark"

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
        className,
      )}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  )
}
