import { ArrowRight } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/utils/cn";
import { href } from "@/utils/router";
import { pluralize } from "@/utils/format";
import type { Category } from "@/types";

interface CategoryCardProps {
  category: Category;
  count: number;
  className?: string;
}

export function CategoryCard({ category, count, className }: CategoryCardProps) {
  const empty = count === 0;

  return (
    <a
      href={href(category.route)}
      data-nav-item
      aria-label={`${category.name} — ${empty ? "coming soon" : pluralize(count, "tool")}`}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm",
        "transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/5",
        "dark:border-slate-800 dark:bg-slate-900/60 dark:hover:shadow-black/30",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r opacity-70 transition-opacity group-hover:opacity-100",
          category.accent,
        )}
      />
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute -top-16 -right-10 h-32 w-32 rounded-full bg-gradient-to-br opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-20",
          category.accent,
        )}
      />

      <span
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105",
          category.chip,
        )}
      >
        <Icon name={category.icon} className="h-5 w-5" />
      </span>

      <h3 className="mt-4 text-[15px] font-semibold tracking-tight">{category.name}</h3>
      <p className="mt-1.5 flex-1 text-sm leading-relaxed muted">{category.tagline}</p>

      <div className="mt-4 flex items-center justify-between gap-2">
        {empty ? (
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            Coming soon
          </span>
        ) : (
          <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
            {pluralize(count, "tool")}
          </span>
        )}
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-400">
          Browse
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
        </span>
      </div>
    </a>
  );
}
