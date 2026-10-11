"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { api, toActionResult } from "@/lib/api"
import { requireAdmin, sessionToken } from "@/lib/auth"
import { ORDER_STATUSES } from "@/lib/site"
import {
  bool,
  linesToJson,
  minLength,
  num,
  pairsToJson,
  slugify,
  str,
  type ActionResult,
} from "@/lib/validation"

/**
 * Every action here re-checks the caller on this side, and the API checks
 * again with the same JWT.
 *
 * `proxy.ts` already blocks /admin, but a Server Action is a public HTTP
 * endpoint — it can be invoked without ever loading an admin page. The role
 * check has to live with the mutation, not only in front of the UI.
 */
async function guard() {
  try {
    return await requireAdmin()
  } catch {
    return null
  }
}

const DENIED: ActionResult = { ok: false, message: "You don't have permission to do that." }

function revalidateCatalogue(slug?: string) {
  revalidatePath("/")
  revalidatePath("/shop")
  revalidatePath("/admin/products")
  if (slug) revalidatePath(`/product/${slug}`)
}

export async function saveProductAction(
  _prev: ActionResult | null,
  form: FormData,
): Promise<ActionResult> {
  if (!(await guard())) return DENIED

  const id = str(form, "id")
  const name = str(form, "name")
  const brand = str(form, "brand")
  const description = str(form, "description")
  const categoryId = str(form, "categoryId")
  const price = num(form, "price")
  const compareAtRaw = str(form, "compareAtPrice")
  const stock = num(form, "stock")
  const conditionRaw = str(form, "condition")
  const condition = ["NEW", "REFURBISHED", "USED"].includes(conditionRaw) ? conditionRaw : "NEW"
  const featured = bool(form, "featured")
  const requestedSlug = slugify(str(form, "slug") || name)

  const fieldErrors: Record<string, string> = {}
  if (!minLength(name, 3)) fieldErrors.name = "Give the product a name."
  if (!minLength(brand, 1)) fieldErrors.brand = "Which brand is it?"
  if (!minLength(description, 20)) fieldErrors.description = "A sentence or two, at least."
  if (!categoryId) fieldErrors.categoryId = "Pick a category."
  if (!Number.isFinite(price) || price < 0) fieldErrors.price = "Enter a price in rupees."
  if (!Number.isFinite(stock) || stock < 0) fieldErrors.stock = "Stock can't be negative."
  if (!requestedSlug) fieldErrors.slug = "That name doesn't produce a usable URL."

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, message: "Please check the highlighted fields.", fieldErrors }
  }

  const compareAt = compareAtRaw === "" ? null : Number(compareAtRaw)
  if (compareAt != null && (!Number.isFinite(compareAt) || compareAt < 0)) {
    return {
      ok: false,
      message: "Check the highlighted fields.",
      fieldErrors: { compareAtPrice: "Leave it blank, or enter a price above the selling price." },
    }
  }

  const payload = {
    id: id || null,
    name,
    slug: requestedSlug,
    brand,
    description,
    price: Math.round(price),
    compareAtPrice: compareAt == null ? null : Math.round(compareAt),
    stock: Math.round(stock),
    condition,
    featured,
    categoryId,
    images: linesToJson(str(form, "images")),
    specs: pairsToJson(str(form, "specs")),
  }

  try {
    const token = await sessionToken()
    if (id) {
      await api.patch(`/api/admin/products/${id}`, payload, token)
    } else {
      await api.post("/api/admin/products", payload, token)
    }
  } catch (error) {
    // Duplicate slugs, category gone, session expired — the API's message and
    // `fieldErrors` land in the form banner as-is.
    return toActionResult(error)
  }

  revalidateCatalogue(requestedSlug)
  redirect("/admin/products?saved=1")
}

/**
 * Saves one image to the API's /uploads directory and hands back the path to
 * paste into the product. The file travels as multipart; the API stores it
 * under a generated name, so nothing from the client's filename is trusted.
 */
export async function uploadImageAction(form: FormData): Promise<ActionResult> {
  if (!(await guard())) return DENIED

  const file = form.get("file")
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Choose an image first." }
  }

  try {
    const body = new FormData()
    body.append("file", file, file.name)
    const uploaded = await api.upload<{ url: string }>(
      "/api/admin/uploads",
      body,
      await sessionToken(),
    )
    if (!uploaded?.url) return { ok: false, message: "The upload didn't come back. Try again." }
    return { ok: true, data: { url: uploaded.url } }
  } catch (error) {
    return toActionResult(error)
  }
}

export async function deleteProductAction(form: FormData): Promise<void> {
  if (!(await guard())) return
  const id = str(form, "id")
  if (!id) return

  try {
    // Order history keeps its own snapshot of name/price, so removing a
    // product does not damage past orders.
    await api.delete(`/api/admin/products/${id}`, await sessionToken())
  } catch {
    return
  }
  revalidateCatalogue()
}

export async function toggleFeaturedAction(form: FormData): Promise<void> {
  if (!(await guard())) return
  const id = str(form, "id")
  if (!id) return

  let slug: string | undefined
  try {
    const product = await api.patch<{ slug: string }>(
      `/api/admin/products/${id}/featured`,
      undefined,
      await sessionToken(),
    )
    slug = product.slug
  } catch {
    return
  }
  revalidateCatalogue(slug)
}

export async function updateStockAction(form: FormData): Promise<void> {
  if (!(await guard())) return
  const id = str(form, "id")
  const stock = num(form, "stock")
  if (!id || !Number.isFinite(stock) || stock < 0) return

  try {
    await api.patch(`/api/admin/products/${id}/stock`, { stock: Math.round(stock) }, await sessionToken())
  } catch {
    return
  }
  revalidateCatalogue()
}

export async function updateOrderStatusAction(form: FormData): Promise<void> {
  if (!(await guard())) return

  const id = str(form, "id")
  const status = str(form, "status")
  if (!id || !(ORDER_STATUSES as readonly string[]).includes(status)) return

  try {
    await api.patch(`/api/admin/orders/${id}/status`, { status }, await sessionToken())
  } catch {
    return
  }

  revalidatePath("/admin/orders")
  revalidatePath(`/admin/orders/${id}`)
  revalidatePath("/account")
  revalidateCatalogue()
}

/** Marks a lead from the contact / sell-your-device forms as dealt with. */
export async function toggleInquiryAction(form: FormData): Promise<void> {
  if (!(await guard())) return
  const id = str(form, "id")
  if (!id) return

  try {
    await api.patch(`/api/admin/inquiries/${id}/toggle`, undefined, await sessionToken())
  } catch {
    return
  }
  revalidatePath("/admin/inquiries")
}
