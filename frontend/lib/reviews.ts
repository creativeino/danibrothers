"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import {
  type Review,
  getSeedReviewsForProduct,
  getProductReviewStats,
} from "@/lib/product-reviews"

export { type Review, getSeedReviewsForProduct, getProductReviewStats }

type ReviewsState = {
  userReviews: Review[]
  add: (review: Omit<Review, "id" | "date" | "verified">) => void
  getByProduct: (productId: string) => Review[]
  getAvgRating: (productId: string) => number
  getCount: (productId: string) => number
  getSummary: (productId: string) => {
    rating: number
    count: number
    reviews: Review[]
    topReview?: Review
  }
}

export const useReviews = create<ReviewsState>()(
  persist(
    (set, get) => ({
      userReviews: [],

      add: (review) =>
        set((state) => ({
          userReviews: [
            {
              ...review,
              id: crypto.randomUUID(),
              date: new Date().toISOString(),
              verified: true,
            },
            ...state.userReviews,
          ],
        })),

      getByProduct: (productId) => {
        const userAdded = get().userReviews.filter((r) => r.productId === productId)
        const seeds = getSeedReviewsForProduct(productId)
        return [...userAdded, ...seeds]
      },

      getAvgRating: (productId) => {
        const all = get().getByProduct(productId)
        if (all.length === 0) return 4.9
        const sum = all.reduce((acc, r) => acc + r.rating, 0)
        return Number((sum / all.length).toFixed(1))
      },

      getCount: (productId) => {
        let hash = 0
        for (let i = 0; i < productId.length; i++) {
          hash = (hash << 5) - hash + productId.charCodeAt(i)
          hash |= 0
        }
        const baseCount = 14 + (Math.abs(hash) % 28)
        const userAdded = get().userReviews.filter((r) => r.productId === productId).length
        return baseCount + userAdded
      },

      getSummary: (productId) => {
        const reviews = get().getByProduct(productId)
        const rating = get().getAvgRating(productId)
        const count = get().getCount(productId)
        return {
          rating,
          count,
          reviews,
          topReview: reviews[0],
        }
      },
    }),
    {
      name: "danibrothers-reviews-v2",
    },
  ),
)
