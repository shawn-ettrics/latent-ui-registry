import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/registry/latent/lib/utils";
import { Tooltip } from "@/registry/latent/ui/tooltip";

/**
 * Buttons. Two heights: 32px (default) for toolbars and primary actions, 24px (sm) to sit alongside badges.
 * Icons are 16px (14px at sm). Icon-only buttons need a `label` for the tooltip and screen readers.
 *
 *   <Button variant="primary"><Sparkles />Generate plan</Button>
 *   <Button><SlidersHorizontal />Display</Button>
 *   <Button variant="ghost" size="icon" label="Zoom in"><Plus /></Button>
 */
export const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-transparent font-medium transition-colors outline-none focus-visible:border-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        /* main action on a page or panel: Generate plan, Save */
        primary: "bg-primary text-primary-foreground hover:bg-primary-hover",
        /* toolbar and secondary actions: Filter, Display, Cancel */
        outline: "border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground",
        /* quiet actions inside panels and on canvases: zoom, close, more */
        ghost: "bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground",
        /* irreversible: Delete, Dismiss all */
        destructive: "bg-destructive text-destructive-foreground hover:opacity-90",
        /* inline text action: See all, View all 429 */
        link: "h-auto border-0 bg-transparent p-0 text-link hover:underline",
      },
      size: {
        default: "h-8 px-3 text-sm [&_svg]:size-4",
        sm: "h-6 px-2 text-xs [&_svg]:size-3.5",
        icon: "size-8 p-0 [&_svg]:size-4",
        "icon-sm": "size-6 p-0 [&_svg]:size-3.5",
      },
    },
    compoundVariants: [{ variant: "link", class: "h-auto px-0" }],
    defaultVariants: { variant: "outline", size: "default" },
  },
);

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  /** Required for icon-only buttons: shown as a tooltip and used as the accessible name. */
  label?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, label, type = "button", ...props }, ref) => {
  const iconOnly = size === "icon" || size === "icon-sm";
  const el = (
    <button
      ref={ref}
      type={type}
      aria-label={iconOnly && typeof label === "string" ? label : undefined}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
  return iconOnly && label ? <Tooltip content={label}>{el}</Tooltip> : el;
});
Button.displayName = "Button";
