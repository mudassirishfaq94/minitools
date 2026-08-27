import { useMemo, useState } from "react";
import { filterTools } from "@/utils/search";
import { useDebounce } from "@/hooks/useDebounce";
import type { ToolMeta } from "@/types";

interface ToolSearchResult<T extends ToolMeta> {
  query: string;
  setQuery: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
  results: T[];
  isFiltering: boolean;
  reset: () => void;
}

/** Debounced search + category filtering over a tool collection. */
export function useToolSearch<T extends ToolMeta>(
  tools: T[],
  initialCategory = "all",
  /** Kept short so results feel instant while still batching fast typing. */
  debounceMs = 90,
): ToolSearchResult<T> {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const debounced = useDebounce(query, debounceMs);

  const results = useMemo(
    () => filterTools(tools, { query: debounced, category }),
    [tools, debounced, category],
  );

  const reset = () => {
    setQuery("");
    setCategory("all");
  };

  return {
    query,
    setQuery,
    category,
    setCategory,
    results,
    isFiltering: query.trim().length > 0 || category !== "all",
    reset,
  };
}
