import * as DM from "@radix-ui/react-dropdown-menu";
import { Check, ChevronsUpDown, GitBranch, History, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/registry/latent/lib/utils";

/**
 * App sidebar, matching the triage prototype.
 *
 *   <Sidebar footer={<Logo />}>
 *     <SidebarOrgSwitcher orgs={[{ id: "acme", name: "Acme Corp" }]} value="acme" onChange={…} />
 *     <SidebarBranchSwitcher branches={[{ id: "main", meta: "Analyzed 2h ago" }]} value="main" onChange={…} />
 *     <SidebarItem icon={LayoutGrid} label="Dashboard" />
 *     <SidebarSection label="Triage">
 *       <SidebarItem icon={Route} label="Attack paths" count={552} active />
 *     </SidebarSection>
 *   </Sidebar>
 */
export function Sidebar({ children, footer, className }: { children: ReactNode; footer?: ReactNode; className?: string }) {
  return (
    <nav className={cn("flex h-full w-[216px] flex-col overflow-auto bg-sidebar px-2.5 pt-2.5 pb-3.5 text-sm", className)}>
      {children}
      {footer && <div className="mt-auto px-2 pt-4 pb-1">{footer}</div>}
    </nav>
  );
}

export function SidebarSection({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col">
      <div className="px-2 pt-3.5 pb-1 text-[10px] font-semibold uppercase tracking-[.05em] text-muted-foreground">{label}</div>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  );
}

/** Nav link. Inactive items are muted and brighten on hover; the active item gets the accent fill. */
export function SidebarItem({
  icon: Icon, label, count, active, href, onClick, className,
}: { icon: LucideIcon; label: string; count?: number; active?: boolean; href?: string; onClick?: () => void; className?: string }) {
  const Tag = href ? "a" : "button";
  return (
    <Tag
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex w-full cursor-pointer items-center gap-2 rounded-md border-0 bg-transparent p-2 text-left text-sm no-underline",
        active
          ? "bg-sidebar-accent font-medium text-foreground"
          : "font-normal text-muted-foreground hover:bg-secondary hover:text-foreground",
        className,
      )}
    >
      <Icon className="size-4 shrink-0" strokeWidth={1.75} />
      <span className="flex-1 truncate">{label}</span>
      {count != null && <span className="text-xs font-normal text-muted-foreground">{count}</span>}
    </Tag>
  );
}

/* ---------- menus ---------- */
const menu = "z-50 min-w-[200px] rounded-[10px] border border-border bg-popover p-1 shadow-[var(--shadow-lg)]";
const menuItem = "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-popover-foreground outline-none data-[highlighted]:bg-accent";
const menuHead = "px-2 pt-1.5 pb-1 text-2xs font-medium text-muted-foreground";

export const OrgLogo = ({ name }: { name: string }) => (
  <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-[5px] bg-foreground text-2xs font-semibold text-background">
    {name.charAt(0)}
  </span>
);

export interface Org { id: string; name: string }

/** Workspace switcher: logo, name, chevrons. `extra` renders below the accounts (e.g. a theme submenu). */
export function SidebarOrgSwitcher({
  orgs, value, onChange, extra,
}: { orgs: Org[]; value: string; onChange?: (id: string) => void; extra?: ReactNode }) {
  const cur = orgs.find((o) => o.id === value) ?? orgs[0];
  return (
    <DM.Root>
      <DM.Trigger asChild>
        <button
          type="button"
          className="mb-1 flex w-full cursor-pointer items-center gap-2 rounded-lg border border-border bg-card p-2.5 text-left text-sm font-semibold text-foreground hover:bg-secondary"
        >
          <OrgLogo name={cur.name} />
          <span className="flex-1 truncate">{cur.name}</span>
          <ChevronsUpDown className="size-4 text-muted-foreground" />
        </button>
      </DM.Trigger>
      <DM.Portal>
        <DM.Content align="start" sideOffset={4} className={menu}>
          <div className={menuHead}>Switch account</div>
          {orgs.map((o) => (
            <DM.Item key={o.id} onSelect={() => onChange?.(o.id)} className={menuItem}>
              <OrgLogo name={o.name} />
              <span className="flex-1">{o.name}</span>
              {o.id === cur.id && <Check className="size-3.5 text-muted-foreground" />}
            </DM.Item>
          ))}
          {extra && (
            <>
              <DM.Separator className="my-1 h-px bg-border" />
              {extra}
            </>
          )}
        </DM.Content>
      </DM.Portal>
    </DM.Root>
  );
}

export interface Branch { id: string; meta?: string }

/** Branch selector card: branch name + chevrons, with the analysis time underneath. */
export function SidebarBranchSwitcher({
  branches, value, onChange,
}: { branches: Branch[]; value: string; onChange?: (id: string) => void }) {
  const cur = branches.find((b) => b.id === value) ?? branches[0];
  return (
    <div className="mb-3 rounded-lg border border-border bg-card">
      <DM.Root>
        <DM.Trigger asChild>
          <button
            type="button"
            title="Branch applies to every count and list"
            className="flex w-full cursor-pointer items-center gap-2 rounded-t-lg border-0 bg-transparent px-2 py-2.5 text-left text-xs font-medium text-foreground hover:bg-secondary"
          >
            <GitBranch className="size-4 text-muted-foreground" strokeWidth={1.75} />
            <span className="flex-1 truncate font-mono">{cur.id}</span>
            <ChevronsUpDown className="size-4 text-muted-foreground" />
          </button>
        </DM.Trigger>
        <DM.Portal>
          <DM.Content align="start" sideOffset={4} className={menu}>
            <div className={menuHead}>Switch branch</div>
            {branches.map((b) => (
              <DM.Item key={b.id} onSelect={() => onChange?.(b.id)} className={menuItem}>
                <span className="flex flex-1 flex-col leading-tight">
                  <span className="font-mono">{b.id}</span>
                  {b.meta && <small className="text-2xs text-muted-foreground">{b.meta}</small>}
                </span>
                {b.id === cur.id && <Check className="size-3.5 text-link" />}
              </DM.Item>
            ))}
          </DM.Content>
        </DM.Portal>
      </DM.Root>
      {cur.meta && (
        <div className="flex items-center gap-1.5 border-t border-border px-2 py-1.5 text-2xs text-muted-foreground">
          <History className="size-3.5" strokeWidth={1.75} />
          {cur.meta}
        </div>
      )}
    </div>
  );
}

/** Re-exported so apps can add items (e.g. theme options) to the org menu. */
export const SidebarMenuItem = ({ children, onSelect }: { children: ReactNode; onSelect?: () => void }) => (
  <DM.Item onSelect={onSelect} className={menuItem}>{children}</DM.Item>
);
