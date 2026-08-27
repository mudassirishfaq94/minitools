import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

interface NoToolsFoundProps {
  /** The search term that produced no results. */
  query?: string;
  /** Human-readable scope, e.g. "Developer Tools". */
  scope?: string;
  onClear: () => void;
  className?: string;
}

/** Shared "No tools found" state for every tool listing. */
export function NoToolsFound({ query, scope, onClear, className }: NoToolsFoundProps) {
  const trimmed = query?.trim();

  const description = trimmed
    ? `Nothing matches “${trimmed}”${scope ? ` in ${scope}` : ""}. Try a shorter or different keyword.`
    : scope
      ? `There are no tools in ${scope} yet.`
      : "No tools match the current filters.";

  return (
    <EmptyState
      className={className}
      icon={<SearchX className="h-5 w-5" />}
      title="No tools found"
      description={description}
      action={
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button onClick={onClear}>Clear filters</Button>
          <Button variant="outline" href="/tools">
            Browse all tools
          </Button>
        </div>
      }
    />
  );
}
