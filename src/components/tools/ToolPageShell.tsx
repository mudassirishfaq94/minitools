import type { ReactNode } from "react";
import { ChevronRight, Layers } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { ToolBadgePill } from "@/components/ui/Badge";
import { FavoriteButton } from "@/components/tools/FavoriteButton";
import { FaqSection } from "@/components/tools/FaqSection";
import { HowToSection } from "@/components/tools/HowToSection";
import { ToolCard } from "@/components/tools/ToolCard";
import { buildFaqs, buildHowTo, buildIntro } from "@/data/toolContent";
import { getCategory, relatedTools } from "@/data/catalog";
import { cn } from "@/utils/cn";
import { href } from "@/utils/router";
import type { ToolMeta } from "@/types";

interface ToolPageShellProps {
  tool: ToolMeta;
  children: ReactNode;
  /** Extra content rendered under the header, e.g. a status bar. */
  toolbar?: ReactNode;
}

export function ToolPageShell({ tool, children, toolbar }: ToolPageShellProps) {
  const category = getCategory(tool.category);
  const related = relatedTools(tool);

  // Supporting copy is derived from the catalog, not written per page.
  const intro = buildIntro(tool);
  const howTo = buildHowTo(tool);
  const faqs = buildFaqs(tool);

  return (
    <>
      <div className="relative overflow-hidden border-b border-slate-200 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-900/30">
        <div aria-hidden="true" className="absolute inset-0 grid-bg opacity-60" />
        <Container className="relative py-8 sm:py-10">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400"
          >
            <a href={href("/")} className="transition-colors hover:text-brand-600">
              Home
            </a>
            <ChevronRight className="h-3 w-3" />
            <a href={href("/tools")} className="transition-colors hover:text-brand-600">
              Tools
            </a>
            {category ? (
              <>
                <ChevronRight className="h-3 w-3" />
                <a
                  href={href(category.route)}
                  className="transition-colors hover:text-brand-600"
                >
                  {category.name}
                </a>
              </>
            ) : null}
            <ChevronRight className="h-3 w-3" />
            <span className="font-medium text-slate-900 dark:text-slate-100">{tool.name}</span>
          </nav>

          <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-start">
            <span
              className={cn(
                "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl",
                category?.chip ?? "bg-brand-500/10 text-brand-600",
              )}
            >
              <Icon name={tool.icon} className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{tool.name}</h1>
                <ToolBadgePill badge={tool.badge} />
              </div>
              <p className="mt-2 max-w-2xl text-pretty leading-relaxed muted">
                {tool.description}
              </p>
            </div>

            <FavoriteButton
              slug={tool.slug}
              name={tool.name}
              variant="button"
              className="shrink-0 sm:mt-1"
            />
          </div>

          {toolbar ? <div className="mt-6">{toolbar}</div> : null}
        </Container>
      </div>

      <Container className="py-8 sm:py-10">
        {/* Main tool interface */}
        <section aria-label={`${tool.name} tool`}>{children}</section>

        {/* Supporting content, all generated from catalog data */}
        <div className="mt-14 space-y-14 border-t border-slate-200 pt-12 dark:border-slate-800">
          <p className="max-w-3xl text-pretty leading-relaxed muted">{intro}</p>

          <HowToSection toolName={tool.name} steps={howTo} />

          <FaqSection toolName={tool.name} items={faqs} />

          {related.length > 0 ? (
            <section aria-labelledby="related-heading">
              <div className="mb-4 flex items-center gap-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <Layers className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <h2 id="related-heading" className="text-lg font-semibold tracking-tight">
                    Related tools
                  </h2>
                  <p className="truncate text-xs muted">
                    Others in {category?.name ?? "this collection"} and similar utilities
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {related.map((item) => (
                  <ToolCard key={item.id} tool={item} />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </Container>
    </>
  );
}
