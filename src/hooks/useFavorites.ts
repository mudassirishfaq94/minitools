import { useCallback, useSyncExternalStore } from "react";
import { createPersistentStore, uniqueStrings } from "@/utils/storage";

export const FAVORITES_KEY = "toolstack:favorites";

/** Guards against unbounded growth if storage is edited by hand. */
const MAX_FAVORITES = 200;

/** Shared across every component, so all consumers stay in sync. */
const store = createPersistentStore<string[]>(FAVORITES_KEY, [], (value) =>
  uniqueStrings(value).slice(0, MAX_FAVORITES),
);

interface FavoritesApi {
  /** Tool slugs, most recently added first. */
  favorites: string[];
  count: number;
  isFavorite: (slug: string) => boolean;
  toggle: (slug: string) => boolean;
  add: (slug: string) => void;
  remove: (slug: string) => void;
  clear: () => void;
}

/**
 * Favorite tools, persisted locally. No account required.
 * Entries are unique and newest-first.
 */
export function useFavorites(): FavoritesApi {
  const favorites = useSyncExternalStore(
    store.subscribe,
    store.get,
    () => [] as string[],
  );

  const add = useCallback((slug: string) => {
    if (!slug) return;
    store.set((current) =>
      current.includes(slug) ? current : [slug, ...current].slice(0, MAX_FAVORITES),
    );
  }, []);

  const remove = useCallback((slug: string) => {
    store.set((current) => current.filter((item) => item !== slug));
  }, []);

  /** Returns the new state, so callers can announce it. */
  const toggle = useCallback((slug: string) => {
    const willAdd = !store.get().includes(slug);
    store.set((current) =>
      willAdd
        ? [slug, ...current].slice(0, MAX_FAVORITES)
        : current.filter((item) => item !== slug),
    );
    return willAdd;
  }, []);

  const clear = useCallback(() => store.reset(), []);

  const isFavorite = useCallback(
    (slug: string) => favorites.includes(slug),
    [favorites],
  );

  return {
    favorites,
    count: favorites.length,
    isFavorite,
    toggle,
    add,
    remove,
    clear,
  };
}
