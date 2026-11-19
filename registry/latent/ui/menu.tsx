import * as DM from "@radix-ui/react-dropdown-menu";
import * as PO from "@radix-ui/react-popover";
import { ArrowDownWideNarrow, ArrowUpNarrowWide, Check, ChevronDown, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/registry/latent/lib/utils";
import { ToggleBadge } from "@/registry/latent/ui/badge";

/* ------------------------------------------------------------------ *
 * Menus. One surface style for every dropdown: popover fill, 1px border,
 * 10px corners, 4px inset, large shadow. Items are 32px, 13px text.
 * ------------------------------------------------------------------ */
const surface = "z-50 min-w-[200px] rounded-[10px] border border-border bg-popover p-1 text-popover-foreground shadow-[var(--shadow-lg)]";
const item = "flex h-8 cursor-pointer select-none items-center gap-2 rounded-md px-2 text-sm outline-none data-[highlighted]:bg-accent data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0";

export const Menu = DM.Root;
export const MenuTrigger = DM.Trigger;

export function MenuContent({ children, align = "start", className }: { children: ReactNode; align?: "start" | "center" | "end"; className?: string }) {
  return (
    <DM.Portal>
      <DM.Content align={align} sideOffset={6} className={cn(surface, className)}>{children}</DM.Content>
    </DM.Portal>
  );
}

export function MenuItem({ children, onSelect, shortcut, disabled }: { children: ReactNode; onSelect?: () => void; shortcut?: ReactNode; disabled?: boolean }) {
  return (
    <DM.Item onSelect={onSelect} disabled={disabled} className={item}>
      {children}
      {shortcut && <span className="ml-auto text-xs text-muted-foreground">{shortcut}</span>}
    </DM.Item>
  );
}

/** Checkbox row; stays open on select so several can be ticked. */
export function MenuCheckboxItem({ children, checked, onCheckedChange, count }: { children: ReactNode; checked: boolean; onCheckedChange: (v: boolean) => void; count?: number }) {
  return (
    <DM.CheckboxItem checked={checked} onCheckedChange={(v) => onCheckedChange(!!v)} onSelect={(e) => e.preventDefault()} className={item}>
      <span className={cn("flex size-3.5 items-center justify-center rounded-[4px] border", checked ? "border-primary bg-primary text-primary-foreground" : "border-[color:color-mix(in_srgb,var(--foreground)_25%,transparent)]")}>
        <DM.ItemIndicator><Check className="!size-2.5" strokeWidth={3} /></DM.ItemIndicator>
      </span>
      <span className="flex-1">{children}</span>
      {count != null && <span className="text-xs text-muted-foreground">{count}</span>}
    </DM.CheckboxItem>
  );
}

export const MenuLabel = ({ children }: { children: ReactNode }) => <DM.Label className="px-2 pt-1.5 pb-1 text-xs font-medium text-muted-foreground">{children}</DM.Label>;
export const MenuSeparator = () => <DM.Separator className="-mx-1 my-1 h-px bg-border" />;

/** Item that opens a submenu on hover / arrow-right. */
export function MenuSub({ label, icon, children, badge }: { label: ReactNode; icon?: ReactNode; children: ReactNode; badge?: ReactNode }) {
  return (
    <DM.Sub>
      <DM.SubTrigger className={cn(item, "data-[state=open]:bg-accent")}>
        {icon}
        <span className="flex-1">{label}</span>
        {badge}
        <ChevronRight className="text-muted-foreground" />
      </DM.SubTrigger>
      <DM.Portal>
        <DM.SubContent sideOffset={6} alignOffset={-5} className={surface}>{children}</DM.SubContent>
      </DM.Portal>
    </DM.Sub>
  );
}

/* ---------- small select: a 28px bordered trigger that opens a single-choice menu ---------- */
export interface Option { value: string; label: ReactNode }
export function MenuSelect({ options, value, onValueChange, className }: { options: Option[]; value: string; onValueChange: (v: string) => void; className?: string }) {
  const cur = options.find((o) => o.value === value) ?? options[0];
  return (
    <DM.Root modal={false}>
      <DM.Trigger asChild>
        <button type="button" className={cn("inline-flex h-7 w-[140px] cursor-pointer items-center justify-between gap-1 rounded-md border border-border bg-transparent pr-2 pl-2.5 text-xs text-foreground outline-none hover:bg-accent focus-visible:border-ring", className)}>
          <span className="truncate">{cur?.label}</span>
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </button>
      </DM.Trigger>
      <DM.Portal>
        <DM.Content align="end" sideOffset={4} className={cn(surface, "min-w-[160px]")}>
          {options.map((o) => (
            <DM.Item key={o.value} onSelect={() => onValueChange(o.value)} className={item}>
              <span className="flex-1">{o.label}</span>
              {o.value === value && <Check className="text-muted-foreground" />}
            </DM.Item>
          ))}
        </DM.Content>
      </DM.Portal>
    </DM.Root>
  );
}

/* ---------- Display menu: grouping, ordering, which properties show ---------- */
export interface DisplayMenuProps {
  trigger: ReactNode;
  grouping: { options: Option[]; value: string; onChange: (v: string) => void };
  ordering: { options: Option[]; value: string; onChange: (v: string) => void; direction: "asc" | "desc"; onDirectionChange: (d: "asc" | "desc") => void };
  properties: { id: string; label: string }[];
  hidden: ReadonlySet<string>;
  onToggleProperty: (id: string, visible: boolean) => void;
  /** Shown when anything differs from the defaults */
  onReset?: () => void;
}

export function DisplayMenu({ trigger, grouping, ordering, properties, hidden, onToggleProperty, onReset }: DisplayMenuProps) {
  const Dir = ordering.direction === "asc" ? ArrowUpNarrowWide : ArrowDownWideNarrow;
  const row = "flex min-h-9 items-center justify-between gap-3 px-2 py-1";
  return (
    <PO.Root>
      <PO.Trigger asChild>{trigger}</PO.Trigger>
      <PO.Portal>
        <PO.Content align="end" sideOffset={6} className={cn(surface, "w-[280px] px-1 py-1.5")}>
          <div className={row}><span className="text-xs text-muted-foreground">Grouping</span><MenuSelect {...grouping} onValueChange={grouping.onChange} /></div>
          <div className={row}>
            <span className="text-xs text-muted-foreground">Ordering</span>
            <div className="flex items-center gap-1">
              <button type="button" aria-label={ordering.direction === "asc" ? "Ascending" : "Descending"} onClick={() => ordering.onDirectionChange(ordering.direction === "asc" ? "desc" : "asc")}
                className="inline-flex size-7 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground">
                <Dir className="size-4" strokeWidth={1.75} />
              </button>
              <MenuSelect options={ordering.options} value={ordering.value} onValueChange={ordering.onChange} />
            </div>
          </div>
          <div className="-mx-1 my-1.5 h-px bg-border" />
          <div className="px-2 pt-1 pb-0.5 text-xs font-medium text-muted-foreground">Display properties</div>
          <div className="flex flex-wrap gap-1 px-2 pt-1 pb-1.5">
            {properties.map((p) => <ToggleBadge key={p.id} pressed={!hidden.has(p.id)} onPressedChange={(v) => onToggleProperty(p.id, v)}>{p.label}</ToggleBadge>)}
          </div>
          {onReset && (
            <>
              <div className="-mx-1 my-1 h-px bg-border" />
              <button type="button" onClick={onReset} className="flex h-8 w-full cursor-pointer items-center rounded-md border-0 bg-transparent px-2 text-left text-xs text-muted-foreground hover:bg-accent hover:text-foreground">Reset to default</button>
            </>
          )}
        </PO.Content>
      </PO.Portal>
    </PO.Root>
  );
}

/* ---------- Filter menu: categories, each a submenu of checkboxes ---------- */
export interface FilterCategory { id: string; label: string; icon?: ReactNode; options: { value: string; label: ReactNode; count?: number }[] }
export function FilterMenu({ trigger, categories, value, onChange }: { trigger: ReactNode; categories: FilterCategory[]; value: Record<string, string[]>; onChange: (next: Record<string, string[]>) => void }) {
  const toggle = (c: string, v: string, on: boolean) => {
    const cur = new Set(value[c] ?? []);
    on ? cur.add(v) : cur.delete(v);
    const next = { ...value, [c]: [...cur] };
    if (!next[c].length) delete next[c];
    onChange(next);
  };
  return (
    <Menu>
      <MenuTrigger asChild>{trigger}</MenuTrigger>
      <MenuContent>
        <MenuLabel>Filter by</MenuLabel>
        {categories.map((c) => (
          <MenuSub key={c.id} label={c.label} icon={c.icon} badge={value[c.id]?.length ? <span className="rounded-[4px] bg-primary-muted px-1.5 text-xs text-link">{value[c.id].length}</span> : undefined}>
            {c.options.map((o) => (
              <MenuCheckboxItem key={o.value} checked={!!value[c.id]?.includes(o.value)} onCheckedChange={(on) => toggle(c.id, o.value, on)} count={o.count}>{o.label}</MenuCheckboxItem>
            ))}
          </MenuSub>
        ))}
      </MenuContent>
    </Menu>
  );
}
