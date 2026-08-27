import { useCallback, useEffect, useState } from "react";
import { currentPath, navigate as routerNavigate, parseRoute, type ParsedRoute } from "@/utils/router";

interface HashRoute extends ParsedRoute {
  navigate: (path: string) => void;
}

/** Subscribes to hash changes and returns the parsed route. */
export function useHashRoute(): HashRoute {
  const [path, setPath] = useState<string>(() => currentPath());

  useEffect(() => {
    const onChange = () => setPath(currentPath());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  // Scroll to top on navigation (except for in-page anchors).
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [path]);

  const navigate = useCallback((next: string) => routerNavigate(next), []);

  return { ...parseRoute(path), navigate };
}
