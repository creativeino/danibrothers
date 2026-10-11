"use server"

import { revalidatePath } from "next/cache"
import { api, toActionResult } from "@/lib/api"
import { isEmail, isPhone, minLength, str, type ActionResult } from "@/lib/validation"

const INQUIRY_TYPES = ["SELL_DEVICE", "GENERAL", "REPAIR", "BULK"] as const
const DEVICE_CONDITIONS = ["WORKING", "MINOR_FAULT", "FAULTY", "UNKNOWN"] as const

export async function submitInquiryAction(
  _prev: ActionResult | null,
  form: FormData,
): Promise<ActionResult> {
  const typeRaw = str(form, "type")
  const type = (INQUIRY_TYPES as readonly string[]).includes(typeRaw) ? typeRaw : "GENERAL"

  const name = str(form, "name")
  const phone = str(form, "phone")
  const email = str(form, "email")
  const device = str(form, "device")
  const conditionRaw = str(form, "condition")
  const message = str(form, "message")

  const fieldErrors: Record<string, string> = {}
  if (!minLength(name, 2)) fieldErrors.name = "Tell us your name."
  if (!isPhone(phone)) fieldErrors.phone = "Enter a valid Pakistani mobile number."
  if (email && !isEmail(email)) fieldErrors.email = "That email address doesn't look right."
  if (type === "SELL_DEVICE" && !minLength(device, 2)) {
    fieldErrors.device = "Which make and model is it?"
  }
  if (conditionRaw && !(DEVICE_CONDITIONS as readonly string[]).includes(conditionRaw)) {
    fieldErrors.condition = "Pick one of the listed conditions."
  }
  if (!minLength(message, 5)) fieldErrors.message = "Add a little detail so we can help."

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, message: "Please check the highlighted fields.", fieldErrors }
  }

  try {
    const result = await api.post<{ ok: boolean; message: string }>("/api/inquiries", {
      type,
      name,
      phone,
      email: email || null,
      device: device || null,
      condition: conditionRaw || null,
      message,
    })

    revalidatePath("/admin/inquiries")
    return { ok: true, message: result.message }
  } catch (error) {
    return toActionResult(error)
  }
}
