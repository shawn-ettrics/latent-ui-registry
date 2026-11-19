import type { LucideIcon } from "lucide-react";
import { cn } from "@/registry/latent/lib/utils";
import { Tooltip } from "@/registry/latent/ui/tooltip";

/**
 * Related-object count: number + 14px icon, gray, right-aligned in a fixed slot so columns line up.
 * Renders an empty slot for 0 so neighbours don't shift. Use `wide` for counts that reach 3 digits.
 */
export function CountChip({
  count, icon: Icon, label, wide, onClick, className,
}: { count: number; icon: LucideIcon; label: string; wide?: boolean; onClick?: () => void; className?: string }) {
  const slot = cn("inline-flex shrink-0 items-center justify-end gap-1", wide ? "w-[46px]" : "w-[34px]", className);
  if (!count) return <span className={slot} aria-hidden />;
  return (
    <Tooltip content={`${count} ${label}${count === 1 ? "" : "s"}`}>
      <button
        type="button"
        onClick={onClick}
        className={cn(slot, "cursor-pointer border-0 bg-transparent p-0 text-sm text-text-secondary hover:text-foreground")}
      >
        {count}
        <Icon className="size-3.5" strokeWidth={2} />
      </button>
    </Tooltip>
  );
}

/** Groups CountChips with one shared gap (12px). Put it in a single cell with one set of side padding. */
export const CountGroup = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <span className={cn("flex items-center gap-3", className)}>{children}</span>
);
