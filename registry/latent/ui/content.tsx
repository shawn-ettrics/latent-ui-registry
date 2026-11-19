import { useState, type ReactNode } from "react";
import { Check, Copy, Info, AlertTriangle, OctagonAlert, CircleCheck } from "lucide-react";
import { cn } from "@/registry/latent/lib/utils";

/* ---------------------------------------------------------------- *
 * Content blocks used on detail pages: Section, Callout, CodeBlock,
 * KeyValue. Sizes come from the type scale; colours from tokens.
 * ---------------------------------------------------------------- */

/** Pill count next to a heading: "Findings it resolves (61)". */
export const Count = ({ children }: { children: ReactNode }) => (
  <span className="inline-flex h-[18px] items-center rounded-full bg-secondary px-1.5 text-2xs leading-none font-medium text-text-secondary">{children}</span>
);

/** Section: 18px semibold heading, optional count and a right-aligned action (e.g. "See all →"). */
export function Section({ title, count, action, children, className }: { title: ReactNode; count?: ReactNode; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("flex w-full flex-col gap-3", className)}>
      <header className="flex items-center gap-2">
        <h3 className="m-0 text-xl font-semibold text-foreground">{title}</h3>
        {count != null && <Count>{count}</Count>}
        {action && <div className="ml-auto text-sm">{action}</div>}
      </header>
      {children}
    </section>
  );
}

/* ---------- Callout ---------- */
const TONE = {
  neutral: { box: "border-border bg-background", icon: null },
  info: { box: "border-[color:color-mix(in_srgb,var(--info-emphasis)_35%,var(--border))] bg-info-muted", icon: Info, ic: "text-info-fg" },
  success: { box: "border-[color:color-mix(in_srgb,var(--success-emphasis)_35%,var(--border))] bg-success-muted", icon: CircleCheck, ic: "text-success-fg" },
  warning: { box: "border-[color:color-mix(in_srgb,var(--warning-emphasis)_35%,var(--border))] bg-warning-muted", icon: AlertTriangle, ic: "text-warning-fg" },
  danger: { box: "border-[color:color-mix(in_srgb,var(--danger-emphasis)_35%,var(--border))] bg-danger-muted", icon: OctagonAlert, ic: "text-danger-fg" },
} as const;

/**
 * Callout: a bordered block with an optional footer strip.
 * neutral = the remediation "What to change / Risk removed / …" card; info/success/warning/danger add an icon and tint.
 */
export function Callout({ tone = "neutral", title, children, footer, className }: { tone?: keyof typeof TONE; title?: ReactNode; children: ReactNode; footer?: ReactNode; className?: string }) {
  const t = TONE[tone];
  const Icon = t.icon;
  return (
    <div className={cn("w-full overflow-hidden rounded-[10px] border", t.box, className)}>
      <div className={cn("flex gap-2.5 px-4 py-3.5", Icon && "items-start")}>
        {Icon && <Icon className={cn("mt-0.5 size-4 shrink-0", "ic" in t && t.ic)} strokeWidth={1.75} />}
        <div className="min-w-0 flex-1 text-base leading-[1.55] text-text-secondary [&_b]:font-semibold [&_b]:text-foreground [&_p]:m-0 [&_p+p]:mt-2.5">
          {title && <div className="mb-1 font-semibold text-foreground">{title}</div>}
          {children}
        </div>
      </div>
      {footer && <div className="flex flex-wrap items-center gap-3 border-t border-border bg-surface-subtle px-4 py-2.5 text-sm text-text-secondary">{footer}</div>}
    </div>
  );
}

/* ---------- CodeBlock ---------- */
/** Evidence / code snippet: header strip (icon, kind, source, badge, copy) over mono code. */
export function CodeBlock({ icon, kind, source, badge, children, className }: { icon?: ReactNode; kind?: ReactNode; source?: ReactNode; badge?: ReactNode; children: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard?.writeText(children).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1200); }).catch(() => {}); };
  return (
    <div className={cn("w-full overflow-hidden rounded-lg border border-border", className)}>
      {(kind || source || badge) && (
        <div className="flex h-[30px] items-center gap-1.5 bg-surface-subtle px-2.5 text-xs text-foreground [&>svg]:size-3.5 [&>svg]:text-muted-foreground">
          {icon}
          {kind && <b className="font-semibold">{kind}</b>}
          {source && <span className="truncate text-muted-foreground">· {source}</span>}
          <span className="ml-auto flex items-center gap-1.5">
            {badge}
            <button type="button" onClick={copy} aria-label="Copy" className="inline-flex size-6 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground">
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            </button>
          </span>
        </div>
      )}
      <pre className="m-0 overflow-x-auto bg-background px-2.5 py-2 font-mono text-2xs leading-[1.5] text-foreground">{children}</pre>
    </div>
  );
}

/* ---------- KeyValue ---------- */
/** Label / value rows with a hairline between them: "Mechanism · T1190 Exploit Public-Facing Application". */
export function KeyValue({ items, labelWidth = 160, className }: { items: [ReactNode, ReactNode][]; labelWidth?: number; className?: string }) {
  return (
    <dl className={cn("m-0 grid w-full text-sm", className)} style={{ gridTemplateColumns: `${labelWidth}px minmax(0,1fr)` }}>
      {items.map(([k, v], i) => (
        <div key={i} className="col-span-full grid grid-cols-subgrid border-b border-border py-1.5 last:border-b-0">
          <dt className="pr-3 text-muted-foreground">{k}</dt>
          <dd className="m-0 min-w-0 text-foreground">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
