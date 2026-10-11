import { NextResponse } from "next/server"

const BASE_URL = (process.env.API_URL ?? "http://localhost:8000").replace(/\/+$/, "")

/** Header search box — same contract as before: `{ products: [...] }`. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q")?.trim()

  if (!q || q.length < 2) {
    return NextResponse.json({ products: [] })
  }

  try {
    const response = await fetch(`${BASE_URL}/api/search?q=${encodeURIComponent(q)}`, {
      cache: "no-store",
    })
    const payload = await response.json()
    return NextResponse.json(payload, { status: response.status })
  } catch {
    return NextResponse.json({ products: [] })
  }
}
