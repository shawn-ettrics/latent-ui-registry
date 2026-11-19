import * as DM from "@radix-ui/react-dropdown-menu";
import { forwardRef, useId, type ReactNode, type TextareaHTMLAttributes } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/registry/latent/lib/utils";

/* ---------------------------------------------------------------- *
 * Form controls. Same field language as Input: filled, borderless,
 * 1px ring border on focus, 32px tall, 13px text.
 * ---------------------------------------------------------------- */

const focus = "outline-none focus-visible:ring-0 focus-visible:border-ring";

/** Field wrapper: label above, optional hint or error below. */
export function Field({ label, hint, error, children, className }: { label?: ReactNode; hint?: ReactNode; error?: ReactNode; children: (id: string) => ReactNode; className?: string }) {
  const id = useId();
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && <label htmlFor={id} className="text-xs font-medium text-foreground">{label}</label>}
      {children(id)}
      {(error || hint) && <p className={cn("m-0 text-xs", error ? "text-danger-fg" : "text-muted-foreground")}>{error ?? hint}</p>}
    </div>
  );
}

/* ---------- Checkbox ---------- */
export function Checkbox({ checked, onCheckedChange, label, disabled, id }: { checked: boolean; onCheckedChange: (v: boolean) => void; label?: ReactNode; disabled?: boolean; id?: string }) {
  return (
    <label className={cn("inline-flex cursor-pointer items-center gap-2 text-sm text-foreground", disabled && "cursor-not-allowed opacity-50")}>
      <button
        id={id}
        type="button"
        role="checkbox"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        className={cn("flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-[4px] border", focus, checked ? "border-primary bg-primary text-primary-foreground" : "border-[color:color-mix(in_srgb,var(--foreground)_25%,transparent)] bg-transparent")}
      >
        {checked && <Check className="size-3" strokeWidth={3} />}
      </button>
      {label}
    </label>
  );
}

/* ---------- Switch ---------- */
export function Switch({ checked, onCheckedChange, label, disabled }: { checked: boolean; onCheckedChange: (v: boolean) => void; label?: ReactNode; disabled?: boolean }) {
  return (
    <label className={cn("inline-flex cursor-pointer items-center gap-2 text-sm text-foreground", disabled && "cursor-not-allowed opacity-50")}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        className={cn("relative h-5 w-9 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors", focus, checked ? "bg-primary" : "bg-[color-mix(in_srgb,var(--foreground)_18%,transparent)]")}
      >
        <span className={cn("absolute top-0.5 left-0.5 size-3.5 rounded-full bg-white shadow-sm transition-transform", checked && "translate-x-4")} />
      </button>
      {label}
    </label>
  );
}

/* ---------- RadioGroup ---------- */
export function RadioGroup({ options, value, onValueChange, label, className }: { options: { value: string; label: ReactNode; hint?: ReactNode }[]; value: string; onValueChange: (v: string) => void; label: string; className?: string }) {
  return (
    <div role="radiogroup" aria-label={label} className={cn("flex flex-col gap-2", className)}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <label key={o.value} className="inline-flex cursor-pointer items-start gap-2 text-sm text-foreground">
            <button
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onValueChange(o.value)}
              className={cn("mt-px flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-full border", focus, on ? "border-primary" : "border-[color:color-mix(in_srgb,var(--foreground)_25%,transparent)]")}
            >
              {on && <span className="size-2 rounded-full bg-primary" />}
            </button>
            <span className="flex flex-col">
              {o.label}
              {o.hint && <span className="text-xs text-muted-foreground">{o.hint}</span>}
            </span>
          </label>
        );
      })}
    </div>
  );
}

/* ---------- Select ---------- */
/** Full-size select for forms (32px, filled). For the small bordered select inside menus, use MenuSelect. */
export function Select({ options, value, onValueChange, placeholder = "Select…", id, className }: { options: { value: string; label: ReactNode }[]; value?: string; onValueChange: (v: string) => void; placeholder?: string; id?: string; className?: string }) {
  const cur = options.find((o) => o.value === value);
  return (
    <DM.Root modal={false}>
      <DM.Trigger asChild>
        <button id={id} type="button" className={cn("inline-flex h-8 w-full min-w-40 cursor-pointer items-center justify-between gap-2 rounded-lg border border-transparent bg-muted px-3 text-left text-sm data-[state=open]:border-ring", focus, cur ? "text-foreground" : "text-text-subtle", className)}>
          <span className="truncate">{cur?.label ?? placeholder}</span>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </DM.Trigger>
      <DM.Portal>
        <DM.Content align="start" sideOffset={4} className="z-50 min-w-[var(--radix-dropdown-menu-trigger-width)] rounded-[10px] border border-border bg-popover p-1 text-popover-foreground shadow-[var(--shadow-lg)]">
          {options.map((o) => (
            <DM.Item key={o.value} onSelect={() => onValueChange(o.value)} className="flex h-8 cursor-pointer items-center gap-2 rounded-md px-2 text-sm outline-none data-[highlighted]:bg-accent">
              <span className="flex-1">{o.label}</span>
              {o.value === value && <Check className="size-4 text-muted-foreground" />}
            </DM.Item>
          ))}
        </DM.Content>
      </DM.Portal>
    </DM.Root>
  );
}

/* ---------- Textarea ---------- */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, rows = 3, ...props }, ref) => (
  <textarea
    ref={ref}
    rows={rows}
    className={cn("w-full resize-y rounded-lg border border-transparent bg-muted px-3 py-2 text-sm leading-[1.5] text-foreground placeholder:text-text-subtle", focus, "focus:border-ring", className)}
    {...props}
  />
));
Textarea.displayName = "Textarea";
