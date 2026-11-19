import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { Search } from "lucide-react";
import { cn } from "@/registry/latent/lib/utils";

/**
 * List toolbar: quick-view tabs on the left, search + actions on the right, active filters underneath.
 * Everything in the top row is 32px tall.
 *
 *   <Toolbar
 *     start={<Tabs … />}
 *     end={<><SearchField … /><Button><Filter />Filter</Button><Button><SlidersHorizontal />Display</Button></>}
 *     filters={<FilterBadge … />}
 *     onClearFilters={…}
 *   />
 */
export function Toolbar({ start, end, filters, onClearFilters, className }: { start?: ReactNode; end?: ReactNode; filters?: ReactNode; onClearFilters?: () => void; className?: string }) {
  const hasFilters = Array.isArray(filters) ? filters.length > 0 : !!filters;
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex min-h-8 flex-wrap items-center gap-3">
        {start && <div className="flex min-w-0 items-center gap-2">{start}</div>}
        {end && <div className="ml-auto flex items-center gap-2">{end}</div>}
      </div>
      {hasFilters && (
        <div className="flex flex-wrap items-center gap-1.5">
          {filters}
          {onClearFilters && (
            <button type="button" onClick={onClearFilters} className="ml-1 cursor-pointer border-0 bg-transparent p-0 text-xs text-muted-foreground hover:text-foreground">
              Clear all
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/** Search field for toolbars: filled, borderless, ring border on focus, search icon on the left. 32px tall. */
export const SearchField = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { wrapperClassName?: string }>(
  ({ className, wrapperClassName, placeholder = "Search…", ...props }, ref) => (
    <label className={cn("flex h-8 w-[200px] shrink-0 cursor-text items-center gap-1.5 rounded-lg border border-transparent bg-muted px-3 focus-within:border-ring", wrapperClassName)}>
      <Search className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
      <input
        ref={ref}
        type="search"
        placeholder={placeholder}
        className={cn("min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-foreground outline-none placeholder:text-text-subtle [&::-webkit-search-cancel-button]:hidden", className)}
        {...props}
      />
    </label>
  ),
);
SearchField.displayName = "SearchField";
