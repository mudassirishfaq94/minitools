import type { ReactNode } from "react";
import { ToolCard } from "@/components/tools/ToolCard";
import { cn } from "@/utils/cn";
import type { ToolMeta } from "@/types";

interface ToolGridProps {
  tools: ToolMeta[];
  query?: string;
  className?: string;
  emptyState?: ReactNode;
  columns?: 3 | 4;
}

const columnClasses: Record<3 | 4, string> = {
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
};

export function ToolGrid({ tools, query, className, emptyState, columns = 3 }: ToolGridProps) {
  if (tools.length === 0 && emptyState) return <>{emptyState}</>;

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:gap-5",
        columnClasses[columns],
        className,
      )}
    >
      {tools.map((tool, index) => (
        <div
          key={tool.id}
          className="animate-fade-up"
          style={{ animationDelay: `${Math.min(index, 11) * 30}ms` }}
        >
          <ToolCard tool={tool} query={query} />
        </div>
      ))}
    </div>
  );
}
