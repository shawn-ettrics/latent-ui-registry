import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/registry/latent/lib/utils";

/** Borderless filled field; a 1px ring-coloured border appears on focus. */
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "h-8 min-w-60 rounded-lg border border-transparent bg-muted px-3 text-sm text-foreground outline-none placeholder:text-text-subtle focus:border-ring",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";
