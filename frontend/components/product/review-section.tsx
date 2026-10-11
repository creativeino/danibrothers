"use client"

import { useState } from "react"
import { useReviews } from "@/lib/reviews"
import { Star, MessageSquarePlus } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

function StarRating({
  value,
  onChange,
  readonly = false,
  size = "md",
}: {
  value: number
  onChange?: (v: number) => void
  readonly?: boolean
  size?: "sm" | "md"
}) {
  const [hover, setHover] = useState(0)
  const starSize = size === "sm" ? "size-3.5" : "size-5"

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => setHover(0)}
          className={cn(
            "transition-colors",
            readonly ? "cursor-default" : "cursor-pointer",
          )}
        >
          <Star
            className={cn(
              starSize,
              (hover || value) >= star
                ? "fill-amber-400 text-amber-400"
                : "fill-muted text-muted-foreground/30",
            )}
          />
        </button>
      ))}
    </div>
  )
}

export function ReviewSection({ productId }: { productId: string }) {
  const getByProduct = useReviews((s) => s.getByProduct)
  const addReview = useReviews((s) => s.add)

  const reviews = getByProduct(productId)
  const avgRating = reviews.length === 0
    ? 4.9
    : reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length

  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState("")
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !comment.trim() || rating === 0) {
      toast.warning("Please fill all fields and select a rating")
      return
    }
    addReview({ productId, name: name.trim(), rating, comment: comment.trim() })
    toast.success("Review added!", { description: "Thanks for your feedback" })
    setName("")
    setRating(0)
    setComment("")
    setShowForm(false)
  }

  return (
    <div className="mt-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-lg bg-amber-500/10 text-amber-500">
            <Star className="size-4" />
          </span>
          <div>
            <h2 className="text-base font-bold tracking-tight">Customer Reviews</h2>
            {reviews.length > 0 && (
              <div className="flex items-center gap-2 mt-0.5">
                <StarRating value={avgRating} readonly size="sm" />
                <span className="text-xs text-muted-foreground">
                  {avgRating.toFixed(1)} ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
                </span>
              </div>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand/10 px-3 py-2 text-xs font-semibold text-brand transition-all hover:bg-brand/20"
        >
          <MessageSquarePlus className="size-3.5" />
          Write a review
        </button>
      </div>

      {/* Review Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mt-5 rounded-2xl border border-border/50 bg-card p-5">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">Your rating</label>
              <StarRating value={rating} onChange={setRating} />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm outline-none focus:border-brand/40 focus:ring-2 focus:ring-brand/10"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">Comment</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="How was your experience?"
                rows={3}
                className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm outline-none resize-none focus:border-brand/40 focus:ring-2 focus:ring-brand/10"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="rounded-lg bg-brand px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-brand/90"
              >
                Submit review
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-border px-4 py-2 text-xs font-semibold text-muted-foreground transition-all hover:bg-muted"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Reviews List */}
      {reviews.length === 0 && !showForm ? (
        <p className="mt-5 text-sm text-muted-foreground text-center py-8">
          No reviews yet. Be the first to review this product!
        </p>
      ) : (
        <div className="mt-5 space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-xl border border-border/50 bg-card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="grid size-8 place-items-center rounded-full bg-brand/10 text-xs font-bold text-brand">
                    {review.name.charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-semibold text-foreground">
                        {review.name}
                        {review.location && (
                          <span className="ml-1 text-xs font-normal text-muted-foreground">
                            ({review.location})
                          </span>
                        )}
                      </p>
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/10 px-1.5 py-0.2 text-[0.62rem] font-medium text-emerald-600 dark:text-emerald-400">
                        Verified Purchase
                      </span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2">
                      <StarRating value={review.rating} readonly size="sm" />
                      <span className="text-[0.6875rem] font-semibold text-foreground/80 tnum">
                        {review.rating}.0
                      </span>
                    </div>
                  </div>
                </div>
                <span className="text-[0.65rem] text-muted-foreground">
                  {new Date(review.date).toLocaleDateString("en-PK", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground/80">
                {review.comment}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
