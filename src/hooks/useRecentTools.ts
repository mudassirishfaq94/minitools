import { useCallback, useEffect, useSyncExternalStore } from "react";
import { createPersistentStore } from "@/utils/storage";

export const RECENTS_KEY = "toolstack:recent";

/** Keeps the list useful and the payload small. */
export const MAX_RECENTS = 12;

export interface RecentEntry {
  slug: string;
  /** Epoch milliseconds of the most recent visit. */
  at: number;
  /** Total number of visits. */
  count: number;
}

function sanitize(value: unknown): RecentEntry[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const entries: RecentEntry[] = [];

  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const { slug, at, count } = item as Partial<RecentEntry>;
    if (typeof slug !== "string" || !slug || seen.has(slug)) continue;
    seen.add(slug);
    entries.push({
      slug,
      at: typeof at === "number" && Number.isFinite(at) ? at : Date.now(),
      count: typeof count === "number" && count > 0 ? Math.floor(count) : 1,
    });
  }

  return entries.sort((a, b) => b.at - a.at).slice(0, MAX_RECENTS);
}

const store = createPersistentStore<RecentEntry[]>(RECENTS_KEY, [], sanitize);

interface RecentToolsApi {
  recents: RecentEntry[];
  /** Slugs only, newest first. */
  slugs: string[];
  count: number;
  /** Records a visit — moves the tool to the front and bumps its counter. */
  record: (slug: string) => void;
  remove: (slug: string) => void;
  clear: () => void;
}

/**
 * Recently used tools, persisted locally.
 *
 * The list is de-duplicated by slug: revisiting a tool moves it to the front
 * and increments its visit count rather than adding a second entry.
 */
export function useRecentTools(): RecentToolsApi {
  const recents = useSyncExternalStore(
    store.subscribe,
    store.get,
    () => [] as RecentEntry[],
  );

  const record = useCallback((slug: string) => recordToolVisit(slug), []);

  const remove = useCallback((slug: string) => {
    store.set((current) => current.filter((entry) => entry.slug !== slug));
  }, []);

  const clear = useCallback(() => store.reset(), []);

  return {
    recents,
    slugs: recents.map((entry) => entry.slug),
    count: recents.length,
    record,
    remove,
    clear,
  };
}

/** Writes a visit directly to the store, without subscribing to it. */
export function recordToolVisit(slug: string) {
  if (!slug) return;
  store.set((current) => {
    const existing = current.find((entry) => entry.slug === slug);
    const rest = current.filter((entry) => entry.slug !== slug);
    return [{ slug, at: Date.now(), count: (existing?.count ?? 0) + 1 }, ...rest].slice(
      0,
      MAX_RECENTS,
    );
  });
}

/**
 * Records a tool visit once per mount.
 *
 * Deliberately does not call `useRecentTools`: subscribing would re-render the
 * entire tool page every time the history changes, which is pure overhead for
 * a component that only ever writes.
 */
export function useRecordToolVisit(slug: string | undefined) {
  useEffect(() => {
    if (!slug) return;
    // Small delay so a quick mis-navigation is not recorded as a real visit.
    const timer = window.setTimeout(() => recordToolVisit(slug), 600);
    return () => window.clearTimeout(timer);
  }, [slug]);
}
