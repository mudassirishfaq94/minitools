import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, CornerDownLeft, Search, X } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { availableTools, getCategory, resolveSlugs } from "@/data/catalog";
import { useFavorites } from "@/hooks/useFavorites";
import { useRecentTools } from "@/hooks/useRecentTools";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useDebounce } from "@/hooks/useDebounce";
import { navigate } from "@/utils/router";
import { filterTools, highlightRanges } from "@/utils/search";
import type { ToolMeta } from "@/types";

interface SearchDialogProps {
  open: boolean;
  onClose: () => void;
}

export function SearchDialog({ open, onClose }: SearchDialogProps) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const debounced = useDebounce(query, 120);

  useBodyScrollLock(open);

  const { favorites } = useFavorites();
  const { slugs: recentSlugs } = useRecentTools();

  const results = useMemo<ToolMeta[]>(() => {
    if (debounced.trim()) return filterTools(availableTools, { query: debounced }).slice(0, 8);

    // With no query, surface the visitor's own tools before the defaults.
    const personal = resolveSlugs([...favorites, ...recentSlugs]);
    const seen = new Set(personal.map((tool) => tool.slug));
    const fallback = availableTools.filter(
      (tool) => tool.featured && !seen.has(tool.slug),
    );
    return [...personal, ...fallback].slice(0, 6);
  }, [debounced, favorites, recentSlugs]);

  const personalised = !debounced.trim() && (favorites.length > 0 || recentSlugs.length > 0);

  useEffect(() => setActiveIndex(0), [debounced]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      return;
    }
    const timer = setTimeout(() => inputRef.current?.focus(), 20);
    return () => clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((index) => (results.length ? (index + 1) % results.length : 0));
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((index) =>
          results.length ? (index - 1 + results.length) % results.length : 0,
        );
      } else if (event.key === "Enter") {
        const tool = results[activeIndex];
        if (tool) {
          event.preventDefault();
          onClose();
          navigate(tool.route);
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, results, activeIndex, onClose]);

  useEffect(() => {
    const node = listRef.current?.querySelector<HTMLElement>('[data-active="true"]');
    node?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  if (!open) return null;

  const select = (tool: ToolMeta) => {
    onClose();
    navigate(tool.route);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-[8vh] sm:pt-[12vh]">
      <button
        type="button"
        aria-label="Close search"
        onClick={onClose}
        className="absolute inset-0 animate-fade-in cursor-default bg-slate-900/40 backdrop-blur-sm dark:bg-slate-950/70"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search tools"
        className="relative w-full max-w-xl animate-scale-in overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex items-center gap-3 border-b border-slate-200 px-4 dark:border-slate-800">
          <Search className="h-4.5 w-4.5 shrink-0 text-slate-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search tools, e.g. base64, regex, password…"
            className="h-14 w-full bg-transparent text-[15px] outline-none placeholder:text-slate-400"
            aria-label="Search tools"
          />
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div ref={listRef} className="max-h-[min(60vh,26rem)] overflow-y-auto p-2 scrollbar-thin">
          {!query.trim() ? (
            <p className="px-3 pt-2 pb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
              {personalised ? "Your tools" : "Popular tools"}
            </p>
          ) : null}

          {results.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm muted">
              No tools match “{query}”. Try a different keyword.
            </p>
          ) : (
            <ul className="space-y-1">
              {results.map((tool, index) => {
                const active = index === activeIndex;
                const parts = highlightRanges(tool.name, debounced);
                return (
                  <li key={tool.id}>
                    <button
                      type="button"
                      data-active={active}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => select(tool)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                        active ? "bg-slate-100 dark:bg-slate-800" : ""
                      }`}
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-brand-600 dark:bg-slate-800 dark:text-brand-300">
                        <Icon name={tool.icon} className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          {parts.map((part, partIndex) =>
                            part.match ? (
                              <mark
                                key={partIndex}
                                className="bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-200"
                              >
                                {part.text}
                              </mark>
                            ) : (
                              <span key={partIndex}>{part.text}</span>
                            ),
                          )}
                        </span>
                        <span className="block truncate text-xs muted">
                          {getCategory(tool.category)?.name}
                        </span>
                      </span>
                      {active ? (
                        <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      ) : (
                        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-300 dark:text-slate-600" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/80 px-4 py-2.5 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-400">
          <span className="hidden sm:inline">
            <kbd className="rounded border border-slate-300 bg-white px-1.5 py-0.5 font-sans dark:border-slate-700 dark:bg-slate-800">
              ↑↓
            </kbd>{" "}
            to navigate
          </span>
          <span className="ml-auto">
            {results.length} {results.length === 1 ? "result" : "results"}
          </span>
        </div>
      </div>
    </div>
  );
}
