"use client"

import { motion, useReducedMotion, type HTMLMotionProps } from "motion/react"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

const EASE = [0.22, 1, 0.36, 1] as const

type RevealProps = Omit<HTMLMotionProps<"div">, "children"> & {
  children: ReactNode
  /** Seconds to wait before starting. Use for manually sequencing a few items. */
  delay?: number
  /** Distance in px the element rises from. */
  y?: number
}

/**
 * Fades and lifts its children into view once. For lists, prefer `Stagger` —
 * it derives the delay from the child index so you don't hand-tune numbers.
 */
export function Reveal({ children, className, delay = 0, y = 16, ...props }: RevealProps) {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) return <div className={className}>{children}</div>

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, delay, ease: EASE }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

type StaggerProps = {
  children: ReactNode
  className?: string
  /** Seconds between each child. */
  gap?: number
  delay?: number
}

export function Stagger({ children, className, gap = 0.07, delay = 0 }: StaggerProps) {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) return <div className={className}>{children}</div>

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: gap, delayChildren: delay } },
      }}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({
  children,
  className,
  y = 16,
}: {
  children: ReactNode
  className?: string
  y?: number
}) {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) return <div className={className}>{children}</div>

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
      }}
    >
      {children}
    </motion.div>
  )
}

/**
 * Word-by-word entrance for the hero headline. Splitting on spaces keeps this
 * dependency-free, and `aria-label` preserves the sentence for screen readers
 * that would otherwise read it one fragment at a time.
 */
export function RevealText({
  text,
  className,
  delay = 0,
}: {
  text: string
  className?: string
  delay?: number
}) {
  const reduceMotion = useReducedMotion()
  const words = text.split(" ")

  if (reduceMotion) return <span className={cn(className)}>{text}</span>

  return (
    <span className={cn("inline-block", className)} aria-label={text}>
      {words.map((word, index) => (
        <span key={`${word}-${index}`} className="inline-block overflow-hidden align-bottom">
          <motion.span
            className="inline-block"
            aria-hidden
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.7, delay: delay + index * 0.06, ease: EASE }}
          >
            {word}
            {index < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </span>
  )
}
