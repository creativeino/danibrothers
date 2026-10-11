import { NextResponse } from "next/server"

const BASE_URL = (process.env.API_URL ?? "http://localhost:8000").replace(/\/+$/, "")

/**
 * Proxies the catalogue query straight to FastAPI. The response keeps the raw
 * row shape (`images`/`specs` as JSON strings) — that is what the paginated
 * grid's `toView` parser expects.
 */
export async function GET(request: Request) {
  const { search } = new URL(request.url)

  let response: Response
  try {
    response = await fetch(`${BASE_URL}/api/products${search}`, { cache: "no-store" })
  } catch {
    return NextResponse.json(
      { products: [], total: 0, page: 1, perPage: 12, pageCount: 1 },
      { status: 503 },
    )
  }

  const payload = await response.json().catch(() => null)
  return NextResponse.json(payload, { status: response.status })
}
