import { ArrowUpRight } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { FavoriteButton } from "@/components/tools/FavoriteButton";
import { ToolBadgePill } from "@/components/ui/Badge";
import { getCategory } from "@/data/categories";
import { cn } from "@/utils/cn";
import { href } from "@/utils/router";
import { highlightRanges } from "@/utils/search";
import type { ToolMeta } from "@/types";

interface ToolCardProps {
  tool: ToolMeta;
  /** Search term used to highlight matches in the title. */
  query?: string;
  className?: string;
  compact?: boolean;
}

export function ToolCard({ tool, query = "", className, compact }: ToolCardProps) {
  const category = getCategory(tool.category);
  const parts = highlightRanges(tool.name, query);

  return (
    <a
      href={href(tool.route)}
      data-nav-item
      aria-label={`${tool.name} — ${category?.name ?? "tool"}`}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm",
        "transition-all duration-300 hover:-translate-y-1 hover:border-brand-300/70 hover:shadow-xl hover:shadow-slate-900/5",
        "dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-brand-500/40 dark:hover:shadow-black/30",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-x-0 -top-24 h-32 bg-gradient-to-br opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-20",
          category?.accent ?? "from-brand-500 to-fuchsia-500",
        )}
      />

      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105",
            category?.chip ?? "bg-brand-500/10 text-brand-600",
          )}
        >
          <Icon name={tool.icon} className="h-5 w-5" />
        </span>
        <div className="flex items-center gap-0.5">
          <FavoriteButton slug={tool.slug} name={tool.name} />
          <ArrowUpRight className="h-4 w-4 text-slate-300 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-500 dark:text-slate-600" />
        </div>
      </div>

      <h3 className="mt-4 flex items-center gap-2 text-[15px] font-semibold tracking-tight">
        <span className="truncate">
          {parts.map((part, index) =>
            part.match ? (
              <mark
                key={index}
                className="bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-200"
              >
                {part.text}
              </mark>
            ) : (
              <span key={index}>{part.text}</span>
            ),
          )}
        </span>
      </h3>

      {compact ? null : (
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed muted">{tool.description}</p>
      )}

      <div className="mt-auto flex items-center gap-2 pt-4">
        <ToolBadgePill badge={tool.badge} />
        {category ? (
          <span className="ml-auto text-xs font-medium text-slate-400 dark:text-slate-500">
            {category.name}
          </span>
        ) : null}
      </div>
    </a>
  );
}
