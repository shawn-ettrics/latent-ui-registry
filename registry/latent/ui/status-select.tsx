import * as DM from "@radix-ui/react-dropdown-menu";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/registry/latent/lib/utils";
import { Badge } from "@/registry/latent/ui/badge";
import { StatusIcon, type RemStatus } from "@/registry/latent/ui/icons";

const STATUSES: RemStatus[] = ["Open", "In progress", "Resolved", "Dismissed"];
const STC: Record<RemStatus, string> = { Open: "var(--status-open)", "In progress": "var(--status-in-progress)", Resolved: "var(--status-resolved)", Dismissed: "var(--status-dismissed)" };

/** Status badge as a button (icon + label + chevrons-up-down); opens a menu to set the status. */
export function StatusSelect({ value, onChange, className }: { value: RemStatus; onChange: (s: RemStatus) => void; className?: string }) {
  return (
    <DM.Root>
      <DM.Trigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex h-6 items-center gap-1.5 rounded-[4px] border border-transparent bg-[color-mix(in_srgb,var(--stc)_16%,transparent)] px-2 text-[var(--stc)] hover:bg-[color-mix(in_srgb,var(--stc)_26%,transparent)] text-[length:var(--badge-fs)] font-medium leading-4 focus-visible:border-ring focus-visible:outline-none",
            className,
          )}
          style={{ "--stc": STC[value] } as React.CSSProperties}
        >
          <Badge tone="plain" icon={<StatusIcon status={value} />} className="h-auto p-0 text-current">{value}</Badge>
          <ChevronsUpDown className="size-3 opacity-70" />
        </button>
      </DM.Trigger>
      <DM.Portal>
        <DM.Content
          align="start"
          sideOffset={4}
          className="z-50 min-w-[170px] rounded-[10px] border border-border bg-popover p-1 shadow-[var(--shadow-lg)]"
        >
          {STATUSES.map((s) => (
            <DM.Item
              key={s}
              onSelect={() => onChange(s)}
              className="flex cursor-pointer items-center rounded-md px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-accent"
            >
              <Badge tone="plain" icon={<StatusIcon status={s} />}>{s}</Badge>
              {s === value && <Check className="ml-auto size-3.5 text-muted-foreground" />}
            </DM.Item>
          ))}
        </DM.Content>
      </DM.Portal>
    </DM.Root>
  );
}
