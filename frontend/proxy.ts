import { NextResponse, type NextRequest } from "next/server"
import { jwtVerify } from "jose"
import { SESSION_COOKIE_NAME } from "@/lib/session"

/**
 * Route guard.
 *
 * Next.js 16 renamed `middleware.ts` to `proxy.ts`; the runtime is Node, so
 * verifying the session JWT here costs a signature check and nothing more. No
 * database call happens in the proxy — it runs before rendering and should stay
 * cheap, so this confirms the token is ours and reads the role out of it. The
 * pages that actually write data re-check against the database.
 */
async function readSession(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value
  if (!token) return null

  const secret = process.env.AUTH_SECRET
  if (!secret) return null

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret))
    if (typeof payload.id !== "string") return null
    return { role: payload.role === "ADMIN" ? ("ADMIN" as const) : ("CUSTOMER" as const) }
  } catch {
    // Expired or tampered — treat as anonymous.
    return null
  }
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const session = await readSession(request)

  if (pathname.startsWith("/admin")) {
    if (!session) {
      const url = new URL("/login", request.url)
      url.searchParams.set("next", `${pathname}${search}`)
      return NextResponse.redirect(url)
    }
    // Signed in but not staff: send them somewhere useful rather than a 403
    // page they can do nothing about.
    if (session.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/account", request.url))
    }
    return NextResponse.next()
  }

  // Checkout is signed-in only — a guest order has no account to attach to,
  // so the cart waits here until they come back with a session.
  if (pathname.startsWith("/checkout") && !session) {
    const url = new URL("/login", request.url)
    url.searchParams.set("next", `${pathname}${search}`)
    return NextResponse.redirect(url)
  }

  if (pathname.startsWith("/account") && !session) {
    const url = new URL("/login", request.url)
    url.searchParams.set("next", `${pathname}${search}`)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*", "/checkout/:path*"],
}
