import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "@/lib/session"

const COOKIE_NAME = SESSION_COOKIE_NAME
const MAX_AGE_SECONDS = SESSION_MAX_AGE_SECONDS

export type SessionUser = {
  id: string
  name: string
  email: string
  role: "CUSTOMER" | "ADMIN"
}

function secretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET
  if (!secret) {
    throw new Error("AUTH_SECRET is not set. Copy .env.example to .env and fill it in.")
  }
  return new TextEncoder().encode(secret)
}

/**
 * The backend signs the session JWT (HS256, shared `AUTH_SECRET`) and hands it
 * back from login/register. All this side does is park it in the httpOnly
 * cookie that `proxy.ts` reads — so the signature is created in exactly one
 * place.
 */
export async function setSessionToken(token: string): Promise<void> {
  const store = await cookies()
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  })
}

/** The raw token, for forwarding to the backend as `Authorization: Bearer`. */
export async function sessionToken(): Promise<string | null> {
  const store = await cookies()
  return store.get(COOKIE_NAME)?.value ?? null
}

export async function destroySession(): Promise<void> {
  const store = await cookies()
  store.delete(COOKIE_NAME)
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey())
    if (typeof payload.id !== "string" || typeof payload.email !== "string") return null
    return {
      id: payload.id,
      name: typeof payload.name === "string" ? payload.name : "",
      email: payload.email,
      role: payload.role === "ADMIN" ? "ADMIN" : "CUSTOMER",
    }
  } catch {
    // Expired or tampered token — treat as signed out rather than throwing.
    return null
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies()
  const token = store.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifySessionToken(token)
}

/**
 * Reads the session cookie. The token itself carries the user's identity, so
 * no database round-trip is needed here — the backend re-checks against the
 * database on every mutation.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  return getSession()
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser()
  if (!user) throw new Error("UNAUTHORIZED")
  return user
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser()
  if (user.role !== "ADMIN") throw new Error("FORBIDDEN")
  return user
}
