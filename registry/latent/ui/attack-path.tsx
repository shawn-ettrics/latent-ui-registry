import { Fragment, type CSSProperties, type ReactNode } from "react";
import { Split, Star, Wrench, type LucideIcon } from "lucide-react";
import { cn } from "@/registry/latent/lib/utils";
import { Tooltip } from "@/registry/latent/ui/tooltip";

/* ------------------------------------------------------------------ *
 * Geometry. Every tile, step number and line segment is centred on one
 * vertical rail at RAIL px from the left of the path. Zone boxes pull
 * out with a negative margin and push their content back with the same
 * padding minus their 1px border, so the rail never moves when a line
 * crosses a box edge. Connectors that touch a box edge overlap the
 * border by 1px so the line stays continuous through it.
 * ------------------------------------------------------------------ */
const TILE_W = 90;
const TILE_H = 64;
const RAIL = TILE_W / 2; // 45
const GAP = 46; // node → step → node distance when no box edge is crossed
const HALF = GAP / 2; // each side of a box edge
const BOX_L = 32; // how far a zone box extends left of the rail column
const BOX_R = 16;
const BORDER = 1;

/* ---------- tile ---------- */
export function Tile({ icon: Icon, on = true, selected, dead, className }: { icon: LucideIcon; on?: boolean; selected?: boolean; dead?: boolean; className?: string }) {
  return (
    <span
      className={cn("ld-tile relative block shrink-0", on ? "ld-tile-on" : "ld-tile-off", selected && "ld-tile-sel", dead && "ld-tile-dead", className)}
      style={{ width: TILE_W, height: TILE_H }}
      aria-hidden
    >
      <svg viewBox="0 0 56 40" width={TILE_W} height={TILE_H} className="absolute inset-0 overflow-visible">
        <polygon className="ld-tl" points="4,15 28,27 28,35 4,23" />
        <polygon className="ld-tr" points="28,27 52,15 52,23 28,35" />
        <polygon className="ld-tp" points="28,3 52,15 28,27 4,15" />
      </svg>
      <span
        className="absolute flex text-white"
        style={{ left: RAIL, top: 24, transform: "translate(-50%,-50%) scaleY(.58)", fontSize: "var(--fs-2xl)" }}
      >
        <Icon className="size-[1em]" strokeWidth={1.75} />
      </span>
    </span>
  );
}

/* ---------- data ---------- */
export type LinkState = "ok" | "conditional" | "blocked";
export interface PathZone { name: string; env?: string }
export interface PathNode {
  icon: LucideIcon;
  /** Bold line: the resource type or entry point, e.g. "Build runner" */
  title: string;
  /** Second line: resource name (mono) or a plain description for entry points */
  name?: string;
  mono?: boolean;
  jewel?: boolean;
  /** Cloud account / environment box this node sits in. Entry points usually have none. */
  zone?: PathZone;
  /** Other paths that continue from or into this resource */
  branches?: number;
}
export interface PathLink {
  /** What the attacker does on this step, used as the tooltip */
  title?: string;
  state?: LinkState;
  remediations?: number;
}

/* ---------- pieces ---------- */
function Line({ h, on, state = "ok", into, out }: { h: number; on: boolean; state?: LinkState; into?: boolean; out?: boolean }) {
  // into/out: this segment touches a box border on its top/bottom; overlap the 1px border so the line is unbroken
  return (
    <div
      className="relative"
      style={{ width: TILE_W, height: h + (into ? BORDER : 0) + (out ? BORDER : 0), marginTop: into ? -BORDER : 0, marginBottom: out ? -BORDER : 0, zIndex: 1 }}
    >
      <span
        className={cn("absolute top-0 bottom-0", `ld-line-${state}`, on && "ld-line-on")}
        style={{ left: RAIL - 1, width: 2 }}
      />
    </div>
  );
}

function Step({ n, link, on, selected, onSelect }: { n: number; link: PathLink; on: boolean; selected: boolean; onSelect?: () => void }) {
  const body = (
    <div className="relative flex items-center" style={{ height: 30 }}>
      {/* rail continues behind the number */}
      <span className={cn("absolute top-0 bottom-0", `ld-line-${link.state ?? "ok"}`, on && "ld-line-on")} style={{ left: RAIL - 1, width: 2 }} />
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "relative z-[1] flex shrink-0 cursor-pointer items-center justify-center rounded-full bg-card text-sm font-medium text-text-secondary",
          selected ? "border-2 border-primary font-semibold text-link" : "border border-[color:color-mix(in_srgb,var(--primary)_26%,transparent)] hover:border-primary",
        )}
        style={{ width: 30, height: 28, marginLeft: RAIL - 15 }}
        aria-label={`Step ${n}${link.title ? `: ${link.title}` : ""}`}
      >
        {n}
      </button>
      {!!link.remediations && <Pill icon={Wrench} n={link.remediations} className="ml-2.5" label={`${link.remediations} remediation${link.remediations > 1 ? "s" : ""} block this step`} />}
    </div>
  );
  return link.title ? <Tooltip content={`Step ${n}: ${link.title}`}>{body}</Tooltip> : body;
}

function Pill({ icon: Icon, n, label, className }: { icon: LucideIcon; n: number; label: string; className?: string }) {
  return (
    <Tooltip content={label}>
      <span className={cn("relative z-[1] inline-flex h-[30px] items-center gap-1 rounded-full border border-[color:color-mix(in_srgb,var(--primary)_26%,transparent)] bg-card px-2.5 text-sm text-text-secondary", className)}>
        <Icon className="size-4" strokeWidth={1.75} />
        {n}
      </span>
    </Tooltip>
  );
}

function Node({ node, on, selected, onSelect }: { node: PathNode; on: boolean; selected: boolean; onSelect?: () => void }) {
  return (
    <div className="group relative flex cursor-pointer items-center" style={{ height: TILE_H }} onClick={onSelect}>
      <Tile icon={node.icon} on={on} selected={selected} />
      <div className="ml-2.5 flex min-w-0 flex-col">
        <b className={cn("text-sm font-semibold", selected ? "text-foreground" : "text-text-secondary group-hover:text-foreground")}>{node.title}</b>
        {node.name && (
          <span className={cn("flex items-center gap-1.5 truncate text-xs text-text-secondary", node.mono && "font-mono")}>
            {node.jewel && <Star className="size-2.5 shrink-0 fill-node-crown text-node-crown" />}
            {node.name}
          </span>
        )}
      </div>
      {!!node.branches && <Pill icon={Split} n={node.branches} className="ml-4" label={`${node.branches} other path${node.branches > 1 ? "s" : ""} continue from here`} />}
    </div>
  );
}

function Zone({ zone, last, children }: { zone: PathZone; last: boolean; children: ReactNode }) {
  const style: CSSProperties = {
    marginLeft: -BOX_L,
    marginRight: -BOX_R,
    paddingLeft: BOX_L - BORDER,
    paddingRight: BOX_R - BORDER,
    paddingBottom: last ? 12 : 0,
    borderWidth: BORDER,
  };
  return (
    <div className="ld-zone relative rounded-[10px] border-solid" style={style}>
      <span className="absolute top-[5px] right-3 text-2xs font-medium text-muted-foreground">
        <code className="font-mono text-text-secondary">{zone.name}</code>
        {zone.env && <> · {zone.env}</>}
      </span>
      {children}
    </div>
  );
}

/* ---------- path ---------- */
export interface AttackPathProps {
  nodes: PathNode[];
  /** links[i] connects nodes[i] → nodes[i+1]; it is step i+1 */
  links: PathLink[];
  /** 1-based selected step. Nodes and links up to it render "on". */
  step?: number;
  /** Selected node index, outlines that tile. */
  node?: number;
  onSelectStep?: (step: number) => void;
  onSelectNode?: (index: number) => void;
  className?: string;
}

export function AttackPath({ nodes, links, step = 1, node, onSelectStep, onSelectNode, className }: AttackPathProps) {
  // group consecutive nodes by zone, keeping the order
  const groups: { zone?: PathZone; idx: number[] }[] = [];
  nodes.forEach((n, i) => {
    const g = groups[groups.length - 1];
    const same = g && g.zone && n.zone && g.zone.name === n.zone.name && g.zone.env === n.zone.env;
    if (same) g.idx.push(i);
    else groups.push({ zone: n.zone, idx: [i] });
  });
  const onNode = (i: number) => i <= step;
  const onLink = (s: number) => s <= step; // s is 1-based

  const renderGroup = (g: (typeof groups)[number], gi: number) => {
    const inBox = !!g.zone;
    const out: ReactNode[] = [];
    g.idx.forEach((i, k) => {
      const first = k === 0, lastInGroup = k === g.idx.length - 1;
      // the half-line arriving from the previous group, inside this box
      if (first && i > 0 && inBox) out.push(<Line key={`in${i}`} h={HALF} on={onLink(i)} state={links[i - 1]?.state} into />);
      out.push(<Node key={`n${i}`} node={nodes[i]} on={onNode(i)} selected={node === i} onSelect={() => onSelectNode?.(i)} />);
      if (i === nodes.length - 1) return;
      const l = links[i] ?? {}, s = i + 1;
      if (lastInGroup) {
        // leaving this group: half-line inside the box (or full gap if no box) up to the edge
        if (inBox) out.push(<Line key={`o${i}`} h={HALF} on={onLink(s)} state={l.state} out />);
        return;
      }
      // step inside the same group
      out.push(<Line key={`a${i}`} h={GAP} on={onLink(s)} state={l.state} />);
      out.push(<Step key={`s${i}`} n={s} link={l} on={onLink(s)} selected={step === s} onSelect={() => onSelectStep?.(s)} />);
      out.push(<Line key={`b${i}`} h={GAP} on={onLink(s)} state={l.state} />);
    });
    return inBox ? <Zone key={`g${gi}`} zone={g.zone!} last={gi === groups.length - 1}>{out}</Zone> : <Fragment key={`g${gi}`}>{out}</Fragment>;
  };

  return (
    <div className={cn("ld-path relative isolate w-max", className)} style={{ paddingLeft: BOX_L, paddingRight: BOX_R }}>
      {groups.map((g, gi) => {
        const next = groups[gi + 1];
        if (!next) return renderGroup(g, gi);
        // the step that crosses from this group into the next one sits between the boxes
        const i = g.idx[g.idx.length - 1], s = i + 1, l = links[i] ?? {};
        const leftBox = !!g.zone, rightBox = !!next.zone;
        return (
          <Fragment key={`x${gi}`}>
            {renderGroup(g, gi)}
            <Line h={leftBox ? HALF : GAP} on={onLink(s)} state={l.state} />
            <Step n={s} link={l} on={onLink(s)} selected={step === s} onSelect={() => onSelectStep?.(s)} />
            <Line h={rightBox ? HALF : GAP} on={onLink(s)} state={l.state} />
          </Fragment>
        );
      })}
      <style>{PATH_CSS}</style>
    </div>
  );
}

/* tile + line colours; light and dark */
const PATH_CSS = `
.ld-tile-on .ld-tp{fill:var(--blue-500);stroke:var(--blue-400);stroke-width:.75}
.ld-tile-on .ld-tl{fill:var(--primary-hover)}
.ld-tile-on .ld-tr{fill:var(--blue-600)}
.ld-tile-off .ld-tp{fill:var(--blue-200);stroke:var(--blue-100);stroke-width:.75}
.ld-tile-off .ld-tl,.ld-tile-off .ld-tr{fill:var(--blue-300)}
.ld-tile-sel .ld-tp{stroke:var(--blue-400);stroke-width:1}
.ld-tile-dead .ld-tp{fill:var(--gray-300);stroke:var(--gray-200)}
.ld-tile-dead .ld-tl{fill:var(--gray-350)}.ld-tile-dead .ld-tr{fill:var(--gray-300)}
.group:hover .ld-tile-on .ld-tp{fill:var(--blue-400)}
.group:hover .ld-tile-off .ld-tp{fill:var(--blue-300)}
.dark .ld-tile-on .ld-tp{fill:var(--blue-400);stroke:var(--blue-300)}
.dark .ld-tile-on .ld-tr{fill:var(--blue-400)}
.dark .ld-tile-off .ld-tp{fill:color-mix(in srgb,var(--blue-500) 26%,transparent);stroke:color-mix(in srgb,var(--blue-400) 35%,transparent)}
.dark .ld-tile-off .ld-tl,.dark .ld-tile-off .ld-tr{fill:color-mix(in srgb,var(--blue-500) 45%,transparent)}
.dark .ld-tile-sel .ld-tp{stroke:var(--blue-300)}
.ld-line-ok{background:color-mix(in srgb,var(--primary) 26%,transparent)}
.ld-line-ok.ld-line-on{background:var(--primary)}
.ld-line-conditional{background:repeating-linear-gradient(180deg,color-mix(in srgb,var(--primary) 26%,transparent) 0 4px,transparent 4px 8px)}
.ld-line-conditional.ld-line-on{background:repeating-linear-gradient(180deg,var(--primary) 0 4px,transparent 4px 8px)}
.ld-line-blocked{background:var(--gray-300)}
.dark .ld-line-blocked{background:var(--gray-650)}
.ld-zone{background:var(--gray-50);border-color:var(--gray-200)}
.dark .ld-zone{background:var(--gray-750);border-color:var(--gray-675)}
`;
