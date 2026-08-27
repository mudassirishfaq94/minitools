import { useMemo, useRef } from "react";
import { Keyboard } from "lucide-react";
import { CategorySectionHeader } from "@/components/tools/CategorySectionHeader";
import { NoToolsFound } from "@/components/tools/NoToolsFound";
import { ToolCard } from "@/components/tools/ToolCard";
import { ToolFilters } from "@/components/tools/ToolFilters";
import { ToolGrid } from "@/components/tools/ToolGrid";
import { Button } from "@/components/ui/Button";
import { countsForQuery, groupToolsByCategory } from "@/data/catalog";
import { useGridKeyboardNav } from "@/hooks/useGridKeyboardNav";
import { useToolSearch } from "@/hooks/useToolSearch";
import { cn } from "@/utils/cn";
import { pluralize } from "@/utils/format";
import type { ToolMeta } from "@/types";

interface ToolBrowserProps {
  /** Tools this browser can search through. */
  tools: ToolMeta[];
  /** Show the category filter chips (off for single-category pages). */
  showCategories?: boolean;
  /** Category the browser starts scoped to. */
  initialCategory?: string;
  /** Group results by category while no filters are active. */
  groupWhenIdle?: boolean;
  /** Human-readable scope used in the empty state, e.g. "Text Tools". */
  scope?: string;
  columns?: 3 | 4;
  className?: string;
}

/**
 * Complete search + filter + results experience.
 *
 * Owns the search state, per-category counts, keyboard navigation and the
 * "no tools found" state, so listing pages only supply data and layout.
 */
export function ToolBrowser({
  tools,
  showCategories = true,
  initialCategory = "all",
  groupWhenIdle = false,
  scope,
  columns = 4,
  className,
}: ToolBrowserProps) {
  const { query, setQuery, category, setCategory, results, isFiltering, reset } = useToolSearch(
    tools,
    initialCategory,
  );

  const searchRef = useRef<HTMLInputElement>(null);
  const { containerRef, onKeyDown, focusFirst } = useGridKeyboardNav<HTMLDivElement>();

  const counts = useMemo(
    () => (showCategories ? countsForQuery(query, tools) : undefined),
    [showCategories, query, tools],
  );

  const groups = useMemo(
    () => (groupWhenIdle && !isFiltering ? groupToolsByCategory(results) : []),
    [groupWhenIdle, isFiltering, results],
  );

  const clearAll = () => {
    reset();
    searchRef.current?.focus();
  };

  return (
    <div className={cn("min-w-0", className)}>
      <ToolFilters
        query={query}
        onQueryChange={setQuery}
        category={category}
        onCategoryChange={setCategory}
        resultCount={results.length}
        showCategories={showCategories}
        counts={counts}
        inputRef={searchRef}
        onEnterResults={focusFirst}
        className={showCategories ? undefined : "max-w-xl"}
      />

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm muted" role="status" aria-live="polite">
          {results.length === 0
            ? "No tools found"
            : `Showing ${pluralize(results.length, "tool")}`}
          {query.trim() ? ` for “${query.trim()}”` : ""}
        </p>

        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-1.5 text-xs muted sm:inline-flex">
            <Keyboard className="h-3.5 w-3.5" />
            Arrow keys to browse
          </span>
          {isFiltering ? (
            <Button variant="ghost" size="sm" onClick={clearAll}>
              Clear filters
            </Button>
          ) : null}
        </div>
      </div>

      <div ref={containerRef} onKeyDown={onKeyDown} className="mt-6">
        {results.length === 0 ? (
          <NoToolsFound query={query} scope={scope} onClear={clearAll} />
        ) : groups.length > 0 ? (
          <div className="space-y-10">
            {groups.map((group) => (
              <section key={group.category.id} aria-labelledby={`group-${group.category.id}`}>
                <CategorySectionHeader
                  category={group.category}
                  headingId={`group-${group.category.id}`}
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {group.tools.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <ToolGrid tools={results} query={query} columns={columns} />
        )}
      </div>
    </div>
  );
}
