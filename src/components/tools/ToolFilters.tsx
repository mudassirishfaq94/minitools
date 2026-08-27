import type { KeyboardEvent, RefObject } from "react";
import { Search, X } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { categories } from "@/data/categories";
import { cn } from "@/utils/cn";

interface ToolFiltersProps {
  query: string;
  onQueryChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  resultCount: number;
  className?: string;
  /** Hide the category chips on pages that are already scoped to one category. */
  showCategories?: boolean;
  /** Per-category result counts, rendered next to each chip. */
  counts?: Record<string, number>;
  inputRef?: RefObject<HTMLInputElement | null>;
  /** ArrowDown / Enter from the search field moves into the results grid. */
  onEnterResults?: () => void;
}

/** Search field + horizontally scrollable category chips. */
export function ToolFilters({
  query,
  onQueryChange,
  category,
  onCategoryChange,
  resultCount,
  className,
  showCategories = true,
  counts,
  inputRef,
  onEnterResults,
}: ToolFiltersProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape" && query) {
      event.preventDefault();
      onQueryChange("");
      return;
    }
    if ((event.key === "ArrowDown" || event.key === "Enter") && resultCount > 0) {
      event.preventDefault();
      onEnterResults?.();
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search tools by name or category…"
          aria-label="Search tools"
          aria-describedby="tool-search-hint"
          className={cn(
            "h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-24 text-sm shadow-sm transition-colors",
            "placeholder:text-slate-400 hover:border-slate-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:outline-none",
            "dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 dark:focus:border-brand-400",
            "[&::-webkit-search-cancel-button]:hidden",
          )}
        />
        <div className="absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-2">
          {query ? (
            <button
              type="button"
              onClick={() => onQueryChange("")}
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
          <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-500 tabular-nums dark:bg-slate-800 dark:text-slate-400">
            {resultCount}
          </span>
        </div>
      </div>

      <p id="tool-search-hint" className="sr-only">
        Results update as you type. Press Enter or Arrow Down to move into the results, then use the
        arrow keys to move between tools.
      </p>

      {showCategories ? (
        <div
          className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 no-scrollbar"
          role="group"
          aria-label="Filter by category"
        >
          <FilterChip
            active={category === "all"}
            onClick={() => onCategoryChange("all")}
            label="All"
            count={counts?.all}
          />
          {categories.map((item) => (
            <FilterChip
              key={item.id}
              active={category === item.id}
              onClick={() => onCategoryChange(item.id)}
              label={item.name}
              icon={item.icon}
              count={counts?.[item.id]}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  icon,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon?: string;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-all",
        active
          ? "border-transparent bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900"
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800",
      )}
    >
      {icon ? <Icon name={icon} className="h-3.5 w-3.5" /> : null}
      {label}
      {typeof count === "number" ? (
        <span
          className={cn(
            "rounded-full px-1.5 text-[11px] tabular-nums",
            active
              ? "bg-white/20 text-white dark:bg-slate-900/10 dark:text-slate-900"
              : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
          )}
        >
          {count}
        </span>
      ) : null}
    </button>
  );
}
