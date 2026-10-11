import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { AuthShell } from "@/components/auth/auth-shell"
import { RegisterForm } from "@/components/auth/register-form"
import { getSession } from "@/lib/auth"
import { safeNext } from "@/lib/validation"

export const metadata: Metadata = {
  title: "Create an account",
  robots: { index: false, follow: false },
}

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  const rawNext = Array.isArray(sp.next) ? sp.next[0] : sp.next
  const next = safeNext(rawNext ?? "")

  const session = await getSession()
  if (session) redirect(next)

  return (
    <AuthShell
      title={next.startsWith("/checkout") ? "Create account to checkout" : "Create your account"}
      subtitle={
        next.startsWith("/checkout")
          ? "An account is required to place and track your order (both for Cash on Delivery and Bank Transfer)."
          : "It takes a moment, and it keeps your order history and warranty claims in one place."
      }
    >
      <RegisterForm next={next} />
    </AuthShell>
  )
}
