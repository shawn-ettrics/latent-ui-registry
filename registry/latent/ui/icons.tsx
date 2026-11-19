import { cn } from "@/registry/latent/lib/utils";

export type Verdict = "Confirmed" | "Conditional" | "Inconclusive" | "Refuted";
/** Processing states shown in the verdict slot before (or instead of) a verdict. */
export type VerdictState = Verdict | "Assessing" | "Failed";
export type RemStatus = "Open" | "In progress" | "Resolved" | "Dismissed";

/** Shared 24px grid: r=9 ring, 2.25 stroke, round caps. Verdict and status icons match in optical size. */
function Glyph({ className, children, ...rest }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={cn("size-4 shrink-0", className)}
      {...rest}
    >
      {children}
    </svg>
  );
}

const VERDICT_COLOR: Record<VerdictState, string> = {
  Assessing: "text-verdict-assessing-fg",
  Failed: "text-verdict-failed-fg",
  Confirmed: "text-verdict-confirmed-fg",
  Conditional: "text-verdict-conditional-fg",
  Inconclusive: "text-verdict-inconclusive-fg",
  Refuted: "text-verdict-refuted-fg",
};

/** Verdict glyph. Colour comes from the verdict tokens unless `className` overrides it. */
export function VerdictIcon({ verdict, className }: { verdict: VerdictState; className?: string }) {
  if (verdict === "Assessing")
    return (
      <Glyph className={cn(VERDICT_COLOR.Assessing, "animate-spin", className)}>
        <circle cx="12" cy="12" r="9" strokeDasharray="39 17.5" />
      </Glyph>
    );
  if (verdict === "Failed")
    return (
      <Glyph className={cn(VERDICT_COLOR.Failed, className)}>
        <mask id="ld-failed-cut">
          <rect width="24" height="24" fill="white" />
          <path d="M12 7.2v5.6M12 16.6h.01" stroke="black" />
        </mask>
        <circle cx="12" cy="12" r="10.125" fill="currentColor" stroke="none" mask="url(#ld-failed-cut)" />
      </Glyph>
    );
  return (
    <Glyph className={cn(VERDICT_COLOR[verdict], className)}>
      <circle cx="12" cy="12" r="9" />
      {verdict === "Confirmed" && <path d="m8.5 12 2.5 2.5 4.5-5" />}
      {verdict === "Conditional" && <path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" />}
      {verdict === "Inconclusive" && (
        <>
          <path d="M9.5 9.5a2.5 2.5 0 0 1 4.8.9c0 1.7-2.3 2.1-2.3 3.3" />
          <path d="M12 17h.01" />
        </>
      )}
      {verdict === "Refuted" && <path d="M5.6 18.4 18.4 5.6" />}
    </Glyph>
  );
}

const STATUS_COLOR: Record<RemStatus, string> = {
  Open: "text-[var(--status-open)]",
  "In progress": "text-[var(--status-in-progress)]",
  Resolved: "text-[var(--status-resolved)]",
  Dismissed: "text-[var(--status-dismissed)]",
};

/** Remediation status glyph, drawn on the same grid as VerdictIcon. */
export function StatusIcon({ status, className }: { status: RemStatus; className?: string }) {
  return (
    <Glyph className={cn(STATUS_COLOR[status], className)}>
      {status === "Open" && <circle cx="12" cy="12" r="9" />}
      {status === "In progress" && (
        <>
          <circle cx="12" cy="12" r="9" strokeDasharray="3.6 3.47" strokeLinecap="butt" />
          <circle cx="12" cy="12" r="2.6" fill="currentColor" stroke="none" />
        </>
      )}
      {status === "Resolved" && (
        <>
          <mask id="ld-resolved-cut">
            <rect width="24" height="24" fill="white" />
            <path d="m8.5 12 2.5 2.5 4.5-5" stroke="black" />
          </mask>
          <circle cx="12" cy="12" r="10.125" fill="currentColor" stroke="none" mask="url(#ld-resolved-cut)" />
        </>
      )}
      {status === "Dismissed" && (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M5.6 18.4 18.4 5.6" />
        </>
      )}
    </Glyph>
  );
}
