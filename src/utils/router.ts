/**
 * Minimal hash router helpers.
 * Hash routing keeps the app working when it is served from a single
 * static file or from any sub-path, with no server configuration.
 */

export function normalizePath(path: string): string {
  let value = path.trim();
  if (!value.startsWith("/")) value = `/${value}`;
  value = value.replace(/\/{2,}/g, "/");
  if (value.length > 1) value = value.replace(/\/+$/, "");
  return value || "/";
}

/** Reads the current hash (e.g. `#/tool/base64-encoder`) as a path. */
export function hashToPath(hash: string): string {
  const raw = hash.replace(/^#/, "");
  const [pathname] = raw.split("?");
  return normalizePath(pathname || "/");
}

export function currentPath(): string {
  if (typeof window === "undefined") return "/";
  return hashToPath(window.location.hash);
}

export function href(path: string): string {
  return `#${normalizePath(path)}`;
}

export function navigate(path: string, { replace = false } = {}) {
  if (typeof window === "undefined") return;
  const target = href(path);
  if (window.location.hash === target) return;
  if (replace) {
    window.history.replaceState(null, "", target);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  } else {
    window.location.hash = target;
  }
}

export type RouteName =
  | "home"
  | "tools"
  | "category"
  | "tool"
  | "favorites"
  | "about"
  | "not-found";

export interface ParsedRoute {
  name: RouteName;
  path: string;
  /** Category id for `/tools/:category`. */
  category?: string;
  /** Tool slug for `/tool/:slug`. */
  slug?: string;
  params: Record<string, string>;
}

/**
 * Supported routes:
 *   /                         home
 *   /tools                    all tools
 *   /tools/:category          category listing
 *   /tool/:slug               single tool
 *   /favorites                favorites & recently used
 *   /about                    about page
 */
export function parseRoute(path: string): ParsedRoute {
  const segments = normalizePath(path).split("/").filter(Boolean);

  if (segments.length === 0) return { name: "home", path: "/", params: {} };

  if (segments[0] === "tools") {
    if (!segments[1]) return { name: "tools", path: "/tools", params: {} };
    return {
      name: "category",
      path: `/tools/${segments[1]}`,
      category: segments[1],
      params: { category: segments[1] },
    };
  }

  if (segments[0] === "tool" && segments[1]) {
    return {
      name: "tool",
      path: `/tool/${segments[1]}`,
      slug: segments[1],
      params: { slug: segments[1] },
    };
  }

  if (segments[0] === "favorites") {
    return { name: "favorites", path: "/favorites", params: {} };
  }

  if (segments[0] === "about") return { name: "about", path: "/about", params: {} };

  return { name: "not-found", path: normalizePath(path), params: {} };
}
