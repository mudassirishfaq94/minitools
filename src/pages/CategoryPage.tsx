import { Sparkles } from "lucide-react";
import { ToolBrowser } from "@/components/tools/ToolBrowser";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { categories, getCategory, toolsInCategory } from "@/data/catalog";
import { cn } from "@/utils/cn";
import { pluralize } from "@/utils/format";
import { href } from "@/utils/router";
import type { Category } from "@/types";

interface CategoryPageProps {
  categoryId: string;
}

export function CategoryPage({ categoryId }: CategoryPageProps) {
  const category = getCategory(categoryId);
  const categoryTools = toolsInCategory(categoryId);

  if (!category) {
    return (
      <Container className="py-16">
        <EmptyState
          title="Category not found"
          description="That category does not exist. Browse everything from the tools page instead."
          action={
            <Button href="/tools" variant="outline">
              Browse all tools
            </Button>
          }
        />
      </Container>
    );
  }

  return (
    <Container className="py-10 sm:py-14">
      <CategoryHeader category={category} count={categoryTools.length} />

      {categoryTools.length === 0 ? (
        <ComingSoon category={category} />
      ) : (
        <ToolBrowser
          tools={categoryTools}
          initialCategory={category.id}
          showCategories={false}
          scope={category.name}
          columns={3}
          className="mt-8"
        />
      )}
    </Container>
  );
}

function CategoryHeader({ category, count }: { category: Category; count: number }) {
  return (
    <header className="flex flex-col gap-5 sm:flex-row sm:items-center">
      <span
        className={cn(
          "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl",
          category.chip,
        )}
      >
        <Icon name={category.icon} className="h-6 w-6" />
      </span>
      <div className="min-w-0">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{category.name}</h1>
        <p className="mt-2 max-w-2xl text-pretty leading-relaxed muted">{category.description}</p>
        <p className="mt-2 text-xs font-medium text-slate-400 dark:text-slate-500">
          {count > 0 ? `${pluralize(count, "tool")} · ${category.tagline}` : category.tagline}
        </p>
      </div>
    </header>
  );
}

/** Shown for categories that exist in the roadmap but have no tools yet. */
function ComingSoon({ category }: { category: Category }) {
  return (
    <>
      <EmptyState
        className="mt-8"
        icon={<Sparkles className="h-5 w-5" />}
        title={`${category.name} are on the way`}
        description="This category is part of the roadmap and has no tools yet. Everything else is ready to use today."
        action={
          <Button href="/tools" variant="outline">
            Browse available tools
          </Button>
        }
      />

      <div className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          Other categories
        </h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {categories
            .filter((item) => item.id !== category.id)
            .map((item) => (
              <a
                key={item.id}
                href={href(item.route)}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
              >
                <Icon name={item.icon} className="h-3.5 w-3.5" />
                {item.name}
              </a>
            ))}
        </div>
      </div>
    </>
  );
}
