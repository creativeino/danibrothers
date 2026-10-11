"use client"

import { useActionState, useState, type ComponentProps } from "react"
import { AlertCircle, CheckCircle2, Loader2, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { submitInquiryAction } from "@/app/actions/inquiries"
import { cn } from "@/lib/utils"
import type { ActionResult } from "@/lib/validation"

type InquiryType = "SELL_DEVICE" | "GENERAL"

const CONDITION_OPTIONS = [
  { value: "WORKING", label: "Fully working" },
  { value: "MINOR_FAULT", label: "Minor fault" },
  { value: "FAULTY", label: "Faulty / not turning on" },
  { value: "UNKNOWN", label: "Not sure" },
]

export function InquiryForm({ defaultType = "GENERAL" }: { defaultType?: InquiryType }) {
  const [type, setType] = useState<InquiryType>(defaultType)
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    submitInquiryAction,
    null,
  )

  const errors = state && !state.ok ? (state.fieldErrors ?? {}) : {}
  const selling = type === "SELL_DEVICE"

  if (state?.ok) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-success/25 bg-success-subtle/40 px-6 py-14 text-center">
        <span className="grid size-14 place-items-center rounded-full bg-success/15 text-success shadow-sm shadow-success/10">
          <CheckCircle2 className="size-7" />
        </span>
        <h2 className="mt-4 text-base font-semibold">Message received</h2>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          {state.message}
        </p>
      </div>
    )
  }

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <input type="hidden" name="type" value={type} />

      <div className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
        {(
          [
            { value: "SELL_DEVICE", label: "Sell a device" },
            { value: "GENERAL", label: "Ask a question" },
          ] as const
        ).map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setType(option.value)}
            aria-pressed={type === option.value}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
              type === option.value
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {state && !state.ok && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-lg bg-destructive-subtle px-3 py-2.5 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {state.message}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Your name"
          name="name"
          autoComplete="name"
          error={errors.name}
          required
        />
        <Field
          label="Mobile number"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="0300 1234567"
          error={errors.phone}
          required
        />
      </div>

      <Field
        label="Email (optional)"
        name="email"
        type="email"
        autoComplete="email"
        error={errors.email}
      />

      {selling && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Make and model"
            name="device"
            placeholder="Dell Latitude 5420, Core i5"
            error={errors.device}
            required
          />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="condition">Condition</Label>
            <select
              id="condition"
              name="condition"
              defaultValue="WORKING"
              className="h-9 rounded-lg border border-input bg-card px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
            >
              {CONDITION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="message">
          {selling ? "Age, specs and what you'd like for it" : "How can we help?"}
        </Label>
        <Textarea
          id="message"
          name="message"
          rows={4}
          placeholder={
            selling
              ? "Bought in 2021, 16GB RAM, 512GB SSD, battery holds about 4 hours. Looking for a fair offer or a trade against a newer machine."
              : "I need a laptop for AutoCAD under Rs 150,000 — what do you have in stock?"
          }
          aria-invalid={!!errors.message}
          required
        />
        {errors.message && <p className="text-xs text-destructive">{errors.message}</p>}
      </div>

      <Button type="submit" size="lg" className="w-full shadow-sm" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : <Send />}
        {selling ? "Get a valuation" : "Send message"}
      </Button>

      <p className="text-center text-xs leading-relaxed text-muted-foreground">
        We reply during shop hours. For a faster answer, send photos on WhatsApp.
      </p>
    </form>
  )
}

function Field({
  label,
  name,
  error,
  ...props
}: {
  label: string
  name: string
  error?: string
} & ComponentProps<typeof Input>) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} aria-invalid={!!error} className="h-9" {...props} />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
