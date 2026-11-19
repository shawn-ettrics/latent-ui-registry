import * as T from "@radix-ui/react-tooltip";
import type { ReactNode } from "react";
import { cn } from "@/registry/latent/lib/utils";

/** Popover-styled tooltip, 6px below the trigger. Wrap the app once in <TooltipProvider>. */
export const TooltipProvider = ({ children }: { children: ReactNode }) => (
  <T.Provider delayDuration={150} skipDelayDuration={0}>{children}</T.Provider>
);

export function Tooltip({ content, children, className }: { content?: ReactNode; children: ReactNode; className?: string }) {
  if (!content) return <>{children}</>;
  return (
    <T.Root>
      <T.Trigger asChild>{children}</T.Trigger>
      <T.Portal>
        <T.Content
          side="bottom"
          sideOffset={6}
          className={cn(
            "z-50 whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-xs font-medium leading-4 text-popover-foreground shadow-[var(--shadow-lg)]",
            className,
          )}
        >
          {content}
        </T.Content>
      </T.Portal>
    </T.Root>
  );
}
