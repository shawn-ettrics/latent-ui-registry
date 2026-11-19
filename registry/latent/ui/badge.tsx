import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { X } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/registry/latent/lib/utils";
import { Tooltip } from "@/registry/latent/ui/tooltip";

/**
 * One badge for every chip in the product: priority, priority change, New, verdict, status, effort, owner.
 * Pick a `tone` for colour, pass an optional `icon`, and an optional `tooltip`.
 *
 *   <Badge tone="critical">Critical</Badge>
 *   <Badge tone="new" tooltip="Escalated from High">Escalated</Badge>
 *   <Badge tone="confirmed" icon={<VerdictIcon verdict="Confirmed" />}>Confirmed</Badge>
 *   <Badge tone="plain" icon={<StatusIcon status="Open" />}>Open</Badge>
 *   <Badge>Medium effort</Badge>   <Badge>Platform</Badge>
 */
export const badgeVariants = cva(
  "box-border inline-flex h-6 w-max shrink-0 items-center gap-1 rounded-[4px] px-2 text-[length:var(--badge-fs)] font-medium leading-4 whitespace-nowrap [&>svg]:shrink-0",
  {
    variants: {
      tone: {
        /* gray: effort, owner, Downgraded */
        neutral: "bg-secondary text-text-secondary",
        /* magenta: New, Escalated */
        new: "bg-badge-new-muted text-badge-new-fg",
        /* priority: solid fill, white text (dark text in dark mode) */
        critical: "bg-priority-critical-emphasis text-white dark:text-[var(--gray-900)]",
        high: "bg-priority-high-emphasis text-white dark:text-[var(--gray-900)]",
        medium: "bg-priority-medium-emphasis text-white dark:text-[var(--gray-900)]",
        low: "bg-priority-low-emphasis text-white dark:text-[var(--gray-900)]",
        /* verdict: muted fill; icon renders at 12px in the text colour */
        assessing: "bg-verdict-assessing-muted text-verdict-assessing-fg [&>svg]:size-3 [&>svg]:text-current",
        failed: "bg-verdict-failed-muted text-verdict-failed-fg [&>svg]:size-3 [&>svg]:text-current",
        confirmed: "bg-verdict-confirmed-muted text-verdict-confirmed-fg [&>svg]:size-3 [&>svg]:text-current",
        conditional: "bg-verdict-conditional-muted text-verdict-conditional-fg [&>svg]:size-3 [&>svg]:text-current",
        inconclusive: "bg-verdict-inconclusive-muted text-verdict-inconclusive-fg [&>svg]:size-3 [&>svg]:text-current",
        refuted: "bg-verdict-refuted-muted text-verdict-refuted-fg [&>svg]:size-3 [&>svg]:text-current",
        /* status: no fill, 16px coloured icon, foreground text */
        plain: "gap-1.5 bg-transparent pl-0 text-foreground",
        /* toggles and filters */
        selected: "bg-primary-muted text-link",
        outline: "border border-border bg-transparent text-muted-foreground",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export type BadgeTone = NonNullable<VariantProps<typeof badgeVariants>["tone"]>;

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  icon?: ReactNode;
  /** Trailing icon or control (e.g. a remove button on a filter). */
  iconRight?: ReactNode;
  tooltip?: ReactNode;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(({ className, tone, icon, iconRight, tooltip, children, ...props }, ref) => {
  const el = (
    <span ref={ref} className={cn(badgeVariants({ tone }), iconRight != null && "pr-1", tooltip && "cursor-default", className)} {...props}>
      {icon}
      {children}
      {iconRight}
    </span>
  );
  return tooltip ? <Tooltip content={tooltip}>{el}</Tooltip> : el;
});
Badge.displayName = "Badge";

/** Display-property toggle: a 24px badge button, outline when off, blue tint when on. */
export function ToggleBadge({ pressed, onPressedChange, children, className }: { pressed: boolean; onPressedChange: (v: boolean) => void; children: ReactNode; className?: string }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={() => onPressedChange(!pressed)}
      className={cn(badgeVariants({ tone: pressed ? "selected" : "outline" }), "cursor-pointer", !pressed && "hover:text-foreground", className)}
    >
      {children}
    </button>
  );
}

/** Active filter token: "Label: value" with a remove button on the right. */
export function FilterBadge({ label, value, onRemove, className }: { label: string; value: ReactNode; onRemove: () => void; className?: string }) {
  return (
    <Badge
      tone="selected"
      className={className}
      iconRight={
        <button type="button" onClick={onRemove} aria-label={`Remove ${label} filter`}
          className="inline-flex size-4 cursor-pointer items-center justify-center rounded-[3px] border-0 bg-transparent p-0 text-current hover:bg-[color-mix(in_srgb,var(--link)_18%,transparent)]">
          <X className="size-3" />
        </button>
      }
    >
      <span>{label}:</span>
      <span className="max-w-60 truncate">{value}</span>
    </Badge>
  );
}
