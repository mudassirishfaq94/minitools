/**
 * A tiny persistent store built on `localStorage`.
 *
 * `useLocalStorage` is fine for state owned by a single component, but
 * favorites and recents are read in many places at once (cards, tool pages,
 * navbar, dedicated pages). This store adds a subscription layer so every
 * consumer re-renders when the value changes — including changes made in
 * another browser tab.
 */

type Listener = () => void;

export interface PersistentStore<T> {
  get: () => T;
  set: (updater: T | ((current: T) => T)) => void;
  subscribe: (listener: Listener) => () => void;
  reset: () => void;
}

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    // Corrupt JSON or blocked storage — fall back rather than crash.
    return fallback;
  }
}

export function createPersistentStore<T>(
  key: string,
  fallback: T,
  /** Runs on load so malformed persisted data cannot break the UI. */
  sanitize?: (value: T) => T,
): PersistentStore<T> {
  const listeners = new Set<Listener>();
  const load = () => {
    const raw = readStorage(key, fallback);
    return sanitize ? sanitize(raw) : raw;
  };

  let current: T = typeof window === "undefined" ? fallback : load();
  let initialised = typeof window !== "undefined";

  const emit = () => listeners.forEach((listener) => listener());

  const persist = (value: T) => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Quota exceeded or storage disabled — keep working in memory.
    }
  };

  // Mirror changes made in other tabs.
  if (typeof window !== "undefined") {
    window.addEventListener("storage", (event) => {
      if (event.key !== key) return;
      current = load();
      emit();
    });
  }

  return {
    get() {
      // Lazily hydrate if the store was first read during SSR.
      if (!initialised && typeof window !== "undefined") {
        current = load();
        initialised = true;
      }
      return current;
    },
    set(updater) {
      const next =
        typeof updater === "function" ? (updater as (value: T) => T)(current) : updater;
      if (Object.is(next, current)) return;
      current = next;
      persist(next);
      emit();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    reset() {
      current = fallback;
      try {
        window.localStorage.removeItem(key);
      } catch {
        // ignore
      }
      emit();
    },
  };
}

/** Keeps only unique, non-empty strings. */
export function uniqueStrings(values: unknown): string[] {
  if (!Array.isArray(values)) return [];
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    if (typeof value !== "string" || !value) continue;
    if (seen.has(value)) continue;
    seen.add(value);
    result.push(value);
  }
  return result;
}
