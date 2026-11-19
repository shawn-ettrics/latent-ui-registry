import { StrictMode, useEffect, useState, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { ChevronDown, Filter, Maximize, Minus, Plus, SlidersHorizontal, Sparkles, Trash2, X, Cloud, Code, Flag, LayoutGrid, Layers, List, Plug, Route, Scale, Star, Ticket, UserCircle, Users, Wrench } from "lucide-react";
import "./index.css";
import { TooltipProvider } from "@/registry/latent/ui/tooltip";
import { Button } from "@/registry/latent/ui/button";
import { Section, Callout, CodeBlock, KeyValue, Count } from "@/registry/latent/ui/content";
import { Field, Checkbox, Switch, RadioGroup, Select, Textarea } from "@/registry/latent/ui/form";
import { Dialog, ToastProvider, useToast } from "@/registry/latent/ui/dialog";
import { Code as CodeIcon, FlaskConical } from "lucide-react";
import { Tabs } from "@/registry/latent/ui/tabs";
import { Toolbar, SearchField } from "@/registry/latent/ui/toolbar";
import { Menu, MenuTrigger, MenuContent, MenuItem, MenuCheckboxItem, MenuLabel, MenuSeparator, MenuSub, DisplayMenu, FilterMenu } from "@/registry/latent/ui/menu";
import { DataTable, TitleCell, BadgeGroup, DateCell, Trail, type Column } from "@/registry/latent/ui/data-table";
import { AttackPath, Tile, type PathNode, type PathLink } from "@/registry/latent/ui/attack-path";
import { Key, Settings, ShieldCheck, Lock, Database, Globe, Network, Container, KeyRound } from "lucide-react";
import { Badge, FilterBadge, ToggleBadge, type BadgeTone } from "@/registry/latent/ui/badge";
import { StatusIcon, VerdictIcon, type RemStatus, type VerdictState } from "@/registry/latent/ui/icons";
import { CountChip, CountGroup } from "@/registry/latent/ui/count-chip";
import { Input } from "@/registry/latent/ui/input";
import { StatusSelect } from "@/registry/latent/ui/status-select";
import { Sidebar, SidebarBranchSwitcher, SidebarItem, SidebarOrgSwitcher, SidebarSection } from "@/registry/latent/ui/sidebar";
import { LatentLogo } from "@/registry/latent/ui/logo";
import { cn } from "@/registry/latent/lib/utils";
import { OBJECT_ICONS } from "@/registry/latent/lib/object-icons";

// install commands use whatever host serves the docs, so they are right on pages.dev, workers.dev or a custom domain
const URL_BASE = (/^https?:\/\/localhost/.test(location.origin) ? "https://latent-ui-registry.shawn-be0.workers.dev" : location.origin) + "/r";
const PRI = ["Critical", "High", "Medium", "Low"];
const VER: VerdictState[] = ["Assessing", "Failed", "Confirmed", "Conditional", "Inconclusive", "Refuted"];
const ST: RemStatus[] = ["Open", "In progress", "Resolved", "Dismissed"];

/* ---------- doc building blocks (same look as the design-system doc) ---------- */
const Pre = ({ children }: { children: string }) => (
  <pre className="m-0 overflow-auto rounded-lg border border-[var(--code-border)] bg-[var(--code-bg)] px-3.5 py-3 font-mono text-xs leading-5">{children}</pre>
);
const H2 = ({ children }: { children: ReactNode }) => <h2 className="mt-9 mb-2.5 text-base font-semibold">{children}</h2>;
function Preview({ label, children, col }: { label?: string; children: ReactNode; col?: boolean }) {
  return (
    <div className="mt-2.5 first:mt-0">
      {label && <p className="m-0 mb-1.5 text-xs text-muted-foreground">{label}</p>}
      <div className={cn("flex flex-wrap items-center gap-3 rounded-xl border border-border bg-background p-6", col && "flex-col items-start")}>{children}</div>
    </div>
  );
}
function Props({ rows }: { rows: [string, string, string][] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr>{["Prop", "Type", "Notes"].map((h) => <th key={h} className="border-b border-border px-2.5 py-2 text-left font-medium text-muted-foreground">{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map(([p, t, n]) => (
            <tr key={p} className="[&:last-child>td]:border-0">
              <td className="border-b border-border px-2.5 py-2 font-mono whitespace-nowrap">{p}</td>
              <td className="border-b border-border px-2.5 py-2 font-mono text-[11px] text-muted-foreground">{t}</td>
              <td className="border-b border-border px-2.5 py-2">{n}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface Page { id: string; name: string; group: "Getting started" | "Foundations" | "Components"; desc: string; item?: string; body: () => ReactNode; usage?: string; props?: [string, string, string][] }

/* ---------- live demos that hold state ---------- */
const SCALE: [string, number, number, string, string][] = [
  ["2xs", 11.5, 12, "Meta: timestamps, counts", "Changed 2 days ago"],
  ["xs", 12, 12.5, "Badges, chips, trails, IDs", "AP-2397 · prod-core"],
  ["sm", 13, 13.5, "UI: nav, menus, inputs, buttons", "Attack paths"],
  ["base", 14, 15, "Paragraphs, row titles", "Anyone on the internet can query orders-db"],
  ["lg", 15.5, 16.5, "Section headings", "Steps & evidence"],
  ["xl", 18, 20, "Panel and detail titles", "Remove unused admin permissions"],
  ["2xl", 21, 24, "Page titles", "Attack paths"],
  ["3xl", 28, 32, "Big numbers", "1,532"],
];
const ROLES: [string, string, string, string][] = [
    ["Breadcrumb / page heading", "base", "400", "Attack paths / AP-2100"],
    ["Detail title", "xl", "400", "Anyone on the internet can query orders-db"],
    ["Section heading", "xl", "600", "Steps & evidence"],
    ["Row title", "base", "400", "A leaked CI token can query orders-db"],
    ["Paragraph", "base", "400 · 1.55", "Starting from the internet, an attacker…"],
    ["UI text (nav, menus, buttons)", "sm", "400 / 500 active", "Attack paths"],
    ["Labels, buttons", "sm", "500", "Generate plan"],
    ["Badges, chips, IDs, trails", "xs", "500 badges · 400 mono", "AP-2397 · Critical"],
    ["Meta", "2xs", "400", "Changed 2 days ago"],
    ["Big number", "3xl", "600", "1,532"]
];
function TypeScale() {
  const [w, setW] = useState(innerWidth);
  useEffect(() => { const on = () => setW(innerWidth); addEventListener("resize", on); return () => removeEventListener("resize", on); }, []);
  const at = (lo: number, hi: number) => Math.round(Math.min(hi, Math.max(lo, lo + ((hi - lo) * (w - 1280)) / 640)) * 10) / 10;
  return (
    <>
      <p className="mt-0 text-muted-foreground">Your window is {w}px wide. Resize it to see sizes move.</p>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full border-collapse text-xs">
          <thead><tr>{["Token", "1280px", "1920px", "Now", "Use", "Sample"].map((h) => <th key={h} className="border-b border-border px-2.5 py-2 text-left font-medium text-muted-foreground">{h}</th>)}</tr></thead>
          <tbody>
            {SCALE.map(([k, lo, hi, use, ex]) => (
              <tr key={k} className="[&:last-child>td]:border-0">
                <td className="border-b border-border px-2.5 py-2 font-mono whitespace-nowrap">text-{k}</td>
                <td className="border-b border-border px-2.5 py-2 font-mono text-muted-foreground">{lo}</td>
                <td className="border-b border-border px-2.5 py-2 font-mono text-muted-foreground">{hi}</td>
                <td className="border-b border-border px-2.5 py-2 font-mono">{at(lo, hi)}</td>
                <td className="border-b border-border px-2.5 py-2 text-muted-foreground">{use}</td>
                <td className="border-b border-border px-2.5 py-2" style={{ fontSize: `var(--fs-${k})`, lineHeight: 1.25 }}>{ex}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <H2>Roles and weights</H2>
      <p className="mt-0 text-muted-foreground">Titles stay regular weight. Only section headings and big numbers are semibold; medium is for labels, buttons and badges.</p>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full border-collapse text-xs">
          <thead><tr>{["Role", "Size", "Weight", "Sample"].map((h) => <th key={h} className="border-b border-border px-2.5 py-2 text-left font-medium text-muted-foreground">{h}</th>)}</tr></thead>
          <tbody>{ROLES.map(([r, z, w, ex]) => (
            <tr key={r} className="[&:last-child>td]:border-0">
              <td className="border-b border-border px-2.5 py-2">{r}</td>
              <td className="border-b border-border px-2.5 py-2 font-mono text-muted-foreground">text-{z}</td>
              <td className="border-b border-border px-2.5 py-2 font-mono text-muted-foreground">{w}</td>
              <td className="border-b border-border px-2.5 py-2" style={{ fontSize: `var(--fs-${z.split(" ")[0]})`, fontWeight: +w.slice(0, 3) || 400 }}>{ex}</td>
            </tr>))}</tbody>
        </table>
      </div>
      <H2>Line height</H2>
      <p className="m-0 text-muted-foreground">Paragraphs 1.55 · UI text 1.4 · headings 1.2–1.35 · badges a fixed 16px so they stay crisp at 24px tall.</p>
    </>
  );
}
const P1: PathNode[] = [
  { icon: Key, title: "CI/CD", name: "Leaked CI token" },
  { icon: Settings, title: "Build runner", name: "ci-runner-prod", mono: true, zone: { name: "build", env: "Build" }, branches: 2 },
  { icon: ShieldCheck, title: "IAM role", name: "build-deploy-role", mono: true, zone: { name: "prod-core", env: "Production" } },
  { icon: Lock, title: "Secrets manager", name: "production-credentials", mono: true, jewel: true, zone: { name: "prod-core", env: "Production" } },
  { icon: Database, title: "Postgres", name: "customer-db", mono: true, jewel: true, zone: { name: "prod-data", env: "Production" } },
];
const L1: PathLink[] = [
  { title: "Runs a job on the runner", remediations: 1 },
  { title: "Assumes the role" },
  { title: "Reads every secret", remediations: 2 },
  { title: "Logs in with the stolen password" },
];
const P2: PathNode[] = [
  { icon: Globe, title: "Internet", name: "Internet, no auth" },
  { icon: Network, title: "API gateway", name: "api.acme.com", mono: true, zone: { name: "prod-core", env: "Production" } },
  { icon: Container, title: "Kubernetes", name: "prod-cluster", mono: true, zone: { name: "prod-core", env: "Production" } },
  { icon: KeyRound, title: "Secrets manager", name: "payments/prod-secrets", mono: true, jewel: true, zone: { name: "prod-core", env: "Production" } },
];
const L2: PathLink[] = [{ title: "Calls an unauthenticated route" }, { title: "Execs into a pod", state: "conditional" }, { title: "Reads the secret", state: "blocked", remediations: 1 }];
function PathDemo({ nodes, links }: { nodes: PathNode[]; links: PathLink[] }) {
  const [step, setStep] = useState(1);
  const [node, setNode] = useState<number | undefined>(undefined);
  return <AttackPath nodes={nodes} links={links} step={step} node={node} onSelectStep={(s) => { setStep(s); setNode(undefined); }} onSelectNode={(i) => { setNode(i); setStep(Math.max(1, i)); }} />;
}
interface PathRow { id: string; verdict: VerdictState; title: string; trail: string[]; target: string; pri: "Critical" | "High" | "Medium" | "Low"; chg?: "up" | "down"; isNew?: boolean; f: number; r: number; res: number; det: string; changed?: string }
const PATH_ROWS: PathRow[] = [
  { id: "AP-2397", verdict: "Confirmed", title: "A leaked CI token can query orders-db", trail: ["Leaked CI token", "ci-release", "prod-cluster", "svc-loyalty-role", "orders-db"], target: "orders-db", pri: "Critical", chg: "up", f: 7, r: 6, res: 5, det: "2mo ago", changed: "Changed 2d ago" },
  { id: "AP-2463", verdict: "Conditional", title: "Anyone on the internet can query orders-db", trail: ["Internet", "support.acme.com", "svc-mobile-role", "orders-db"], target: "orders-db", pri: "Critical", f: 4, r: 2, res: 4, det: "2mo ago" },
  { id: "AP-2688", verdict: "Confirmed", title: "Any logged-in customer can query orders-db", trail: ["Logged-in customer", "partners.acme.com", "svc-media-role", "orders-db"], target: "orders-db", pri: "High", isNew: true, f: 3, r: 3, res: 4, det: "1mo ago" },
  { id: "AP-2115", verdict: "Inconclusive", title: "A phished employee laptop can read production-credentials", trail: ["Employee laptop", "vpn-gateway", "admin-sso-group", "production-credentials"], target: "production-credentials", pri: "High", chg: "down", f: 2, r: 0, res: 4, det: "3mo ago" },
  { id: "AP-2130", verdict: "Refuted", title: "Anyone on the internet can read production-credentials", trail: ["Internet", "app.acme.com", "web-app-role", "production-credentials"], target: "production-credentials", pri: "Medium", f: 1, r: 1, res: 4, det: "3mo ago" },
];
const PATH_COLS: Column<PathRow>[] = [
  { id: "title", label: "Attack path", width: "minmax(0,1fr)", valign: "top", render: (p) => <TitleCell id={p.id} icon={<VerdictIcon verdict={p.verdict} />} title={p.title} sub={<Trail items={p.trail} jewelLast />} /> },
  { id: "pri", label: "Priority", width: "240px", render: (p) => (
    <BadgeGroup>
      <Badge tone={p.pri.toLowerCase() as BadgeTone}>{p.pri}</Badge>
      {p.chg && <Badge tone={p.chg === "up" ? "new" : "neutral"} tooltip={`${p.chg === "up" ? "Escalated" : "Downgraded"} from High`}>{p.chg === "up" ? "Escalated" : "Downgraded"}</Badge>}
      {p.isNew && <Badge tone="new">New</Badge>}
    </BadgeGroup>) },
  { id: "related", label: "Related", width: "max-content", padRight: 30, render: (p) => (
    <CountGroup>
      <CountChip count={p.f} icon={Flag} label="finding" />
      <CountChip count={p.r} icon={Wrench} label="remediation" />
      <CountChip count={p.res} icon={Layers} label="resource" />
    </CountGroup>) },
  { id: "det", label: "Detected", width: "120px", render: (p) => <DateCell main={p.det} sub={p.changed} /> },
];
function TableDemo() {
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [sel, setSel] = useState<string | undefined>("AP-2463");
  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex flex-wrap gap-1">
        {PATH_COLS.map((c) => <ToggleBadge key={c.id} pressed={!hidden.has(c.id)} onPressedChange={(on) => { const n = new Set(hidden); on ? n.delete(c.id) : n.add(c.id); setHidden(n); }}>{c.label}</ToggleBadge>)}
      </div>
      <DataTable label="Attack paths" columns={PATH_COLS} rows={PATH_ROWS} getRowId={(p) => p.id} hidden={hidden}
        groupBy={(p) => ({ key: p.target, label: <><Star className="size-3.5 fill-[var(--warning-emphasis)] text-[var(--warning-emphasis)]" /><span className="font-mono font-medium">{p.target}</span></> })}
        selectedId={sel} onRowClick={(p) => setSel(p.id)} limit={2} />
    </div>
  );
}
const QTABS = [{ value: "all", label: "All", count: 1532 }, { value: "new", label: "New & escalated", count: 131 }, { value: "input", label: "Needs input", count: 391 }, { value: "jewels", label: "Crown jewels", count: 119 }];
const FCATS = [
  { id: "pri", label: "Priority", options: ["Critical", "High", "Medium", "Low"].map((v, i) => ({ value: v, label: v, count: [129, 232, 511, 660][i] })) },
  { id: "verdict", label: "Verdict", options: ["Confirmed", "Conditional", "Inconclusive", "Refuted"].map((v) => ({ value: v, label: v })) },
  { id: "acct", label: "Account", options: ["prod-core", "prod-data", "build", "staging"].map((v) => ({ value: v, label: <span className="font-mono">{v}</span> })) },
];
const PROPS = [{ id: "id", label: "ID" }, { id: "verdict", label: "Verdict" }, { id: "title", label: "Title" }, { id: "trail", label: "Trail" }, { id: "pri", label: "Priority" }, { id: "findings", label: "Findings" }, { id: "rems", label: "Remediations" }, { id: "res", label: "Resources" }, { id: "det", label: "Detected" }];
const HDEF = ["findings", "res"];
function ToolbarDemo() {
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");
  const [f, setF] = useState<Record<string, string[]>>({ pri: ["Critical"] });
  const [group, setGroup] = useState("target");
  const [order, setOrder] = useState("priority");
  const [dir, setDir] = useState<"asc" | "desc">("desc");
  const [hidden, setHidden] = useState<Set<string>>(new Set(HDEF));
  const nonDefault = group !== "target" || order !== "priority" || dir !== "desc" || hidden.size !== HDEF.length || HDEF.some((h) => !hidden.has(h));
  const tokens = Object.entries(f).flatMap(([c, vs]) => { const cat = FCATS.find((x) => x.id === c)!; return [<FilterBadge key={c} label={cat.label} value={vs.join(", ")} onRemove={() => { const n = { ...f }; delete n[c]; setF(n); }} />]; });
  return (
    <div className="w-full">
      <Toolbar
        start={<Tabs label="Quick views" items={QTABS} value={tab} onValueChange={setTab} />}
        end={<>
          <SearchField value={q} onChange={(e) => setQ(e.target.value)} />
          <FilterMenu trigger={<Button><Filter />Filter</Button>} categories={FCATS} value={f} onChange={setF} />
          <DisplayMenu trigger={<Button><SlidersHorizontal />Display</Button>}
            grouping={{ options: [{ value: "none", label: "None" }, { value: "target", label: "Target" }, { value: "start", label: "Entry point" }], value: group, onChange: setGroup }}
            ordering={{ options: [{ value: "priority", label: "Priority" }, { value: "detected", label: "Detected" }, { value: "findings", label: "Findings" }], value: order, onChange: setOrder, direction: dir, onDirectionChange: setDir }}
            properties={PROPS} hidden={hidden} onToggleProperty={(id, v) => { const n = new Set(hidden); v ? n.delete(id) : n.add(id); setHidden(n); }}
            onReset={nonDefault ? () => { setGroup("target"); setOrder("priority"); setDir("desc"); setHidden(new Set(HDEF)); } : undefined} />
        </>}
        filters={tokens}
        onClearFilters={() => setF({})}
      />
    </div>
  );
}
function MenuDemo() {
  const [cols, setCols] = useState({ a: true, b: false });
  return (
    <Menu>
      <MenuTrigger asChild><Button>Actions<ChevronDown /></Button></MenuTrigger>
      <MenuContent>
        <MenuLabel>Attack path</MenuLabel>
        <MenuItem onSelect={() => {}} shortcut="⌘C">Copy link</MenuItem>
        <MenuItem onSelect={() => {}}>Open in graph</MenuItem>
        <MenuSub label="Assign to">
          <MenuItem>Platform</MenuItem><MenuItem>Data</MenuItem><MenuItem>Security</MenuItem>
        </MenuSub>
        <MenuSeparator />
        <MenuCheckboxItem checked={cols.a} onCheckedChange={(v) => setCols({ ...cols, a: v })}>Watch for changes</MenuCheckboxItem>
        <MenuCheckboxItem checked={cols.b} onCheckedChange={(v) => setCols({ ...cols, b: v })}>Mute notifications</MenuCheckboxItem>
        <MenuSeparator />
        <MenuItem disabled>Export (soon)</MenuItem>
      </MenuContent>
    </Menu>
  );
}
function FormDemo() {
  const [a, setA] = useState(true), [b, setB] = useState(false), [sw, setSw] = useState(true), [r, setR] = useState("team");
  const [sel, setSel] = useState<string | undefined>(undefined);
  return (
    <div className="grid w-full max-w-[420px] gap-5">
      <Field label="Owner" hint="Who gets the ticket when this path is confirmed.">{(id) => <Select id={id} options={["Platform", "Data", "Security", "Web"].map((v) => ({ value: v, label: v }))} value={sel} onValueChange={setSel} placeholder="Pick a team" />}</Field>
      <Field label="Note" error={undefined}>{(id) => <Textarea id={id} placeholder="Why are you dismissing this remediation?" />}</Field>
      <div className="flex flex-col gap-2"><Checkbox checked={a} onCheckedChange={setA} label="Notify the owner" /><Checkbox checked={b} onCheckedChange={setB} label="Create a ticket" /><Checkbox checked={false} onCheckedChange={() => {}} label="Disabled option" disabled /></div>
      <Switch checked={sw} onCheckedChange={setSw} label="Re-run the assessment when it ships" />
      <RadioGroup label="Scope" value={r} onValueChange={setR} options={[{ value: "team", label: "My team", hint: "Paths owned by Platform" }, { value: "all", label: "Everything" }]} />
    </div>
  );
}
function DialogDemo() {
  const [open, setOpen] = useState(false);
  const toast = useToast();
  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}><Sparkles />Generate plan</Button>
      <Button onClick={() => toast("Status set to Resolved", { tone: "success", action: { label: "Undo", onClick: () => toast("Status restored") } })}>Show toast</Button>
      <Button onClick={() => toast("Couldn't reach the GitHub API", { tone: "danger" })}>Error toast</Button>
      <Dialog open={open} onOpenChange={setOpen} title="Generate a plan for R-010?" description="Latent drafts the steps and the infrastructure-as-code change for Platform to review."
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button variant="primary" onClick={() => { setOpen(false); toast("Generating a plan…"); }}>Generate</Button></>}>
        <p className="m-0">Nothing changes in your infrastructure until someone on Platform merges the pull request.</p>
      </Dialog>
    </>
  );
}
function ChipsDemo() {
  const [on, setOn] = useState<Record<string, boolean>>({ ID: true, Verdict: true, Title: true, Findings: false, Remediations: true });
  const [f, setF] = useState(["Critical", "Confirmed"]);
  return (
    <>
      <Preview label="Display-property toggles (click)">{Object.keys(on).map((k) => <ToggleBadge key={k} pressed={on[k]} onPressedChange={(v) => setOn({ ...on, [k]: v })}>{k}</ToggleBadge>)}</Preview>
      <Preview label="Filter tokens">
        {f.map((v) => <FilterBadge key={v} label={v === "Critical" ? "Priority" : "Verdict"} value={v} onRemove={() => setF(f.filter((x) => x !== v))} />)}
        {!f.length && <button className="cursor-pointer border-0 bg-transparent text-xs text-link" onClick={() => setF(["Critical", "Confirmed"])}>Reset filters</button>}
      </Preview>
    </>
  );
}
function StatusSelectDemo() {
  const [v, setV] = useState<RemStatus>("In progress");
  return <StatusSelect value={v} onChange={setV} />;
}
function SidebarDemo() {
  const [nav, setNav] = useState("Attack paths");
  const [org, setOrg] = useState("acme");
  const [br, setBr] = useState("main");
  const I = (p: { icon: typeof Flag; label: string; count?: number }) => <SidebarItem {...p} active={nav === p.label} onClick={() => setNav(p.label)} />;
  return (
    <div className="h-[840px] overflow-hidden rounded-lg border border-border">
      <Sidebar footer={<LatentLogo />}>
        <SidebarOrgSwitcher orgs={[{ id: "acme", name: "Acme Corp" }, { id: "globex", name: "Globex Industries" }]} value={org} onChange={setOrg} />
        <SidebarBranchSwitcher branches={[{ id: "main", meta: "Analyzed 2h ago" }, { id: "staging", meta: "Analyzed 6h ago" }, { id: "develop", meta: "Analyzed 2d ago" }]} value={br} onChange={setBr} />
        <I icon={LayoutGrid} label="Dashboard" />
        <SidebarSection label="Triage">
          <I icon={Route} label="Attack paths" count={552} />
          <I icon={Wrench} label="Remediations" count={67} />
          <I icon={Flag} label="Findings" count={202} />
          <I icon={Layers} label="Resources" count={179} />
        </SidebarSection>
        <SidebarSection label="Resources">
          <I icon={List} label="Inventory" />
          <I icon={Star} label="Crown jewels" />
          <I icon={Users} label="Owners" />
        </SidebarSection>
        <SidebarSection label="Settings">
          <I icon={Cloud} label="Scopes & sources" />
          <I icon={Plug} label="Integrations" />
          <I icon={Ticket} label="Ticketing" />
          <I icon={Scale} label="Rubric" />
          <I icon={Code} label="MCP / API" />
          <I icon={UserCircle} label="Team" />
        </SidebarSection>
      </Sidebar>
    </div>
  );
}

/* ---------- pages ---------- */
const PAGES: Page[] = [
  {
    id: "setup", name: "Installation", group: "Getting started",
    desc: "Add the Latent theme once, then pull components in as you need them. Works with any shadcn + Tailwind v4 project.",
    body: () => (
      <>
        <H2>1. Add the theme</H2>
        <Pre>{`npx shadcn@latest add ${URL_BASE}/theme.json`}</Pre>
        <p className="text-muted-foreground">Copies the tokens (palette, light and dark semantic colours, priority/verdict/status colours) to <code className="font-mono">src/styles/latent.css</code>.</p>
        <H2>2. Import it after Tailwind</H2>
        <Pre>{`/* src/index.css */\n@import "tailwindcss";\n@import "./styles/latent.css";`}</Pre>
        <H2>3. Add components</H2>
        <Pre>{`npx shadcn@latest add ${URL_BASE}/badge.json\nnpx shadcn@latest add ${URL_BASE}/sidebar.json`}</Pre>
        <p className="text-muted-foreground">Dependencies (utils, icons, tooltip) install automatically. Wrap the app once in <code className="font-mono">{"<TooltipProvider>"}</code>.</p>
        <H2>Dark mode</H2>
        <p className="text-muted-foreground">Toggle the <code className="font-mono">dark</code> class on <code className="font-mono">{"<html>"}</code>. Every token has a dark value.</p>
      </>
    ),
  },
  {
    id: "type", name: "Type", group: "Foundations", item: "theme",
    desc: "Eight fluid sizes. Each grows smoothly between a 1280px and a 1920px wide screen, then stops. Small sizes barely move so dense tables stay dense; paragraphs and headings carry most of the growth.",
    body: () => <TypeScale />,
    usage: `<p className="text-base">Paragraph</p>      /* 14 → 15px, 1.55 line height */
<span className="text-xs">Trail</span>          /* 12 → 12.5px */
<h2 className="text-2xl font-semibold">Title</h2>

/* or in CSS */
font-size: var(--fs-sm);`,
  },
  {
    id: "icons-lucide", name: "Icons", group: "Foundations", item: "object-icons",
    desc: "UI icons come from Lucide (lucide-react, pinned to 0.469.0). Each triage object has one fixed icon; import it from OBJECT_ICONS instead of picking your own.",
    body: () => (
      <>
        <Preview label="Object icons">
          {(Object.entries(OBJECT_ICONS) as [string, typeof Flag][]).map(([k, I]) => (
            <span key={k} className="flex w-[120px] flex-col items-center gap-2 rounded-lg border border-border p-3 text-xs text-muted-foreground">
              <I className="size-5 text-foreground" strokeWidth={1.75} />
              <span className="font-mono">{k}</span>
            </span>
          ))}
        </Preview>
        <H2>Conventions</H2>
        <ul className="m-0 list-disc pl-5 text-muted-foreground">
          <li>16px in nav and lists, 14px inside count chips, 1.75 stroke.</li>
          <li>Icons inherit text colour; use muted-foreground when the label carries the meaning.</li>
          <li>Verdict and status glyphs are custom (see Verdict &amp; status icons), not Lucide.</li>
          <li>Any other icon: browse lucide.dev and import from lucide-react. Keep to version 0.469.0 so names match.</li>
        </ul>
      </>
    ),
    usage: `import { OBJECT_ICONS } from "@/lib/object-icons";\n\nconst I = OBJECT_ICONS.remediation;\n<I className="size-4" strokeWidth={1.75} />`,
  },
  {
    id: "button", name: "Button", group: "Components", item: "button",
    desc: "One button with five variants and two heights. 32px for toolbars and main actions; 24px (sm) to sit next to badges. Icon-only buttons get a tooltip from their label.",
    body: () => (
      <>
        <Preview label="Variants (32px)">
          <Button variant="primary"><Sparkles />Generate plan</Button>
          <Button><Filter />Filter</Button>
          <Button><SlidersHorizontal />Display</Button>
          <Button variant="ghost">Cancel</Button>
          <Button variant="destructive"><Trash2 />Dismiss</Button>
          <Button variant="link">See all 61 in list →</Button>
        </Preview>
        <Preview label="Small (24px), next to badges">
          <Badge tone="critical">Critical</Badge>
          <Button size="sm" variant="primary">Assign</Button>
          <Button size="sm">Export<ChevronDown /></Button>
          <Button size="sm" variant="ghost">Snooze</Button>
        </Preview>
        <Preview label="Icon only (hover for label)">
          <Button size="icon" label="Zoom in"><Plus /></Button>
          <Button size="icon" label="Zoom out"><Minus /></Button>
          <Button size="icon" label="Fit to screen"><Maximize /></Button>
          <Button size="icon-sm" variant="ghost" label="Close"><X /></Button>
        </Preview>
        <Preview label="Disabled"><Button variant="primary" disabled>Generate plan</Button><Button disabled>Display</Button></Preview>
      </>
    ),
    usage: `<Button variant="primary"><Sparkles />Generate plan</Button>
<Button><SlidersHorizontal />Display</Button>
<Button size="sm">Export</Button>
<Button size="icon" variant="ghost" label="Zoom in"><Plus /></Button>`,
    props: [
      ["variant", "primary | outline | ghost | destructive | link", "Defaults to outline."],
      ["size", "default | sm | icon | icon-sm", "32px, 24px, 32px square, 24px square."],
      ["label", "ReactNode", "Icon-only sizes: tooltip and aria-label."],
    ],
  },
  {
    id: "badge", name: "Badge", group: "Components", item: "badge",
    desc: "One component for every chip: priority, priority change, New, verdict, status, effort and owner. Pick a tone, add an optional icon and tooltip.",
    body: () => (
      <>
        <Preview label="Priority">{PRI.map((p) => <Badge key={p} tone={p.toLowerCase() as BadgeTone}>{p}</Badge>)}</Preview>
        <Preview label="Priority change and New (hover for tooltip)">
          <Badge tone="new" tooltip="Escalated from High">Escalated</Badge><Badge tooltip="Downgraded from Critical">Downgraded</Badge><Badge tone="new">New</Badge>
        </Preview>
        <Preview label="Verdict">{VER.map((v) => <Badge key={v} tone={v.toLowerCase() as BadgeTone} icon={<VerdictIcon verdict={v} />}>{v === "Failed" ? "Assessment failed" : v}</Badge>)}</Preview>
        <Preview label="Status">{ST.map((s) => <Badge key={s} tone="plain" icon={<StatusIcon status={s} />}>{s}</Badge>)}</Preview>
        <Preview label="Effort and owner"><Badge>Low effort</Badge><Badge>Medium effort</Badge><Badge>High effort</Badge><Badge>Platform</Badge></Preview>
        <Preview label="Selected and outline"><Badge tone="outline">Findings</Badge><Badge tone="selected">Remediations</Badge></Preview>
        <ChipsDemo />
      </>
    ),
    usage: `<Badge tone="critical">Critical</Badge>
<Badge tone="new" tooltip="Escalated from High">Escalated</Badge>
<Badge tone="confirmed" icon={<VerdictIcon verdict="Confirmed" />}>Confirmed</Badge>
<Badge tone="plain" icon={<StatusIcon status="Open" />}>Open</Badge>
<Badge>Medium effort</Badge>

<ToggleBadge pressed={on} onPressedChange={setOn}>Findings</ToggleBadge>
<FilterBadge label="Priority" value="Critical" onRemove={clear} />`,
    props: [
      ["tone", "neutral | new | critical | high | medium | low | assessing | failed | confirmed | conditional | inconclusive | refuted | plain | selected | outline", "Colour. Defaults to neutral (gray)."],
      ["icon", "ReactNode", "Leading icon. Verdict tones size it to 12px; plain keeps 16px."],
      ["iconRight", "ReactNode", "Trailing icon or control, e.g. a remove button."],
      ["tooltip", "ReactNode", "Shows on hover."],
    ],
  },
  {
    id: "icons", name: "Verdict & status icons", group: "Components", item: "icons",
    desc: "16px glyphs for dense lists, all drawn on one 24px grid so verdict and status icons match in optical size.",
    body: () => (
      <>
        <Preview label="Verdict">{VER.map((v) => <VerdictIcon key={v} verdict={v} />)}</Preview>
        <Preview label="Status">{ST.map((s) => <StatusIcon key={s} status={s} />)}</Preview>
      </>
    ),
    usage: `<VerdictIcon verdict="Confirmed" />\n<StatusIcon status="In progress" />`,
    props: [["verdict", "Assessing | Failed | Confirmed | Conditional | Inconclusive | Refuted", "Assessing spins."], ["status", "Open | In progress | Resolved | Dismissed", ""], ["className", "string", "Override size or colour."]],
  },
  {
    id: "count-chip", name: "Count chip", group: "Components", item: "count-chip",
    desc: "Related-object count: number and icon in a fixed, right-aligned slot so columns line up. Zero renders an empty slot.",
    body: () => (
      <Preview>
        <CountGroup>
          <CountChip count={7} icon={Flag} label="finding" />
          <CountChip count={0} icon={Wrench} label="remediation" />
          <CountChip count={223} icon={Route} label="attack path" wide />
          <CountChip count={5} icon={Layers} label="resource" />
        </CountGroup>
      </Preview>
    ),
    usage: `<CountGroup>\n  <CountChip count={7} icon={Flag} label="finding" />\n  <CountChip count={223} icon={Route} label="attack path" wide />\n</CountGroup>`,
    props: [["count", "number", "0 renders an empty slot."], ["icon", "LucideIcon", ""], ["label", "string", "Singular; tooltip pluralises."], ["wide", "boolean", "46px slot for 3-digit counts (default 34px)."], ["onClick", "() => void", "Usually opens the related list filtered."]],
  },
  {
    id: "input", name: "Input", group: "Components", item: "input",
    desc: "Borderless filled field. A 1px ring-coloured border appears on focus.",
    body: () => <Preview><Input placeholder="Search attack paths" /></Preview>,
    usage: `<Input placeholder="Search attack paths" />`,
  },
  {
    id: "status-select", name: "Status select", group: "Components", item: "status-select",
    desc: "Remediation status as a button with chevrons; opens a menu to set the status.",
    body: () => <Preview><StatusSelectDemo /></Preview>,
    usage: `const [status, setStatus] = useState<RemStatus>("Open");\n<StatusSelect value={status} onChange={setStatus} />`,
    props: [["value", "RemStatus", ""], ["onChange", "(s: RemStatus) => void", ""]],
  },
  {
    id: "sidebar", name: "Sidebar", group: "Components", item: "sidebar",
    desc: "App navigation: org switcher, branch switcher with analysis time, section labels and nav items with counts.",
    body: () => <Preview><SidebarDemo /></Preview>,
    usage: `<Sidebar footer={<LatentLogo />}>
  <SidebarOrgSwitcher orgs={orgs} value={org} onChange={setOrg} />
  <SidebarBranchSwitcher branches={branches} value={branch} onChange={setBranch} />
  <SidebarItem icon={LayoutGrid} label="Dashboard" />
  <SidebarSection label="Triage">
    <SidebarItem icon={Route} label="Attack paths" count={552} active />
  </SidebarSection>
</Sidebar>`,
    props: [["SidebarItem.active", "boolean", "Accent fill; inactive items are muted."], ["SidebarItem.count", "number", "Right-aligned, muted."], ["SidebarOrgSwitcher.extra", "ReactNode", "Extra menu items, e.g. theme."], ["SidebarBranchSwitcher.branches", "{ id, meta? }[]", "meta shows under the branch."]],
  },
  {
    id: "sidebar-item", name: "Sidebar item", group: "Components", item: "sidebar",
    desc: "A single nav link in the sidebar. Ships in the sidebar package alongside the section label and switchers.",
    body: () => (
      <>
        <Preview label="Inactive (muted, brightens on hover)" col>
          <div className="w-[216px] rounded-lg bg-sidebar p-2.5"><SidebarItem icon={Wrench} label="Remediations" count={67} /></div>
        </Preview>
        <Preview label="Active" col>
          <div className="w-[216px] rounded-lg bg-sidebar p-2.5"><SidebarItem icon={Route} label="Attack paths" count={552} active /></div>
        </Preview>
        <Preview label="Without count" col>
          <div className="w-[216px] rounded-lg bg-sidebar p-2.5"><SidebarItem icon={LayoutGrid} label="Dashboard" /></div>
        </Preview>
        <Preview label="Section label with items" col>
          <div className="w-[216px] rounded-lg bg-sidebar p-2.5">
            <SidebarSection label="Triage">
              <SidebarItem icon={Route} label="Attack paths" count={552} active />
              <SidebarItem icon={Flag} label="Findings" count={202} />
            </SidebarSection>
          </div>
        </Preview>
      </>
    ),
    usage: `<SidebarItem icon={Route} label="Attack paths" count={552} active />\n<SidebarItem icon={Wrench} label="Remediations" href="/remediations" />`,
    props: [["icon", "LucideIcon", "16px, 1.75 stroke."], ["label", "string", ""], ["count", "number", "Optional, right-aligned, muted."], ["active", "boolean", "Accent fill and full-brightness text."], ["href / onClick", "string / () => void", "Renders an <a> when href is set, otherwise a <button>."]],
  },
  {
    id: "attack-path", name: "Attack path", group: "Components", item: "attack-path",
    desc: "The vertical path drawing from the attack path page: resource tiles, numbered steps, remediation and branch pills, and a box per cloud account. Everything sits on one rail, so the step line stays straight when it crosses a box edge.",
    body: () => (
      <>
        <Preview label="Crosses three accounts (click steps and tiles)" col><PathDemo nodes={P1} links={L1} /></Preview>
        <Preview label="Conditional and blocked steps" col><PathDemo nodes={P2} links={L2} /></Preview>
        <Preview label="Tile states"><Tile icon={Database} /><Tile icon={Database} on={false} /><Tile icon={Database} selected /><Tile icon={Database} dead /></Preview>
      </>
    ),
    usage: `<AttackPath
  nodes={[
    { icon: Key, title: "CI/CD", name: "Leaked CI token" },
    { icon: Settings, title: "Build runner", name: "ci-runner-prod", mono: true,
      zone: { name: "build", env: "Build" }, branches: 2 },
    …
  ]}
  links={[{ title: "Runs a job on the runner", remediations: 1 }, …]}
  step={step}
  onSelectStep={setStep}
/>`,
    props: [
      ["nodes", "PathNode[]", "icon, title, name, mono, jewel, zone { name, env }, branches. Consecutive nodes with the same zone share a box."],
      ["links", "PathLink[]", "links[i] joins nodes[i] → nodes[i+1] and is step i+1. title (tooltip), state ok | conditional | blocked, remediations."],
      ["step", "number", "Selected step (1-based). Tiles and lines up to it render on."],
      ["node", "number", "Selected node index; outlines its tile."],
      ["onSelectStep / onSelectNode", "(n) => void", ""],
    ],
  },
  {
    id: "toolbar", name: "Toolbar", group: "Components", item: "toolbar",
    desc: "The bar above every list: quick-view tabs on the left; search, Filter and Display on the right; active filters underneath with Clear all. Everything in the top row is 32px.",
    body: () => <Preview label="Attack paths toolbar (all controls work)" col><ToolbarDemo /></Preview>,
    usage: `<Toolbar
  start={<Tabs label="Quick views" items={views} value={view} onValueChange={setView} />}
  end={<>
    <SearchField value={q} onChange={(e) => setQ(e.target.value)} />
    <FilterMenu trigger={<Button><Filter />Filter</Button>} categories={cats} value={filters} onChange={setFilters} />
    <DisplayMenu trigger={<Button><SlidersHorizontal />Display</Button>} … />
  </>}
  filters={tokens}
  onClearFilters={() => setFilters({})}
/>`,
    props: [["start / end", "ReactNode", "Left and right of the top row."], ["filters", "ReactNode", "Active FilterBadges; the row hides when empty."], ["onClearFilters", "() => void", "Adds Clear all."]],
  },
  {
    id: "tabs", name: "Tabs", group: "Components", item: "tabs",
    desc: "Segmented quick views with counts. Single select, 32px, arrow keys move between tabs.",
    body: () => { const D = () => { const [v, setV] = useState("all"); return <Tabs label="Quick views" items={QTABS} value={v} onValueChange={setV} />; }; return <Preview><D /></Preview>; },
    usage: `<Tabs label="Quick views" items={[{ value: "all", label: "All", count: 1532 }, …]} value={view} onValueChange={setView} />`,
    props: [["items", "{ value, label, count? }[]", ""], ["value / onValueChange", "string", ""], ["label", "string", "Accessible name"]],
  },
  {
    id: "menu", name: "Menu", group: "Components", item: "menu",
    desc: "One surface for every dropdown: items, checkbox items that stay open, submenus, labels and separators. Also MenuSelect (the small 28px select), DisplayMenu and FilterMenu.",
    body: () => (
      <>
        <Preview label="Menu parts"><MenuDemo /></Preview>
        <Preview label="Filter and Display menus" col><ToolbarDemo /></Preview>
      </>
    ),
    usage: `<Menu>
  <MenuTrigger asChild><Button>Actions</Button></MenuTrigger>
  <MenuContent>
    <MenuLabel>Attack path</MenuLabel>
    <MenuItem onSelect={copy} shortcut="⌘C">Copy link</MenuItem>
    <MenuSub label="Assign to"><MenuItem>Platform</MenuItem></MenuSub>
    <MenuSeparator />
    <MenuCheckboxItem checked={watch} onCheckedChange={setWatch}>Watch for changes</MenuCheckboxItem>
  </MenuContent>
</Menu>`,
    props: [["MenuItem", "onSelect, shortcut, disabled", ""], ["MenuCheckboxItem", "checked, onCheckedChange, count", "Stays open on click."], ["MenuSub", "label, icon, badge", "Opens on hover or →."], ["MenuSelect", "options, value, onValueChange", "28px bordered trigger."], ["DisplayMenu", "grouping, ordering, properties, hidden, onToggleProperty, onReset", ""], ["FilterMenu", "categories, value, onChange", "Record<category, values[]>"]],
  },
  {
    id: "content", name: "Content blocks", group: "Components", item: "content",
    desc: "The building blocks of detail pages: Section headings with a count and action, Callout, CodeBlock for evidence, and KeyValue rows.",
    body: () => (
      <>
        <Preview label="Section" col>
          <Section title="Findings it resolves" count={61} action={<Button variant="link">See all →</Button>}><p className="m-0 text-muted-foreground">Section content…</p></Section>
        </Preview>
        <Preview label="Callout: neutral, with footer" col>
          <Callout footer={<><span className="flex-1">Latent drafts the steps and the IaC change for Platform to review.</span><Button variant="primary" size="sm"><Sparkles />Generate plan</Button></>}>
            <p><b>What to change.</b> Turn on S3 Block Public Access at the account level for prod-core.</p>
            <p><b>Risk removed.</b> Blocks 12 attack paths to customer-records.</p>
            <p><b>What could break.</b> Nothing reads these buckets anonymously today.</p>
          </Callout>
        </Preview>
        <Preview label="Callout tones" col>
          <Callout tone="info" title="Re-assessing">Latent re-runs the assessment on these paths after the change ships.</Callout>
          <Callout tone="success">All 12 paths were refuted at the changed resources.</Callout>
          <Callout tone="warning" title="Needs input">Grant read-only access to confirm this step.</Callout>
          <Callout tone="danger">The assessment failed: the sandbox couldn't reach api.acme.com.</Callout>
        </Preview>
        <Preview label="CodeBlock" col>
          <CodeBlock icon={<CodeIcon />} kind="Code" source="GitHub · acme/web-app" badge={<Badge tone="confirmed">Supports</Badge>}>{`// src/render.ts  (commit 4be91c0, 12 days ago)
export function render(req) {
  const tpl = req.query.tpl;          // user-controlled
  return nunjucks.renderString(tpl, ctx); // SSTI
}`}</CodeBlock>
          <CodeBlock icon={<FlaskConical />} kind="Executed test" source="Latent · sandboxed probe" badge={<Badge tone="confirmed">Proves it</Badge>}>{`GET https://app.acme.com/render?tpl={{7*7}}
HTTP/1.1 200 OK

49`}</CodeBlock>
        </Preview>
        <Preview label="KeyValue" col>
          <KeyValue items={[["Mechanism", "T1190 Exploit Public-Facing Application"], ["Required access", <>Internet, no auth <span className="text-muted-foreground">from starting access</span></>], ["Attacker gain", "Cluster workload"], ["Blocking control", "None observed"]]} />
        </Preview>
      </>
    ),
    usage: `<Section title="Findings it resolves" count={61} action={<Button variant="link">See all →</Button>}>…</Section>
<Callout footer={<Button variant="primary" size="sm">Generate plan</Button>}><p><b>What to change.</b> …</p></Callout>
<Callout tone="warning" title="Needs input">…</Callout>
<CodeBlock icon={<Code />} kind="Code" source="GitHub · acme/web-app" badge={<Badge tone="confirmed">Supports</Badge>}>{code}</CodeBlock>
<KeyValue items={[["Mechanism", "T1190 …"], ["Attacker gain", "Cluster workload"]]} />`,
    props: [["Section", "title, count, action", "18px semibold heading with a pill count."], ["Callout", "tone neutral | info | success | warning | danger, title, footer", ""], ["CodeBlock", "icon, kind, source, badge, children (string)", "Copy button built in."], ["KeyValue", "items: [label, value][], labelWidth", "Default label column 160px."], ["Count", "children", "The pill on its own."]],
  },
  {
    id: "form", name: "Form controls", group: "Components", item: "form",
    desc: "Checkbox, Switch, RadioGroup, Select and Textarea in the same filled-field style as Input, plus Field for a label and hint.",
    body: () => <Preview col><FormDemo /></Preview>,
    usage: `<Field label="Owner" hint="Who gets the ticket.">{(id) => <Select id={id} options={teams} value={owner} onValueChange={setOwner} />}</Field>
<Checkbox checked={notify} onCheckedChange={setNotify} label="Notify the owner" />
<Switch checked={rerun} onCheckedChange={setRerun} label="Re-run the assessment" />
<RadioGroup label="Scope" value={scope} onValueChange={setScope} options={[{ value: "team", label: "My team" }, …]} />
<Textarea placeholder="Why?" />`,
    props: [["Field", "label, hint, error, children(id)", "Wires the label to the control."], ["Checkbox / Switch", "checked, onCheckedChange, label, disabled", ""], ["RadioGroup", "options { value, label, hint }, value, onValueChange, label", ""], ["Select", "options, value, onValueChange, placeholder", "32px filled; MenuSelect is the small one."]],
  },
  {
    id: "dialog", name: "Dialog & toast", group: "Components", item: "dialog",
    desc: "A modal Dialog for confirmations, and toasts for quick feedback. Wrap the app once in ToastProvider, then call useToast().",
    body: () => <Preview><DialogDemo /></Preview>,
    usage: `<Dialog open={open} onOpenChange={setOpen} title="Generate a plan?" description="…"
  footer={<><Button variant="ghost">Cancel</Button><Button variant="primary">Generate</Button></>}>…</Dialog>

const toast = useToast();
toast("Status set to Resolved", { tone: "success", action: { label: "Undo", onClick: undo } });`,
    props: [["Dialog", "open, onOpenChange, title, description, footer, width", "Default width 480px."], ["toast(message, opts)", "tone neutral | success | danger, action, duration", "Up to 3 stack bottom-centre; 3s default."]],
  },
  {
    id: "data-table", name: "Data table", group: "Components", item: "data-table",
    desc: "The list table, built on CSS grid instead of <table>. One column template on the table, every row a subgrid of it, so each column keeps its own sizing rule: the title fills, priority is fixed at 240px, related counts fit their content. No header row; column names live in the Display menu.",
    body: () => <Preview label="Attack paths, grouped by crown jewel, limit 2 per group (toggle columns, click rows, collapse groups, Show all / less)" col><TableDemo /></Preview>,
    usage: `const columns: Column<Path>[] = [
  { id: "title", label: "Attack path", width: "minmax(0,1fr)", valign: "top",
    render: (p) => <TitleCell id={p.id} icon={<VerdictIcon verdict={p.verdict} />} title={p.title} sub={<Trail items={p.trail} jewelLast />} /> },
  { id: "pri", label: "Priority", width: "240px", render: (p) => <BadgeGroup>…</BadgeGroup> },
  { id: "related", label: "Related", width: "max-content", padRight: 30, render: (p) => <CountGroup>…</CountGroup> },
  { id: "det", label: "Detected", width: "120px", render: (p) => <DateCell main={p.det} /> },
];

<DataTable label="Attack paths" columns={columns} rows={paths} getRowId={(p) => p.id}
  hidden={hiddenColumns} groupBy={(p) => ({ key: p.target, label: p.target })}
  onRowClick={open} selectedId={openId} />`,
    props: [
      ["columns", "Column<T>[]", "id, label (Display menu), width (grid track), render, align, valign, padRight."],
      ["rows / getRowId", "T[] / (row) => string", ""],
      ["hidden", "Set<string>", "Column ids to hide; drop them from the grid template."],
      ["groupBy", "(row) => { key, label, meta? }", "Collapsible group headers in first-seen order. meta defaults to the row count."],
      ["onRowClick / selectedId", "(row) => void / string", "Rows become focusable; Enter or Space opens."],
      ["limit", "number", "Rows per group before a full-width Show all N row, which stays in place and toggles to Show less."],
      ["label", "string", "Accessible name for the table."],
    ],
  },
  {
    id: "logo", name: "Logo", group: "Components", item: "logo",
    desc: "Latent Defense wordmark.",
    body: () => <Preview><LatentLogo /></Preview>,
    usage: `<LatentLogo className="h-auto w-[138px]" />`,
  },
];

/* ---------- shell ---------- */
const readHash = () => location.hash.replace(/^#\/?/, "") || "setup";
const readTheme = () => { try { return localStorage.getItem("ld-reg-theme") ?? "dark"; } catch { return "dark"; } };

function App() {
  const [cur, setCur] = useState(readHash);
  const [theme, setTheme] = useState(readTheme);
  useEffect(() => { const on = () => setCur(readHash()); addEventListener("hashchange", on); return () => removeEventListener("hashchange", on); }, []);
  useEffect(() => { document.documentElement.classList.toggle("dark", theme === "dark"); try { localStorage.setItem("ld-reg-theme", theme); } catch { /* blocked */ } }, [theme]);
  useEffect(() => { scrollTo(0, 0); }, [cur]);
  const page = PAGES.find((p) => p.id === cur) ?? PAGES[0];
  const groups = ["Getting started", "Foundations", "Components"] as const;

  return (
    <TooltipProvider><ToastProvider>
      <div className="grid min-h-screen grid-cols-[240px_1fr] max-md:grid-cols-1">
        <nav className="sticky top-0 h-screen overflow-auto border-r border-sidebar-border bg-sidebar px-2.5 py-4 max-md:static max-md:h-auto">
          <div className="px-2 pt-1 text-base font-semibold">Latent Defense</div>
          <div className="px-2 pb-2 text-xs text-muted-foreground">UI registry · v0</div>
          <div className="mx-2 mt-3 mb-1 flex gap-0.5 rounded-lg bg-muted p-[3px]">
            {(["light", "dark"] as const).map((t) => (
              <button key={t} onClick={() => setTheme(t)}
                className={cn("flex-1 cursor-pointer rounded-md border-0 p-1 text-xs capitalize", theme === t ? "bg-background text-foreground shadow-[var(--shadow-sm)]" : "bg-transparent text-muted-foreground")}>
                {t}
              </button>
            ))}
          </div>
          {groups.map((g) => (
            <div key={g}>
              <div className="px-2 pt-3.5 pb-1 text-[11px] uppercase tracking-[.06em] text-muted-foreground">{g}</div>
              {PAGES.filter((p) => p.group === g).map((p) => (
                <a key={p.id} href={`#/${p.id}`}
                  className={cn("mt-0.5 block rounded-md px-2 py-1.5 no-underline", p.id === page.id ? "bg-sidebar-accent font-medium text-sidebar-foreground" : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground")}>
                  {p.name}
                </a>
              ))}
            </div>
          ))}
        </nav>
        <main className="max-w-[1080px] min-w-0 px-12 pt-10 pb-20 max-md:px-4">
          <div className="mb-2 text-xs text-muted-foreground">{page.group}</div>
          <h1 className="m-0 mb-1.5 text-2xl font-semibold tracking-[-.01em]">{page.name}</h1>
          <p className="m-0 mb-7 max-w-[720px] text-base text-muted-foreground">{page.desc}</p>
          {page.item && (<><H2>Install</H2><Pre>{`npx shadcn@latest add ${URL_BASE}/${page.item}.json`}</Pre><H2>Preview</H2></>)}
          {page.body()}
          {page.usage && (<><H2>Usage</H2><Pre>{page.usage}</Pre></>)}
          {page.props && (<><H2>Props</H2><Props rows={page.props} /></>)}
        </main>
      </div>
    </ToastProvider></TooltipProvider>
  );
}

createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);
