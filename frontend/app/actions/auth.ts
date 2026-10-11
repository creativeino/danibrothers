"use server"

import { redirect } from "next/navigation"
import { destroySession, setSessionToken } from "@/lib/auth"
import { api, toActionResult } from "@/lib/api"
import { isEmail, minLength, safeNext, str, type ActionResult } from "@/lib/validation"

type AuthResponse = { token: string; user: { id: string; role: string } }

export async function loginAction(
  _prev: ActionResult | null,
  form: FormData,
): Promise<ActionResult> {
  const email = str(form, "email").toLowerCase()
  const password = str(form, "password")
  const next = safeNext(str(form, "next"))

  if (!email || !password) {
    return {
      ok: false,
      message: "Enter your email and password.",
      fieldErrors: {
        ...(email ? {} : { email: "Email is required." }),
        ...(password ? {} : { password: "Password is required." }),
      },
    }
  }

  let token: string
  try {
    const result = await api.post<AuthResponse>("/api/auth/login", { email, password })
    token = result.token
  } catch (error) {
    return toActionResult(error)
  }

  await setSessionToken(token)
  redirect(next)
}

export async function registerAction(
  _prev: ActionResult | null,
  form: FormData,
): Promise<ActionResult> {
  const name = str(form, "name")
  const email = str(form, "email").toLowerCase()
  const password = str(form, "password")
  const phone = str(form, "phone")
  const next = safeNext(str(form, "next"))

  const fieldErrors: Record<string, string> = {}
  if (!minLength(name, 2)) fieldErrors.name = "Tell us your name."
  if (!isEmail(email)) fieldErrors.email = "That email address doesn't look right."
  if (!minLength(password, 8)) fieldErrors.password = "Use at least 8 characters."
  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, message: "Please fix the highlighted fields.", fieldErrors }
  }

  let token: string
  try {
    const result = await api.post<AuthResponse>(
      "/api/auth/register",
      { name, email, password, phone: phone || null },
    )
    token = result.token
  } catch (error) {
    return toActionResult(error)
  }

  await setSessionToken(token)
  redirect(next)
}

export async function logoutAction(): Promise<void> {
  await destroySession()
  redirect("/")
}
