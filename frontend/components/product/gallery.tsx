"use client"

import { useState, useCallback, useEffect } from "react"
import Image from "next/image"
import { AnimatePresence, motion } from "motion/react"
import { ProductThumb } from "@/components/product/product-thumb"
import { cn } from "@/lib/utils"
import { ZoomIn, X, ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react"

export function ProductGallery({
  images,
  alt,
  priority = true,
}: {
  images: string[]
  alt: string
  priority?: boolean
}) {
  const [index, setIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [zoom, setZoom] = useState(1)
  const active = images[index] ?? images[0] ?? null
  const hasMany = images.length > 1

  const openLightbox = useCallback(() => {
    setLightboxOpen(true)
    setZoom(1)
  }, [])

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false)
    setZoom(1)
  }, [])

  const prev = useCallback(() => {
    setIndex((i) => (i > 0 ? i - 1 : images.length - 1))
    setZoom(1)
  }, [images.length])

  const next = useCallback(() => {
    setIndex((i) => (i < images.length - 1 ? i + 1 : 0))
    setZoom(1)
  }, [images.length])

  useEffect(() => {
    if (!lightboxOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox()
      if (e.key === "ArrowLeft") prev()
      if (e.key === "ArrowRight") next()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [lightboxOpen, closeLightbox, prev, next])

  return (
    <>
      <div className="flex flex-col gap-3">
        {/* Main image */}
        <button
          type="button"
          onClick={openLightbox}
          className="group relative aspect-square overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm cursor-zoom-in"
        >
          <AnimatePresence initial={false} mode="popLayout">
            <motion.div
              key={active ?? "empty"}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="absolute inset-0"
            >
              <ProductThumb
                src={active}
                alt={alt}
                sizes="(min-width: 1024px) 42vw, 92vw"
                priority={priority}
                className="transition-transform duration-700 group-hover:scale-[1.03]"
              />
            </motion.div>
          </AnimatePresence>

          {/* Zoom hint */}
          <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 rounded-full bg-black/40 backdrop-blur-sm px-3 py-1.5 text-[0.65rem] font-medium text-white/70 opacity-0 transition-all duration-300 group-hover:opacity-100">
            <ZoomIn className="size-3" />
            Click to enlarge
          </div>

          {/* Image counter */}
          {hasMany && (
            <div className="absolute top-3 right-3 z-20 rounded-full bg-black/40 backdrop-blur-sm px-2.5 py-1 text-[0.65rem] font-semibold text-white/80 tnum">
              {index + 1} / {images.length}
            </div>
          )}
        </button>

        {/* Thumbnails */}
        {hasMany && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((image, i) => (
              <button
                key={`${image}-${i}`}
                type="button"
                onClick={() => { setIndex(i); setZoom(1) }}
                aria-label={`Show photo ${i + 1} of ${images.length}`}
                aria-current={i === index}
                className={cn(
                  "relative size-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-300 sm:size-20",
                  i === index
                    ? "border-brand shadow-md shadow-brand/15"
                    : "border-border/50 opacity-60 hover:opacity-100 hover:border-border",
                )}
              >
                <ProductThumb src={image} alt="" sizes="5rem" />
                {i === index && (
                  <div className="absolute inset-0 ring-2 ring-inset ring-brand/20 rounded-xl" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
            onClick={closeLightbox}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 grid size-10 place-items-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-all hover:bg-white/20"
            >
              <X className="size-5" />
            </button>

            {/* Nav arrows */}
            {hasMany && (
              <>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); prev() }}
                  className="absolute left-4 z-10 grid size-10 place-items-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-all hover:bg-white/20"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); next() }}
                  className="absolute right-4 z-10 grid size-10 place-items-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-all hover:bg-white/20"
                >
                  <ChevronRight className="size-5" />
                </button>
              </>
            )}

            {/* Zoom controls */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-3 py-1.5">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setZoom((z) => Math.max(1, z - 0.5)) }}
                className="grid size-7 place-items-center rounded-full bg-white/10 text-white transition-all hover:bg-white/20"
                disabled={zoom <= 1}
              >
                <Minus className="size-3.5" />
              </button>
              <span className="text-xs font-semibold text-white tnum min-w-[3rem] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setZoom((z) => Math.min(4, z + 0.5)) }}
                className="grid size-7 place-items-center rounded-full bg-white/10 text-white transition-all hover:bg-white/20"
                disabled={zoom >= 4}
              >
                <Plus className="size-3.5" />
              </button>
            </div>

            {/* Counter */}
            {hasMany && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 rounded-full bg-white/10 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-white tnum">
                {index + 1} / {images.length}
              </div>
            )}

            {/* Image */}
            <motion.div
              key={`${active}-${index}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative w-full h-full flex items-center justify-center p-16 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="relative w-full h-full max-w-4xl max-h-[80vh]"
                style={{ transform: `scale(${zoom})`, transformOrigin: "center center", transition: "transform 0.2s ease-out" }}
              >
                <Image
                  src={active ?? "/images/placeholder.png"}
                  alt={alt}
                  fill
                  sizes="90vw"
                  className="object-contain"
                  draggable={false}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
