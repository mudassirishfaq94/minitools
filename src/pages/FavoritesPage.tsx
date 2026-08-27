import { useEffect, useMemo } from "react";
import { Clock, History, Star, Trash2 } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { ToolGrid } from "@/components/tools/ToolGrid";
import { FavoriteButton } from "@/components/tools/FavoriteButton";
import { useFavorites } from "@/hooks/useFavorites";
import { MAX_RECENTS, useRecentTools } from "@/hooks/useRecentTools";
import { findStaleSlugs, findToolBySlug, resolveSlugs } from "@/data/catalog";
import { getCategory } from "@/data/categories";
import { cn } from "@/utils/cn";
import { pluralize, timeAgo } from "@/utils/format";
import { href } from "@/utils/router";

export function FavoritesPage() {
  const { favorites, clear: clearFavorites, remove: unfavorite } = useFavorites();
  const { recents, clear: clearRecents, remove: removeRecent } = useRecentTools();

  const favoriteTools = useMemo(() => resolveSlugs(favorites), [favorites]);

  // Prune slugs whose tool has since been renamed or removed.
  useEffect(() => {
    const stale = findStaleSlugs(favorites);
    stale.forEach((slug) => unfavorite(slug));
  }, [favorites, unfavorite]);

  useEffect(() => {
    const stale = findStaleSlugs(recents.map((entry) => entry.slug));
    stale.forEach((slug) => removeRecent(slug));
  }, [recents, removeRecent]);

  const recentEntries = useMemo(
    () =>
      recents
        .map((entry) => ({ entry, tool: findToolBySlug(entry.slug) }))
        .filter((item): item is { entry: (typeof recents)[number]; tool: NonNullable<ReturnType<typeof findToolBySlug>> } =>
          Boolean(item.tool),
        ),
    [recents],
  );

  return (
    <Container className="py-10 sm:py-14">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Your tools</h1>
        <p className="mt-3 text-pretty leading-relaxed muted">
          Favorites and recent activity are saved in this browser only — no account, no sync, no
          tracking. Clearing your browser data will reset them.
        </p>
      </header>

      {/* Favorites ---------------------------------------------------- */}
      <section className="mt-10" aria-labelledby="favorites-heading">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
              <Star className="h-4 w-4 fill-current" />
            </span>
            <div>
              <h2 id="favorites-heading" className="text-base font-semibold tracking-tight">
                Favorites
              </h2>
              <p className="text-xs muted">
                {favoriteTools.length > 0
                  ? pluralize(favoriteTools.length, "tool")
                  : "Star a tool to pin it here"}
              </p>
            </div>
          </div>

          {favoriteTools.length > 0 ? (
            <Button variant="ghost" size="sm" onClick={clearFavorites}>
              <Trash2 className="h-3.5 w-3.5" />
              Clear all
            </Button>
          ) : null}
        </div>

        {favoriteTools.length === 0 ? (
          <EmptyState
            icon={<Star className="h-5 w-5" />}
            title="No favorites yet"
            description="Tap the star on any tool card — or the button on a tool page — to keep it here for quick access."
            action={
              <Button href="/tools" variant="outline">
                Browse all tools
              </Button>
            }
          />
        ) : (
          <ToolGrid tools={favoriteTools} columns={4} />
        )}
      </section>

      {/* Recently used ------------------------------------------------ */}
      <section className="mt-14" aria-labelledby="recents-heading">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
              <History className="h-4 w-4" />
            </span>
            <div>
              <h2 id="recents-heading" className="text-base font-semibold tracking-tight">
                Recently used
              </h2>
              <p className="text-xs muted">
                {recentEntries.length > 0
                  ? `Last ${MAX_RECENTS} tools you opened`
                  : "Your history will appear here"}
              </p>
            </div>
          </div>

          {recentEntries.length > 0 ? (
            <Button variant="ghost" size="sm" onClick={clearRecents}>
              <Trash2 className="h-3.5 w-3.5" />
              Clear history
            </Button>
          ) : null}
        </div>

        {recentEntries.length === 0 ? (
          <EmptyState
            icon={<Clock className="h-5 w-5" />}
            title="Nothing here yet"
            description="Tools you open will be listed here so you can jump straight back to them."
            action={
              <Button href="/tools" variant="outline">
                Find a tool
              </Button>
            }
          />
        ) : (
          <Card padded={false} className="overflow-hidden">
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentEntries.map(({ entry, tool }) => {
                const category = getCategory(tool.category);
                return (
                  <li key={entry.slug} className="group flex items-center gap-3 px-3 py-2.5 sm:px-4">
                    <a
                      href={href(tool.route)}
                      className="flex min-w-0 flex-1 items-center gap-3 rounded-lg py-1"
                    >
                      <span
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                          category?.chip ?? "bg-brand-500/10 text-brand-600",
                        )}
                      >
                        <Icon name={tool.icon} className="h-4 w-4" />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{tool.name}</span>
                        <span className="block truncate text-xs muted">
                          {category?.name}
                          <span aria-hidden="true"> · </span>
                          {timeAgo(entry.at)}
                          {entry.count > 1 ? (
                            <>
                              <span aria-hidden="true"> · </span>
                              {entry.count} visits
                            </>
                          ) : null}
                        </span>
                      </span>
                    </a>

                    <div className="flex shrink-0 items-center gap-0.5">
                      <FavoriteButton slug={tool.slug} name={tool.name} />
                      <button
                        type="button"
                        onClick={() => removeRecent(entry.slug)}
                        aria-label={`Remove ${tool.name} from history`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:text-slate-600 dark:hover:bg-rose-500/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        )}
      </section>

      <p className="mt-10 rounded-xl bg-slate-50 px-4 py-3 text-xs muted dark:bg-slate-900/60">
        Stored with <code className="font-mono">localStorage</code> under
        <code className="mx-1 font-mono">toolstack:favorites</code> and
        <code className="mx-1 font-mono">toolstack:recent</code>. The data never leaves your
        device and is not sent anywhere.
      </p>
    </Container>
  );
}
