import * as D from "@radix-ui/react-dialog";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { CircleCheck, Info, OctagonAlert, X } from "lucide-react";
import { cn } from "@/registry/latent/lib/utils";

/* ---------- Dialog ---------- */
/**
 * Modal dialog: title, optional description, body and a right-aligned footer.
 * Focus is trapped while open; Esc and the × close it.
 *
 *   <Dialog open={open} onOpenChange={setOpen} title="Generate a plan?"
 *     footer={<><Button variant="ghost" onClick={close}>Cancel</Button><Button variant="primary">Generate</Button></>}>
 *     …
 *   </Dialog>
 */
export function Dialog({ open, onOpenChange, title, description, children, footer, width = 480 }: { open: boolean; onOpenChange: (v: boolean) => void; title: ReactNode; description?: ReactNode; children?: ReactNode; footer?: ReactNode; width?: number }) {
  return (
    <D.Root open={open} onOpenChange={onOpenChange}>
      <D.Portal>
        <D.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px]" />
        <D.Content
          className="fixed top-1/2 left-1/2 z-50 flex max-h-[85vh] w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-[var(--shadow-lg)] outline-none"
          style={{ maxWidth: width }}
        >
          <div className="flex items-start gap-3 px-5 pt-5 pb-3">
            <div className="min-w-0 flex-1">
              <D.Title className="m-0 text-lg font-semibold">{title}</D.Title>
              {description ? <D.Description className="m-0 mt-1 text-sm text-muted-foreground">{description}</D.Description> : <D.Description className="sr-only">{title}</D.Description>}
            </div>
            <D.Close aria-label="Close" className="-mt-1 -mr-1 inline-flex size-7 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground">
              <X className="size-4" />
            </D.Close>
          </div>
          {children && <div className="min-h-0 overflow-auto px-5 pb-4 text-base leading-[1.55] text-text-secondary">{children}</div>}
          {footer && <div className="flex justify-end gap-2 border-t border-border bg-surface-subtle px-5 py-3">{footer}</div>}
        </D.Content>
      </D.Portal>
    </D.Root>
  );
}

/* ---------- Toast ---------- */
type ToastTone = "neutral" | "success" | "danger";
interface ToastItem { id: number; message: ReactNode; tone: ToastTone; action?: { label: string; onClick: () => void } }
const Ctx = createContext<(message: ReactNode, opts?: { tone?: ToastTone; action?: ToastItem["action"]; duration?: number }) => void>(() => {});

/** Wrap the app once. Toasts stack bottom-centre and dismiss after 3s (or on click of ×). */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const dismiss = (id: number) => setItems((t) => t.filter((x) => x.id !== id));
  const push = useCallback<React.ContextType<typeof Ctx>>((message, opts = {}) => {
    const id = Date.now() + Math.random();
    setItems((t) => [...t.slice(-2), { id, message, tone: opts.tone ?? "neutral", action: opts.action }]);
    setTimeout(() => dismiss(id), opts.duration ?? 3000);
  }, []);
  const ICON = { neutral: Info, success: CircleCheck, danger: OctagonAlert };
  const IC = { neutral: "text-muted-foreground", success: "text-success-fg", danger: "text-danger-fg" };
  return (
    <Ctx.Provider value={push}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed bottom-5 left-1/2 z-[60] flex -translate-x-1/2 flex-col items-center gap-2">
        {items.map((t) => {
          const I = ICON[t.tone];
          return (
            <div key={t.id} role="status" className="pointer-events-auto flex min-h-10 items-center gap-2.5 rounded-lg border border-border bg-popover py-2 pr-2 pl-3 text-sm text-popover-foreground shadow-[var(--shadow-lg)]">
              <I className={cn("size-4 shrink-0", IC[t.tone])} strokeWidth={1.75} />
              <span>{t.message}</span>
              {t.action && <button type="button" onClick={() => { t.action!.onClick(); dismiss(t.id); }} className="ml-1 cursor-pointer border-0 bg-transparent p-0 text-sm font-medium text-link hover:underline">{t.action.label}</button>}
              <button type="button" aria-label="Dismiss" onClick={() => dismiss(t.id)} className="inline-flex size-6 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground"><X className="size-3.5" /></button>
            </div>
          );
        })}
      </div>
    </Ctx.Provider>
  );
}

/** const toast = useToast(); toast("Status set to Resolved", { tone: "success", action: { label: "Undo", onClick } }) */
export const useToast = () => useContext(Ctx);
