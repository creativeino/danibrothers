export const site = {
  name: "Dani Brothers",
  tagline: "Computers, laptops, CCTV & accessories",
  description:
    "Buy new and certified pre-owned laptops, desktops, CCTV security cameras and computer accessories — with warranty, honest pricing and fast delivery across Karachi (Rs. 500 flat).",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  phone: "+92 345 291 6412",
  phoneHref: "tel:+923452916412",
  email: "hello@danibrothers.com",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP ?? "923452916412",
  address: "Shop 12-A, Main Commercial Market, Gulshan-e-Maymar, Karachi",
  hours: "Mon–Sat, 11:00 AM – 9:00 PM",
  since: 2009,

  /*
   * Fill these in when the shop has the accounts. The footer renders only the
   * ones with a URL, so an unset value hides the button rather than shipping a
   * link that goes nowhere.
   */
  social: {
    // Typed as plain `string`, not the literal "", so the footer's `&&` guard
    // stays a real runtime check rather than something the compiler folds away.
    facebook: "https://facebook.com/danibrothers",
    instagram: "https://instagram.com/danibrothers",
  },
} as const

/** `to` overrides the shop number — used by the admin to message a customer. */
export function whatsappLink(message?: string, to?: string): string {
  const base = `https://wa.me/${to || site.whatsapp}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}

export const CONDITIONS = ["NEW", "REFURBISHED", "USED"] as const
export type Condition = (typeof CONDITIONS)[number]

export const CONDITION_LABEL: Record<Condition, string> = {
  NEW: "Brand New",
  REFURBISHED: "Refurbished",
  USED: "Pre-Owned",
}

export const CONDITION_DESCRIPTION: Record<Condition, string> = {
  NEW: "Sealed box, full manufacturer warranty.",
  REFURBISHED: "Professionally restored, tested.",
  USED: "Pre-owned, inspected and graded. Sold as-is with 15-day check warranty.",
}

export const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const
export type OrderStatus = (typeof ORDER_STATUSES)[number]

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
}

/** Fixed delivery fee for Karachi orders. */
export const KARACHI_DELIVERY_FEE = 500

/** Checks if a city is Karachi (case-insensitive). */
export function isKarachi(city?: string | null): boolean {
  if (!city) return false
  const clean = city.trim().toLowerCase()
  return clean === "karachi" || clean.startsWith("karachi")
}

export const SHIPPING_FLAT = 500

/**
 * Where bank-transfer customers send the money.
 *
 * `accountTitle`, `accountNumber` and `iban` ship empty on purpose: until the
 * shop confirms them, checkout shows "we'll send the details on WhatsApp"
 * rather than an account the customer could pay into by mistake. Fill them in
 * as plain strings and every surface (checkout, the order receipt, the admin
 * order page) picks them up — nothing else needs touching.
 */
export const bankTransfer = {
  bankName: "Meezan Bank",
  accountTitle: "",
  accountNumber: "",
  iban: "",
  branch: "",
}

/** True once the account above has been filled in. */
export function hasBankDetails(): boolean {
  return bankTransfer.accountNumber.trim() !== "" || bankTransfer.iban.trim() !== ""
}

/** `2020 1010 1234 5678` — groups a long account number so it's readable. */
export function groupDigits(value: string, size = 4): string {
  const clean = value.replace(/\s+/g, "")
  return clean.replace(new RegExp(`(.{${size}})`, "g"), "$1 ").trim()
}
