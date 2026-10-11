import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const buttonVariants = cva(
  /* ── Base styles ────────────────────────────────────────────── */
  [
    "group/button relative inline-flex shrink-0 items-center justify-center overflow-hidden",
    "rounded-xl border border-transparent bg-clip-padding text-sm font-semibold",
    "whitespace-nowrap outline-none select-none transition-all duration-300 ease-out",
    "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
    "active:not-aria-[haspopup]:scale-[0.97] active:not-aria-[haspopup]:duration-75",
    "disabled:pointer-events-none disabled:opacity-40",
    "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
    "dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    /* Shine overlay for default variant */
    "before:pointer-events-none before:absolute before:inset-0 before:z-[1]",
    "before:opacity-0 before:transition-opacity before:duration-300",
    "hover:before:opacity-100",
    /* Default shine: diagonal light sweep */
    "before:bg-[linear-gradient(105deg,transparent_40%,rgba(255,255,255,0.15)_45%,rgba(255,255,255,0.25)_50%,rgba(255,255,255,0.15)_55%,transparent_60%)]",
    "before:bg-[length:250%_100%] before:bg-[position:200%_0]",
    "hover:before:bg-[position:-50%_0]",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "bg-gradient-to-b from-brand to-brand/90 text-white shadow-md shadow-brand/20",
          "hover:from-brand hover:to-brand/80 hover:shadow-lg hover:shadow-brand/30",
          "hover:-translate-y-0.5",
        ].join(" "),
        outline: [
          "border-border bg-background text-foreground",
          "hover:border-brand/40 hover:bg-brand/5 hover:text-brand hover:shadow-md hover:shadow-brand/5",
          "hover:-translate-y-0.5",
          "dark:border-input dark:bg-input/30 dark:hover:border-brand/40 dark:hover:bg-brand/10",
        ].join(" "),
        secondary: [
          "bg-secondary text-secondary-foreground",
          "hover:bg-secondary/80 hover:shadow-md hover:-translate-y-0.5",
          "aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ].join(" "),
        ghost: [
          "hover:bg-muted hover:text-foreground",
          "aria-expanded:bg-muted aria-expanded:text-foreground",
          "dark:hover:bg-muted/50",
        ].join(" "),
        destructive: [
          "bg-destructive text-white shadow-md shadow-destructive/20",
          "hover:bg-destructive/90 hover:shadow-lg hover:shadow-destructive/30",
          "hover:-translate-y-0.5",
          "dark:bg-destructive dark:hover:bg-destructive/90",
        ].join(" "),
        link: [
          "text-primary underline-offset-4",
          "hover:underline",
        ].join(" "),
        brand: [
          "bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-500/20",
          "hover:from-emerald-400 hover:to-emerald-500 hover:shadow-lg hover:shadow-emerald-500/30",
          "hover:-translate-y-0.5",
        ].join(" "),
      },
      size: {
        default:
          "h-9 gap-1.5 px-3.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xs: "h-7 gap-1 rounded-lg px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-lg px-3 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-11 gap-2 px-5 text-sm has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        xl: "h-13 gap-2.5 px-7 text-base has-data-[icon=inline-end]:pr-5 has-data-[icon=inline-start]:pl-5",
        icon: "size-9",
        "icon-xs":
          "size-7 rounded-lg in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-8 rounded-lg in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
