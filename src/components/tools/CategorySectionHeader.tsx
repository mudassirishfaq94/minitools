import { Icon } from "@/components/ui/Icon";
import { cn } from "@/utils/cn";
import { href } from "@/utils/router";
import type { Category } from "@/types";

interface CategorySectionHeaderProps {
  category: Category;
  /** Renders a "View all" link to the category page. */
  showLink?: boolean;
  /** Id used by the section's `aria-labelledby`. */
  headingId?: string;
  className?: string;
}

/** Compact category heading used above grouped tool rows. */
export function CategorySectionHeader({
  category,
  showLink = true,
  headingId,
  className,
}: CategorySectionHeaderProps) {
  return (
    <div className={cn("mb-4 flex items-center gap-3", className)}>
      <span
        className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", category.chip)}
      >
        <Icon name={category.icon} className="h-4 w-4" />
      </span>

      <div className="min-w-0 flex-1">
        <h2 id={headingId} className="truncate text-base font-semibold tracking-tight">
          {category.name}
        </h2>
        <p className="truncate text-xs muted">{category.tagline}</p>
      </div>

      {showLink ? (
        <a
          href={href(category.route)}
          className="shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
        >
          View all
          <span className="sr-only"> {category.name}</span>
        </a>
      ) : null}
    </div>
  );
}
