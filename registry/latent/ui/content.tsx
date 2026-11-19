import { useState, type ReactNode } from "react";
import { Check, Copy, Info, AlertTriangle, OctagonAlert, CircleCheck, type LucideIcon } from "lucide-react";
import { Button } from "@/registry/latent/ui/button";
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
  /* rationale tones: tinted by a priority or verdict; title and inline code take the tone colour, no icon */
  critical: { box: "[--cf:var(--priority-critical-fg)] border-[color:color-mix(in_srgb,var(--priority-critical-emphasis)_35%,transparent)] bg-priority-critical-muted", icon: null },
  high: { box: "[--cf:var(--priority-high-fg)] border-[color:color-mix(in_srgb,var(--priority-high-emphasis)_35%,transparent)] bg-priority-high-muted", icon: null },
  medium: { box: "[--cf:var(--priority-medium-fg)] border-[color:color-mix(in_srgb,var(--priority-medium-emphasis)_35%,transparent)] bg-priority-medium-muted", icon: null },
  low: { box: "[--cf:var(--priority-low-fg)] border-[color:color-mix(in_srgb,var(--priority-low-emphasis)_35%,transparent)] bg-priority-low-muted", icon: null },
  confirmed: { box: "[--cf:var(--verdict-confirmed-fg)] border-[color:color-mix(in_srgb,var(--verdict-confirmed-fg)_35%,transparent)] bg-verdict-confirmed-muted", icon: null },
  conditional: { box: "[--cf:var(--verdict-conditional-fg)] border-[color:color-mix(in_srgb,var(--verdict-conditional-fg)_35%,transparent)] bg-verdict-conditional-muted", icon: null },
  inconclusive: { box: "[--cf:var(--verdict-inconclusive-fg)] border-[color:color-mix(in_srgb,var(--verdict-inconclusive-fg)_35%,transparent)] bg-verdict-inconclusive-muted", icon: null },
  refuted: { box: "[--cf:var(--verdict-refuted-fg)] border-[color:color-mix(in_srgb,var(--verdict-refuted-fg)_35%,transparent)] bg-verdict-refuted-muted", icon: null },
} as const;
export type CalloutTone = keyof typeof TONE;

/**
 * Callout: a bordered block with an optional footer strip.
 * neutral = the remediation "What to change / Risk removed / …" card; info/success/warning/danger add an icon and tint.
 * critical/high/medium/low and confirmed/conditional/inconclusive/refuted are rationale tones ("Why High"): tinted fill, coloured title, `note` beside it.
 * `icon` overrides the tone icon; `action` adds a small button under the text (destructive on danger, primary otherwise).
 */
export function Callout({ tone = "neutral", title, children, footer, icon, action, note, className }: { tone?: keyof typeof TONE; title?: ReactNode; note?: ReactNode; children: ReactNode; footer?: ReactNode; icon?: LucideIcon; action?: { label: ReactNode; onClick?: () => void }; className?: string }) {
  const t = TONE[tone];
  const Icon = icon ?? t.icon;
  return (
    <div className={cn("w-full overflow-hidden rounded-[10px] border", t.box, className)}>
      <div className={cn("flex gap-2.5 px-4 py-3.5", Icon && "items-start")}>
        {Icon && <Icon className={cn("mt-0.5 size-4 shrink-0", "ic" in t && t.ic)} strokeWidth={1.75} />}
        <div className="min-w-0 flex-1 text-base leading-[1.65] text-text-secondary [&_b]:font-semibold [&_b]:text-foreground [&_p]:m-0 [&_p+p]:mt-2.5 [&_code]:font-mono [&_code]:text-[0.9em] [&_code]:tracking-[-0.025em] [&_code]:text-[color:var(--cf,var(--foreground))]">
          {title && <div className="mb-1 flex items-center gap-2 font-semibold text-[color:var(--cf,var(--foreground))]">{title}{note && <span className="text-2xs font-medium opacity-75">{note}</span>}</div>}
          {children}
          {action && <div className="mt-3"><Button size="sm" variant={tone === "danger" ? "destructive" : "primary"} onClick={action.onClick}>{action.label}</Button></div>}
        </div>
      </div>
      {footer && <div className="flex flex-wrap items-center gap-3 border-t border-border bg-surface-subtle px-4 py-2.5 text-sm text-text-secondary">{footer}</div>}
    </div>
  );
}

/* ---------- tiny syntax highlighter (JSON, YAML, HCL, shell, HTTP) ---------- */
const TOK = /((?<![:\w])#[^\n{]*|(?<![:\w])\/\/[^\n]*)|("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')(\s*:)?|^(\s*-?\s*)([A-Za-z_][\w.-]*)(?=\s*[:=]\s)|\b(true|false|null|none|Allow|Deny|export|function|const|let|return|import|from|GET|POST|PUT|PATCH|DELETE|resource|data|module)\b|(\b\d+(?:\.\d+)?\b)/gm;
const C = {
  comment: "text-muted-foreground italic",
  key: "text-[color:var(--blue-700)] dark:text-[color:var(--blue-300)]",
  string: "text-[color:var(--green-700)] dark:text-[color:var(--green-300)]",
  keyword: "text-[color:var(--purple-600)] dark:text-[color:var(--purple-300)]",
  number: "text-[color:var(--orange-700)] dark:text-[color:var(--orange-300)]",
};
function highlight(code: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0, k = 0;
  for (const m of code.matchAll(TOK)) {
    const i = m.index ?? 0;
    if (i > last) out.push(code.slice(last, i));
    const [all, com, str, colon, lead, ykey, kw, num] = m;
    if (com) out.push(<span key={k++} className={C.comment}>{com}</span>);
    else if (str) { out.push(<span key={k++} className={colon ? C.key : C.string}>{str}</span>); if (colon) out.push(colon); }
    else if (ykey) { out.push(lead ?? "", <span key={k++} className={C.key}>{ykey}</span>); }
    else if (kw) out.push(<span key={k++} className={C.keyword}>{kw}</span>);
    else if (num) out.push(<span key={k++} className={C.number}>{num}</span>);
    else out.push(all);
    last = i + all.length;
  }
  if (last < code.length) out.push(code.slice(last));
  return out;
}

/* ---------- CodeBlock ---------- */
/** Evidence / code snippet: header strip (icon, kind, source, badge, copy) over mono code on a muted fill. Highlights keys, strings, numbers, keywords and comments; pass highlight={false} for plain text. */
export function CodeBlock({ icon, kind, source, badge, children, highlight: hl = true, className }: { icon?: ReactNode; kind?: ReactNode; source?: ReactNode; badge?: ReactNode; children: string; highlight?: boolean; className?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard?.writeText(children).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1200); }).catch(() => {}); };
  return (
    <div className={cn("w-full overflow-hidden rounded-lg border border-border", className)}>
      {(kind || source || badge) && (
        <div className="flex h-9 items-center gap-1.5 border-b border-border px-3 text-xs text-foreground [&>svg]:size-3.5 [&>svg]:text-muted-foreground">
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
      <pre className="m-0 overflow-x-auto bg-surface-subtle px-3 py-2.5 font-mono text-sm leading-[1.65] text-foreground">{hl ? highlight(children) : children}</pre>
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
