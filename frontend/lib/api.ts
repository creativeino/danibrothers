import type { ActionResult } from "@/lib/validation"

/**
 * Thin HTTP client for the FastAPI backend (`backend/`).
 *
 * Server-only: server components, server actions and route handlers call it.
 * Nothing here may reach a Client Component — the base URL comes from a
 * non-public env var, and the session token is the httpOnly cookie, which the
 * caller forwards explicitly on the server side.
 */
const BASE_URL = (process.env.API_URL ?? "http://localhost:8000").replace(/\/+$/, "")

export class ApiError extends Error {
  readonly status: number
  readonly fieldErrors?: Record<string, string>

  constructor(message: string, status: number, fieldErrors?: Record<string, string>) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

type RequestOptions = {
  body?: unknown
  /** Session JWT, sent as `Authorization: Bearer`. */
  token?: string | null
}

async function readResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) return undefined as T

  let payload: unknown = null
  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  if (!response.ok) {
    throw new ApiError(errorMessage(payload), response.status, errorFieldErrors(payload))
  }

  return payload as T
}

/**
 * FastAPI puts `HTTPException(detail=...)` under `detail`, which is either a
 * string or `{ message, fieldErrors }` — the shape every router here raises.
 */
function errorDetail(payload: unknown): unknown {
  if (!payload || typeof payload !== "object") return undefined
  return (payload as { detail?: unknown }).detail
}

function errorMessage(payload: unknown): string {
  const direct = payload && typeof payload === "object" ? (payload as { message?: unknown }).message : undefined
  if (typeof direct === "string" && direct) return direct

  const detail = errorDetail(payload)
  if (typeof detail === "string" && detail) return detail
  if (detail && typeof detail === "object") {
    const message = (detail as { message?: unknown }).message
    if (typeof message === "string" && message) return message
  }
  return "Something went wrong on our side. Please try again."
}

function errorFieldErrors(payload: unknown): Record<string, string> | undefined {
  const direct =
    payload && typeof payload === "object" ? (payload as { fieldErrors?: unknown }).fieldErrors : undefined
  if (direct && typeof direct === "object") return direct as Record<string, string>

  const detail = errorDetail(payload)
  if (detail && typeof detail === "object") {
    const fieldErrors = (detail as { fieldErrors?: unknown }).fieldErrors
    if (fieldErrors && typeof fieldErrors === "object") return fieldErrors as Record<string, string>
  }
  return undefined
}

async function request<T>(method: string, path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { accept: "application/json" }
  if (options.body !== undefined) headers["content-type"] = "application/json"
  if (options.token) headers.authorization = `Bearer ${options.token}`

  let response: Response
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      // Everything reading from the API renders per-request (the storefront
      // pages are force-dynamic) — never let Next cache a stale catalogue.
      cache: "no-store",
    })
  } catch {
    throw new ApiError("Can't reach the server right now. Please try again.", 503)
  }

  return readResponse<T>(response)
}

/**
 * Multipart POST. The browser sets the `multipart/form-data` boundary itself,
 * so `content-type` must stay unset — see `request` above, which always sets
 * it for JSON bodies.
 */
async function upload<T>(path: string, form: FormData, token?: string | null): Promise<T> {
  const headers: Record<string, string> = { accept: "application/json" }
  if (token) headers.authorization = `Bearer ${token}`

  let response: Response
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers,
      body: form,
      cache: "no-store",
    })
  } catch {
    throw new ApiError("Can't reach the server right now. Please try again.", 503)
  }

  return readResponse<T>(response)
}

export const api = {
  get: <T>(path: string, token?: string | null) => request<T>("GET", path, { token }),
  post: <T>(path: string, body?: unknown, token?: string | null) =>
    request<T>("POST", path, { body, token }),
  patch: <T>(path: string, body?: unknown, token?: string | null) =>
    request<T>("PATCH", path, { body, token }),
  delete: <T>(path: string, token?: string | null) => request<T>("DELETE", path, { token }),
  upload: <T>(path: string, form: FormData, token?: string | null) => upload<T>(path, form, token),
}

/** `unknown` → the failure half of `ActionResult`, ready to return from an action. */
export function toActionResult(error: unknown): Extract<ActionResult, { ok: false }> {
  if (error instanceof ApiError) {
    return { ok: false, message: error.message, fieldErrors: error.fieldErrors }
  }
  return { ok: false, message: "Something went wrong. Please try again." }
}
