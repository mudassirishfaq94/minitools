import { useMemo } from "react";
import { ArrowRight, History, Star } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ToolCard } from "@/components/tools/ToolCard";
import { useFavorites } from "@/hooks/useFavorites";
import { useRecentTools } from "@/hooks/useRecentTools";
import { resolveSlugs } from "@/data/catalog";
import { pluralize } from "@/utils/format";

/**
 * Homepage section showing the visitor's own favorites and recent tools.
 *
 * Renders nothing at all until there is something to show, so a first-time
 * visitor never sees an empty shell above the main content.
 */
export function PersonalSection() {
  const { favorites } = useFavorites();
  const { slugs } = useRecentTools();

  const favoriteTools = useMemo(() => resolveSlugs(favorites).slice(0, 4), [favorites]);
  const recentTools = useMemo(
    () =>
      resolveSlugs(slugs)
        // Avoid repeating a tool already shown under favorites.
        .filter((tool) => !favorites.includes(tool.slug))
        .slice(0, 4),
    [slugs, favorites],
  );

  if (favoriteTools.length === 0 && recentTools.length === 0) return null;

  return (
    <section className="border-b border-slate-200 bg-slate-50/60 py-12 dark:border-slate-800 dark:bg-slate-900/30">
      <Container className="space-y-10">
        {favoriteTools.length > 0 ? (
          <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
                  <Star className="h-4 w-4 fill-current" />
                </span>
                <div>
                  <h2 className="text-base font-semibold tracking-tight">Your favorites</h2>
                  <p className="text-xs muted">{pluralize(favorites.length, "saved tool")}</p>
                </div>
              </div>
              <Button href="/favorites" variant="ghost" size="sm">
                View all
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {favoriteTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </div>
        ) : null}

        {recentTools.length > 0 ? (
          <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
                  <History className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="text-base font-semibold tracking-tight">Pick up where you left off</h2>
                  <p className="text-xs muted">Recently opened</p>
                </div>
              </div>
              <Button href="/favorites" variant="ghost" size="sm">
                Full history
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {recentTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </div>
        ) : null}
      </Container>
    </section>
  );
}
