import { Fragment, useMemo, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { ChevronDown, ChevronRight, Star } from "lucide-react";
import { cn } from "@/registry/latent/lib/utils";

/* ------------------------------------------------------------------ *
 * DataTable — CSS grid, not <table>.
 * One grid-template-columns string is built from the visible columns and
 * set on the table; every row is a subgrid of it, so columns line up
 * across rows while each column keeps its own sizing rule
 * (e.g. minmax(0,1fr) to fill, 240px fixed, max-content to fit).
 * No header row: column names live in the Display menu.
 * ------------------------------------------------------------------ */

export interface Column<T> {
  id: string;
  /** Label for the Display menu chips */
  label: string;
  /** Grid track: "minmax(0,1fr)" fills, "240px" fixed, "max-content" fits content */
  width: string;
  render: (row: T) => ReactNode;
  align?: "start" | "center" | "end";
  /** Vertical alignment inside the row. The first column usually sits at the top, the rest centre. */
  valign?: "top" | "middle";
  /** Extra right padding in px (the related-counts cell uses 30) */
  padRight?: number;
  className?: string;
}

export interface RowGroup {
  key: string;
  label: ReactNode;
  /** Shown after the label, muted */
  meta?: ReactNode;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  /** Column ids to hide (driven by the Display menu) */
  hidden?: ReadonlySet<string>;
  /** Group rows under collapsible headers. Groups keep the order rows first appear in. */
  groupBy?: (row: T) => RowGroup;
  onRowClick?: (row: T) => void;
  selectedId?: string;
  /** Rows shown per group (or in total, without groups) before a "Show all N" row. The row stays in place and toggles to "Show less". */
  limit?: number;
  /** Accessible name, e.g. "Attack paths" */
  label: string;
  className?: string;
}

const PAD_Y = 14, PAD_X = 12;

export function DataTable<T>({ columns, rows, getRowId, hidden, groupBy, onRowClick, selectedId, limit, label, className }: DataTableProps<T>) {
  const cols = columns.filter((c) => !hidden?.has(c.id));
  const template = cols.map((c) => c.width).join(" ");
  const [shut, setShut] = useState<Set<string>>(new Set());

  const groups = useMemo(() => {
    if (!groupBy) return [{ g: null as RowGroup | null, rows }];
    const m = new Map<string, { g: RowGroup; rows: T[] }>();
    rows.forEach((r) => {
      const g = groupBy(r);
      if (!m.has(g.key)) m.set(g.key, { g, rows: [] });
      m.get(g.key)!.rows.push(r);
    });
    return [...m.values()];
  }, [rows, groupBy]);

  const toggle = (k: string) => setShut((s) => { const n = new Set(s); n.has(k) ? n.delete(k) : n.add(k); return n; });
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const toggleMore = (k: string) => setExpanded((s) => { const n = new Set(s); n.has(k) ? n.delete(k) : n.add(k); return n; });

  /** Full-width toggle row: clickable and hoverable like a normal row. */
  const moreRow = (k: string, total: number) => {
    const open = expanded.has(k);
    return (
      <div
        key={`more-${k}`}
        role="row"
        tabIndex={0}
        aria-expanded={open}
        onClick={() => toggleMore(k)}
        onKeyDown={(e: KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleMore(k); } }}
        className="group/more col-span-full cursor-pointer outline-none hover:bg-[var(--row-tint)] focus-visible:bg-[var(--row-tint)]"
      >
        <div role="cell" className="border-b border-border px-3 py-2 text-xs font-medium text-text-secondary group-hover/more:text-foreground">
          {open ? "Show less" : `Show all ${total}`}
        </div>
      </div>
    );
  };
  const body = (k: string, rs: T[]) => {
    if (!limit || rs.length <= limit) return rs.map(rowEl);
    return [...rs.slice(0, limit).map(rowEl), moreRow(k, rs.length), ...(expanded.has(k) ? rs.slice(limit).map(rowEl) : [])];
  };

  const cell = (c: Column<T>, content: ReactNode, key: string) => (
    <div
      key={key}
      role="cell"
      className={cn(
        "flex min-w-0 border-b border-border",
        c.valign === "top" ? "items-start" : "items-center",
        c.align === "end" ? "justify-end" : c.align === "center" ? "justify-center" : "justify-start",
        c.className,
      )}
      style={{ padding: `${PAD_Y}px ${c.padRight ?? PAD_X}px ${PAD_Y}px ${PAD_X}px` }}
    >
      {content}
    </div>
  );

  const rowEl = (r: T) => {
    const id = getRowId(r), clickable = !!onRowClick;
    return (
      <div
        key={id}
        role="row"
        tabIndex={clickable ? 0 : undefined}
        aria-selected={selectedId === id || undefined}
        onClick={clickable ? () => onRowClick!(r) : undefined}
        onKeyDown={clickable ? (e: KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onRowClick!(r); } } : undefined}
        className={cn(
          "col-span-full grid grid-cols-subgrid text-sm outline-none",
          clickable && "cursor-pointer hover:bg-[var(--row-tint)] focus-visible:bg-[var(--row-tint)]",
          selectedId === id && "bg-[color-mix(in_srgb,var(--primary)_8%,transparent)]",
        )}
      >
        {cols.map((c) => cell(c, c.render(r), c.id))}
      </div>
    );
  };

  return (
    <div
      role="table"
      aria-label={label}
      className={cn("grid overflow-hidden rounded-[10px] border border-border bg-background [&>[role=row]:last-child>[role=cell]]:border-b-0", className)}
      style={{ gridTemplateColumns: template } as CSSProperties}
    >
      {groups.map(({ g, rows: rs }) => (
        <Fragment key={g?.key ?? "_all"}>
          {g && (
            <div role="row" className="col-span-full">
              <button
                type="button"
                role="cell"
                aria-expanded={!shut.has(g.key)}
                onClick={() => toggle(g.key)}
                className="flex w-full cursor-pointer items-center gap-2 border-0 border-b border-solid border-border bg-[color-mix(in_srgb,var(--foreground)_4%,var(--background))] px-3 py-2 text-left text-sm font-semibold text-foreground hover:bg-[color-mix(in_srgb,var(--foreground)_7%,var(--background))]"
              >
                <span className="flex min-w-0 items-center gap-1.5">{g.label}</span>
                <span className="text-xs font-normal text-muted-foreground">{g.meta ?? rs.length}</span>
                <ChevronDown className={cn("size-3.5 text-muted-foreground transition-transform", shut.has(g.key) && "-rotate-90")} />
              </button>
            </div>
          )}
          {!(g && shut.has(g.key)) && body(g?.key ?? "_all", rs)}
        </Fragment>
      ))}
    </div>
  );
}

/* ---------- cell helpers: the patterns every list uses ---------- */

/** Grouped first cell: ID + 16px icon slot + title with a subline. One 8px gap, one set of padding. */
export function TitleCell({ id, icon, title, sub, monoSub = true }: { id?: ReactNode; icon?: ReactNode | "empty" | false; title: ReactNode; sub?: ReactNode; monoSub?: boolean }) {
  return (
    <div className="flex min-w-0 flex-1 items-start gap-2">
      {id && <span className="flex h-5 shrink-0 items-center font-mono text-sm leading-none text-foreground">{id}</span>}
      {icon !== undefined && icon !== false && <span className="flex h-5 w-4 shrink-0 items-center">{icon === "empty" ? null : icon}</span>}
      <div className="min-w-0 flex-1">
        <div className="text-base font-medium leading-5 text-foreground">{title}</div>
        {sub && <div className={cn("mt-0.5 flex flex-wrap items-center gap-x-1 text-xs leading-[18px] text-muted-foreground [&_svg]:size-3.5", monoSub && "font-mono tracking-[-.025em]")}>{sub}</div>}
      </div>
    </div>
  );
}

/** Priority cell content: badges that wrap with a 4px gap. */
export const BadgeGroup = ({ children }: { children: ReactNode }) => <div className="flex flex-wrap items-center gap-1">{children}</div>;

/** Date cell: main line + optional muted line under it. */
export function DateCell({ main, sub }: { main: ReactNode; sub?: ReactNode }) {
  return (
    <div className="flex flex-col whitespace-nowrap text-xs text-muted-foreground">
      <span>{main}</span>
      {sub && <span className="text-2xs">{sub}</span>}
    </div>
  );
}

/** Trail under a path title, as in the prototype (.mr/.mrn): mono 12px, muted, chevron separators, crown jewel starred at normal weight. */
export function Trail({ items, jewelLast }: { items: string[]; jewelLast?: boolean }) {
  return (
    <span className="flex flex-wrap items-center gap-x-1 font-mono text-xs leading-[18px] tracking-[-0.025em] text-muted-foreground">
      {items.map((t, i) => (
        <Fragment key={i}>
          {i > 0 && <ChevronRight className="size-[9px] shrink-0 text-text-subtle" strokeWidth={2} />}
          <span className="inline-flex items-center gap-1 whitespace-nowrap">
            {jewelLast && i === items.length - 1 && <Star className="size-3 shrink-0 fill-node-crown text-node-crown" strokeWidth={0} />}
            {t}
          </span>
        </Fragment>
      ))}
    </span>
  );
}
