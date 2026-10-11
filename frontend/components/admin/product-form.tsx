"use client"

import { useActionState, useRef, useState, type ComponentProps } from "react"
import Link from "next/link"
import Image from "next/image"
import { AlertCircle, FileText, IndianRupee, Images, Loader2, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { saveProductAction, uploadImageAction } from "@/app/actions/admin"
import { CONDITIONS, CONDITION_LABEL } from "@/lib/site"
import { cn } from "@/lib/utils"
import type { ActionResult } from "@/lib/validation"

export type ProductFormValues = {
  id?: string
  name: string
  slug: string
  brand: string
  description: string
  categoryId: string
  price: string
  compareAtPrice: string
  stock: string
  condition: string
  featured: boolean
  /** One image path per line — uploads append here, pasted URLs still work. */
  images: string
  /** `Label: value` per line. */
  specs: string
}

function imageLines(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
}

export function ProductForm({
  values,
  categories,
}: {
  values: ProductFormValues
  categories: { id: string; name: string }[]
}) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    saveProductAction,
    null,
  )

  // Controlled so an upload can append to the list without losing edits that
  // are already in the textarea.
  const [images, setImages] = useState(values.images)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const errors = state && !state.ok ? (state.fieldErrors ?? {}) : {}
  const isEdit = Boolean(values.id)
  const imageList = imageLines(images)

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    // Reset first so picking the same file twice still fires a change event.
    event.target.value = ""
    if (!file) return

    setUploadError(null)
    setUploading(true)
    try {
      const form = new FormData()
      form.append("file", file, file.name)
      const result = await uploadImageAction(form)
      if (!result.ok) {
        setUploadError(result.message)
        return
      }
      const url = result.data?.url
      if (!url) return
      setImages((current) => (imageLines(current).length ? `${current.replace(/\s*$/, "")}\n${url}` : url))
    } catch {
      setUploadError("Upload failed. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  function removeImage(url: string) {
    setImages(imageLines(images).filter((line) => line !== url).join("\n"))
  }

  return (
    <form action={formAction} className="flex flex-col gap-6" noValidate>
      {values.id && <input type="hidden" name="id" value={values.id} />}

      {state && !state.ok && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-lg bg-destructive-subtle px-3.5 py-3 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {state.message}
        </p>
      )}

      <Section
        icon={<FileText />}
        title="Basics"
        hint="What the listing is called, and how it reads in search."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Product name"
            name="name"
            defaultValue={values.name}
            placeholder="Dell Latitude 5420 — i5 11th Gen"
            error={errors.name}
            className="sm:col-span-2"
            required
          />
          <Field
            label="Brand"
            name="brand"
            defaultValue={values.brand}
            placeholder="Dell"
            error={errors.brand}
            required
          />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="categoryId">Category</Label>
            <select
              id="categoryId"
              name="categoryId"
              defaultValue={values.categoryId}
              aria-invalid={!!errors.categoryId}
              className="h-9 rounded-lg border border-input bg-card px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
              required
            >
              <option value="">Choose a category…</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId && <p className="text-xs text-destructive">{errors.categoryId}</p>}
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={values.description}
              placeholder="What it is, who it suits, and anything a buyer should know before ordering."
              aria-invalid={!!errors.description}
              required
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description}</p>
            )}
          </div>
        </div>
      </Section>

      <Section
        icon={<IndianRupee />}
        title="Pricing & stock"
        hint="Everything in rupees — compare-at price is what gets crossed out."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <Field
            label="Price (Rs)"
            name="price"
            type="number"
            min={0}
            defaultValue={values.price}
            error={errors.price}
            required
          />
          <Field
            label="Compare-at (Rs)"
            name="compareAtPrice"
            type="number"
            min={0}
            defaultValue={values.compareAtPrice}
            placeholder="Optional"
            error={errors.compareAtPrice}
          />
          <Field
            label="Stock"
            name="stock"
            type="number"
            min={0}
            defaultValue={values.stock}
            error={errors.stock}
            required
          />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="condition">Condition</Label>
            <select
              id="condition"
              name="condition"
              defaultValue={values.condition}
              className="h-9 rounded-lg border border-input bg-card px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
            >
              {CONDITIONS.map((condition) => (
                <option key={condition} value={condition}>
                  {CONDITION_LABEL[condition]}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2.5 self-end pb-2 text-sm sm:col-span-2">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={values.featured}
              className="size-4 accent-[var(--brand)]"
            />
            Feature on the home page
          </label>
        </div>
      </Section>

      <Section
        icon={<Images />}
        title="Photos, specs & URL"
        hint="Upload the shots, then tidy up the technical details."
      >
        <div className="grid gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="images">Photos</Label>

            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                className="sr-only"
                onChange={handleUpload}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? <Loader2 className="animate-spin" /> : <Plus className="size-3.5" />}
                {uploading ? "Uploading…" : "Upload image"}
              </Button>
              <span className="text-xs text-muted-foreground">JPG, PNG, WebP — up to 25 MB.</span>
            </div>

            {uploadError && <p className="text-xs text-destructive">{uploadError}</p>}

            {imageList.length > 0 && (
              <ul className="mt-1 grid grid-cols-4 gap-2 sm:grid-cols-6">
                {imageList.map((url, index) => (
                  <li
                    key={`${url}-${index}`}
                    className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted"
                  >
                    <Image
                      src={url}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 25vw, 10vw"
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(url)}
                      aria-label={`Remove image ${index + 1}`}
                      className="absolute inset-0 grid place-items-center bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                    >
                      <X className="size-4" />
                    </button>
                    {index === 0 && (
                      <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[0.6rem] font-medium text-white">
                        Cover
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}

            <Textarea
              id="images"
              name="images"
              rows={4}
              value={images}
              onChange={(event) => setImages(event.target.value)}
              placeholder={"/uploads/3f9a1c….jpg\nhttps://example.com/photo.jpg"}
              className="font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground">
              Upload photos above, or paste a path / URL — one per line. The first is the cover
              shot shown on cards and in search results.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="specs">Specifications</Label>
            <Textarea
              id="specs"
              name="specs"
              rows={6}
              defaultValue={values.specs}
              placeholder={"Processor: Core i5-1145G7\nRAM: 16GB DDR4\nStorage: 512GB NVMe SSD"}
              className="font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground">
              One per line, as <span className="font-mono">Label: value</span>.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="slug">URL slug</Label>
            <Input
              id="slug"
              name="slug"
              defaultValue={values.slug}
              placeholder="dell-latitude-5420-i5"
              aria-invalid={!!errors.slug}
              className="font-mono text-xs"
            />
            <p className={cn("text-xs", errors.slug ? "text-destructive" : "text-muted-foreground")}>
              {errors.slug ?? "Leave blank to build it from the product name."}
            </p>
          </div>
        </div>
      </Section>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/60 bg-card px-5 py-4 shadow-sm">
        <Button type="submit" size="lg" className="h-10 px-5 text-sm" disabled={pending}>
          {pending && <Loader2 className="animate-spin" />}
          {isEdit ? "Save changes" : "Create product"}
        </Button>
        <Button type="button" variant="ghost" nativeButton={false} render={<Link href="/admin/products" />}>
          Cancel
        </Button>
        {isEdit && values.slug && (
          <Link
            href={`/product/${values.slug}`}
            className="ml-auto text-sm font-medium text-brand underline-offset-4 hover:underline"
          >
            View on storefront →
          </Link>
        )}
      </div>
    </form>
  )
}

function Section({
  icon,
  title,
  hint,
  children,
}: {
  icon: React.ReactNode
  title: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm md:p-6">
      <div className="flex items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-subtle text-brand [&_svg]:size-4">
          {icon}
        </span>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold">{title}</h2>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  )
}

function Field({
  label,
  name,
  error,
  className,
  ...props
}: {
  label: string
  name: string
  error?: string
  className?: string
} & ComponentProps<typeof Input>) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} aria-invalid={!!error} className="h-9" {...props} />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
