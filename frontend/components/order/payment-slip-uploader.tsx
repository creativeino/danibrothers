"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  FileText,
  Loader2,
  RefreshCw,
  ExternalLink,
  MessageCircle,
  Copy,
  Check,
  ShieldCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { attachPaymentSlipAction } from "@/app/actions/orders"
import { bankTransfer, hasBankDetails, groupDigits, whatsappLink } from "@/lib/site"
import { formatPrice } from "@/lib/format"
import { toast } from "sonner"

interface PaymentSlipUploaderProps {
  orderId: string
  orderNumber: string
  orderTotal: number
  paymentMethod: string
  initialProof: string | null
}

export function PaymentSlipUploader({
  orderId,
  orderNumber,
  orderTotal,
  paymentMethod,
  initialProof,
}: PaymentSlipUploaderProps) {
  const [proof, setProof] = useState<string | null>(initialProof)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [localPreview, setLocalPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [isReplacing, setIsReplacing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isBankTransfer = paymentMethod === "BANK_TRANSFER"

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      setError("Please choose an image file (JPG, PNG, WebP) or PDF.")
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File is too large. Maximum size is 10 MB.")
      return
    }

    setError(null)
    setSelectedFile(file)
    if (file.type.startsWith("image/")) {
      const objectUrl = URL.createObjectURL(file)
      setLocalPreview(objectUrl)
    } else {
      setLocalPreview(null)
    }
  }

  async function handleUpload() {
    if (!selectedFile) {
      setError("Please select a file first.")
      return
    }

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)

      const result = await attachPaymentSlipAction(orderId, formData)
      if (result.ok && result.data?.url) {
        setProof(result.data.url)
        setIsReplacing(false)
        setSelectedFile(null)
        setLocalPreview(null)
        toast.success("Payment slip attached successfully!", {
          description: `Order #${orderNumber} receipt has been updated.`,
        })
      } else {
        setError(result.message || "Failed to upload slip. Try again.")
      }
    } catch {
      setError("Network error while uploading. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  function handleCopyAccount() {
    if (!bankTransfer.accountNumber) return
    navigator.clipboard.writeText(bankTransfer.accountNumber)
    setCopied(true)
    toast.success("Account number copied!")
    setTimeout(() => setCopied(false), 2500)
  }

  const whatsappMessage = `Hi Dani Brothers, I have placed Order #${orderNumber} (Rs. ${orderTotal}). Attaching my payment receipt here.`

  return (
    <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 bg-muted/30 px-6 py-4">
        <div className="flex items-center gap-2.5">
          <div className="grid size-8 place-items-center rounded-lg bg-brand/10 text-brand">
            <FileText className="size-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">
              Payment Slip / Receipt
            </h3>
            <p className="text-[0.72rem] text-muted-foreground/80">
              {proof && !isReplacing
                ? "Your payment slip is attached and saved"
                : "Attach your bank transfer or payment receipt to confirm your order"}
            </p>
          </div>
        </div>

        {proof && !isReplacing && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="size-3.5" />
            Slip Attached
          </span>
        )}
      </div>

      <div className="p-6">
        {/* If slip already attached and not replacing */}
        {proof && !isReplacing ? (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-5 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4.5">
              <div className="relative size-24 shrink-0 overflow-hidden rounded-xl border border-emerald-500/30 bg-background shadow-inner">
                {proof.endsWith(".pdf") ? (
                  <div className="grid size-full place-items-center text-xs font-bold text-muted-foreground">
                    PDF File
                  </div>
                ) : (
                  <Image
                    src={proof}
                    alt="Payment Slip Preview"
                    fill
                    className="object-cover"
                  />
                )}
              </div>

              <div className="flex-1 text-center sm:text-left space-y-1">
                <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="size-4" />
                  Payment receipt uploaded &amp; linked to order #{orderNumber}
                </div>
                <p className="text-xs text-muted-foreground/80">
                  Our team will verify the payment and immediately prepare your parcel for dispatch in Karachi.
                </p>
                <div className="pt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                  <a
                    href={proof}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand underline-offset-4 hover:underline"
                  >
                    <ExternalLink className="size-3.5" />
                    View uploaded receipt
                  </a>
                  <span className="text-muted-foreground/40 hidden sm:inline">·</span>
                  <button
                    type="button"
                    onClick={() => setIsReplacing(true)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    <RefreshCw className="size-3" />
                    Replace receipt
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Needs slip upload */
          <div className="space-y-5">
            {/* Urgency Notice */}
            <div className="flex items-start gap-3 rounded-xl border border-amber-500/25 bg-amber-500/[0.06] p-4">
              <AlertCircle className="size-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div className="text-xs text-amber-900 dark:text-amber-200">
                <p className="font-bold">
                  Payment receipt attachment required
                </p>
                <p className="mt-1 leading-relaxed opacity-90">
                  Please upload a screenshot or photo of your bank transfer or deposit receipt below to verify and dispatch your order.
                </p>
              </div>
            </div>

            {/* Bank details quick-copy if Bank Transfer */}
            {isBankTransfer && hasBankDetails() && (
              <div className="rounded-xl border border-border/60 bg-muted/40 p-4 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">
                    Bank Transfer Details ({bankTransfer.bankName})
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCopyAccount}
                    className="h-7 text-xs gap-1.5"
                  >
                    {copied ? (
                      <>
                        <Check className="size-3 text-emerald-500" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="size-3" />
                        Copy Account
                      </>
                    )}
                  </Button>
                </div>
                <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-muted-foreground/85">
                  {bankTransfer.accountTitle && (
                    <div>
                      <span className="text-muted-foreground/60">Title: </span>
                      <strong className="text-foreground">{bankTransfer.accountTitle}</strong>
                    </div>
                  )}
                  {bankTransfer.accountNumber && (
                    <div>
                      <span className="text-muted-foreground/60">Account #: </span>
                      <strong className="text-foreground font-mono">{groupDigits(bankTransfer.accountNumber)}</strong>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Upload Area */}
            {!selectedFile ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/80 bg-muted/20 p-8 text-center transition-all duration-200 hover:border-brand/60 hover:bg-brand/[0.02]"
              >
                <div className="grid size-12 place-items-center rounded-full bg-brand/10 text-brand transition-transform duration-200 group-hover:scale-110">
                  <UploadCloud className="size-6" />
                </div>
                <p className="mt-3 text-sm font-semibold text-foreground">
                  Click to choose receipt screenshot / photo
                </p>
                <p className="mt-1 text-xs text-muted-foreground/70">
                  Supports JPG, PNG, WebP or PDF (up to 10 MB)
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-border/70 bg-card p-4 space-y-4">
                <div className="flex items-center gap-4">
                  {localPreview ? (
                    <div className="relative size-18 shrink-0 overflow-hidden rounded-lg border border-border shadow-sm">
                      <Image
                        src={localPreview}
                        alt="Slip preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="grid size-18 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
                      <FileText className="size-8" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-foreground">
                      {selectedFile.name}
                    </p>
                    <p className="text-[0.7rem] text-muted-foreground">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-1 text-xs text-brand hover:underline font-medium"
                    >
                      Choose a different photo
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    type="button"
                    onClick={handleUpload}
                    disabled={uploading}
                    className="flex-1 sm:flex-initial min-w-44"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Uploading slip...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="size-4" />
                        Attach Slip Now
                      </>
                    )}
                  </Button>

                  {isReplacing && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setIsReplacing(false)
                        setSelectedFile(null)
                        setLocalPreview(null)
                      }}
                      disabled={uploading}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            )}

            {error && (
              <p className="flex items-center gap-1.5 text-xs font-medium text-destructive">
                <AlertCircle className="size-3.5 shrink-0" />
                {error}
              </p>
            )}

            {/* WhatsApp Fallback */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border/50 pt-4 text-xs">
              <span className="text-muted-foreground/75 text-center sm:text-left">
                Cannot upload here? You can also send the slip on WhatsApp:
              </span>
              <a
                href={whatsappLink(whatsappMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 transition-colors"
              >
                <MessageCircle className="size-3.5" />
                Send Slip on WhatsApp
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
