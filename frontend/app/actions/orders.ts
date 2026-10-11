"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { ApiError, api, toActionResult } from "@/lib/api"
import { sessionToken } from "@/lib/auth"
import { str, type ActionResult } from "@/lib/validation"

type CartInput = { productId: string; qty: number }

/**
 * The client sends product ids and quantities — never prices. Every figure on
 * the order is read back from the database by the API, so a tampered cart
 * cannot buy a laptop for one rupee.
 */
function parseCart(raw: string): CartInput[] {
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .map((entry) => {
        if (!entry || typeof entry !== "object") return null
        const { productId, qty } = entry as { productId?: unknown; qty?: unknown }
        if (typeof productId !== "string") return null
        const quantity = Math.floor(Number(qty))
        if (!Number.isFinite(quantity) || quantity < 1) return null
        return { productId, qty: Math.min(quantity, 99) }
      })
      .filter((v): v is CartInput => v !== null)
  } catch {
    return []
  }
}

/**
 * Stores a bank-transfer receipt and returns its `/uploads/...` path, which the
 * checkout form then submits inside the hidden `paymentProof` field.
 *
 * No session check: the customer picks the file while filling the form, which
 * is before the order is placed. The path is only a link — the order itself
 * still requires a valid session.
 */
export async function uploadPaymentProofAction(form: FormData): Promise<ActionResult> {
  const file = form.get("file")
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Choose a screenshot or photo of the payment first." }
  }

  try {
    const body = new FormData()
    body.append("file", file, file.name)
    const uploaded = await api.upload<{ url: string }>("/api/orders/payment-proof", body)
    if (!uploaded?.url) return { ok: false, message: "The upload didn't come back. Try again." }
    return { ok: true, data: { url: uploaded.url } }
  } catch (error) {
    return toActionResult(error)
  }
}

/**
 * Attaches a payment slip / screenshot directly to an existing placed order.
 */
export async function attachPaymentSlipAction(orderId: string, form: FormData): Promise<ActionResult> {
  const file = form.get("file")
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Please select a payment receipt or screenshot to upload." }
  }

  try {
    const body = new FormData()
    body.append("file", file, file.name)
    const res = await api.upload<{ ok: boolean; url: string; message: string }>(
      `/api/orders/${orderId}/payment-proof`,
      body,
    )
    if (!res?.url) {
      return { ok: false, message: "Upload failed. Please try again." }
    }
    revalidatePath(`/order/${orderId}`)
    revalidatePath(`/admin/orders/${orderId}`)
    return { ok: true, data: { url: res.url }, message: "Payment slip attached successfully!" }
  } catch (error) {
    return toActionResult(error)
  }
}

export async function placeOrderAction(
  _prev: ActionResult | null,
  form: FormData,
): Promise<ActionResult> {
  // Checkout is signed-in only: no session means the login page, with a
  // promise to come straight back here once they're in.
  const token = await sessionToken()
  if (!token) redirect("/login?next=%2Fcheckout")

  const cart = parseCart(str(form, "cart"))
  if (cart.length === 0) {
    return { ok: false, message: "Your cart is empty." }
  }

  const paymentMethod = str(form, "paymentMethod") === "BANK_TRANSFER" ? "BANK_TRANSFER" : "COD"
  const paymentProof = str(form, "paymentProof")

  if (paymentMethod === "BANK_TRANSFER" && !paymentProof) {
    return {
      ok: false,
      message: "Payment receipt is required for bank transfer. Please upload your receipt to place the order.",
      fieldErrors: { paymentProof: "Payment receipt upload is required" },
    }
  }

  const payload = {
    cart,
    customerName: str(form, "customerName"),
    phone: str(form, "phone"),
    email: str(form, "email") || null,
    address: str(form, "address"),
    city: str(form, "city"),
    notes: str(form, "notes") || null,
    paymentMethod,
    // Only a bank transfer carries a receipt, and only a path the API handed
    // out is accepted — the backend re-checks the shape either way.
    paymentProof: paymentMethod === "BANK_TRANSFER" && paymentProof ? paymentProof : null,
  }

  let orderId: string
  try {
    const order = await api.post<{ id: string }>("/api/orders", payload, token)
    orderId = order.id
  } catch (error) {
    // Cookie present but rejected (expired/rotated secret) — same destination
    // as having no cookie at all.
    if (error instanceof ApiError && error.status === 401) {
      redirect("/login?next=%2Fcheckout")
    }
    return toActionResult(error)
  }

  revalidatePath("/admin")
  revalidatePath("/admin/orders")
  redirect(`/order/${orderId}`)
}
