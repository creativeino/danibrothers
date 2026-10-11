/**
 * Small hand-rolled validators.
 *
 * The forms here are short and the rules are business rules, not schema
 * gymnastics, so a dependency-free validator keeps the failure messages
 * readable and the bundle small. Every function returns the *first* problem
 * with a message meant to be shown to the person filling the form.
 */

export type FieldErrors<T extends string = string> = Partial<Record<T, string>>

export type ActionResult =
  | { ok: true; message?: string; redirectTo?: string; data?: Record<string, string> }
  | { ok: false; message: string; fieldErrors?: Record<string, string> }

export function str(form: FormData, key: string): string {
  const value = form.get(key)
  return typeof value === "string" ? value.trim() : ""
}

export function num(form: FormData, key: string): number {
  const raw = str(form, key)
  return raw === "" ? Number.NaN : Number(raw)
}

export function bool(form: FormData, key: string): boolean {
  const value = form.get(key)
  return value === "on" || value === "true" || value === "1"
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
/** Pakistani mobile numbers, with or without country code and separators. */
const PHONE_RE = /^(?:\+?92|0)?3\d{2}[\s-]?\d{7}$/

export function isEmail(value: string): boolean {
  return EMAIL_RE.test(value)
}

export function isPhone(value: string): boolean {
  return PHONE_RE.test(value.replace(/[\s()-]/g, ""))
}

export function minLength(value: string, n: number): boolean {
  return value.length >= n
}

/** Characters left over after removing anything that isn't a digit. */
export function digits(value: string): string {
  return value.replace(/\D/g, "")
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80)
}

/**
 * Turns a newline-separated textarea into a JSON string for a SQLite text
 * column. `lines` keeps one entry per row; `pairs` expects `Label: value`.
 */
export function linesToJson(value: string): string {
  const items = value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
  return JSON.stringify(items)
}

export function pairsToJson(value: string): string {
  const items = value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const at = line.indexOf(":")
      if (at === -1) return { label: line, value: "" }
      return { label: line.slice(0, at).trim(), value: line.slice(at + 1).trim() }
    })
  return JSON.stringify(items)
}

/** Reverses `pairsToJson` so the admin edit form can show existing specs. */
export function jsonToPairs(raw: string): string {
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return ""
    return parsed
      .map((entry) => {
        if (!entry || typeof entry !== "object") return ""
        const { label, value } = entry as { label?: unknown; value?: unknown }
        return `${String(label ?? "")}: ${String(value ?? "")}`
      })
      .filter(Boolean)
      .join("\n")
  } catch {
    return ""
  }
}

export function jsonToLines(raw: string): string {
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return ""
    return parsed.filter((v): v is string => typeof v === "string").join("\n")
  } catch {
    return ""
  }
}

/**
 * Only same-site destinations are honoured. Without this, `?next=https://evil`
 * turns a login form into an open redirect.
 */
export function safeNext(value: string, fallback = "/account"): string {
  if (!value.startsWith("/") || value.startsWith("//")) return fallback
  return value
}
