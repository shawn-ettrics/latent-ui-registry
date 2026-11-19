import { useRef, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/registry/latent/lib/utils";

/**
 * Segmented tabs: quick views above a list ("All 1532 · New & escalated 131 · …").
 * Single select, 32px tall to sit in a toolbar with buttons and search. Arrow keys move between tabs.
 */
export interface TabItem { value: string; label: ReactNode; count?: number }

export function Tabs({ items, value, onValueChange, label, className }: { items: TabItem[]; value: string; onValueChange: (v: string) => void; label: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const onKey = (e: KeyboardEvent, i: number) => {
    const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const n = (i + d + items.length) % items.length;
    onValueChange(items[n].value);
    (ref.current?.querySelectorAll<HTMLButtonElement>("[role=tab]")[n])?.focus();
  };
  return (
    <div ref={ref} role="tablist" aria-label={label} className={cn("inline-flex h-8 shrink-0 items-stretch rounded-lg bg-muted", className)}>
      {items.map((t, i) => {
        const on = t.value === value;
        return (
          <button
            key={t.value}
            type="button"
            role="tab"
            aria-selected={on}
            tabIndex={on ? 0 : -1}
            onClick={() => onValueChange(t.value)}
            onKeyDown={(e) => onKey(e, i)}
            className={cn(
              "inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md border px-2.5 text-xs leading-5 font-medium outline-none focus-visible:border-ring",
              on
                ? "border-[var(--gray-300)] bg-background text-foreground dark:border-[var(--gray-600)] dark:bg-[color-mix(in_srgb,var(--foreground)_12%,var(--muted))]"
                : "border-transparent bg-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
            {t.count != null && <span className="text-2xs font-normal text-muted-foreground">{t.count.toLocaleString()}</span>}
          </button>
        );
      })}
    </div>
  );
}
