import { categories, getCategory } from "@/data/categories";
import { tools } from "@/tools/registry";
import { filterTools } from "@/utils/search";
import type { Category, ToolCategoryId, ToolMeta } from "@/types";

/**
 * Catalog selectors — the single data-access layer for the tool system.
 *
 * Pages and components read from here instead of reaching into
 * `data/categories`, `data/tools` and `tools/registry` separately.
 * Contains no JSX and no UI concerns.
 */

/** Every tool that actually has an implementation attached. */
export const availableTools: ToolMeta[] = tools;

/** Hand-picked tools surfaced on the homepage and in the empty command palette. */
export const featuredTools: ToolMeta[] = tools.filter((tool) => tool.featured);

export interface CategoryGroup {
  category: Category;
  tools: ToolMeta[];
}

export interface CategoryWithCount {
  category: Category;
  count: number;
  available: boolean;
}

/** Counts tools per category id, plus an `all` total. */
export function countByCategory(list: ToolMeta[] = availableTools): Record<string, number> {
  const counts: Record<string, number> = { all: list.length };
  for (const category of categories) counts[category.id] = 0;
  for (const tool of list) counts[tool.category] = (counts[tool.category] ?? 0) + 1;
  return counts;
}

/** Categories paired with how many tools each currently ships. */
export function categoriesWithCounts(
  list: ToolMeta[] = availableTools,
): CategoryWithCount[] {
  const counts = countByCategory(list);
  return categories.map((category) => ({
    category,
    count: counts[category.id] ?? 0,
    available: (counts[category.id] ?? 0) > 0,
  }));
}

/** Groups tools under their category, preserving the canonical category order. */
export function groupToolsByCategory(list: ToolMeta[] = availableTools): CategoryGroup[] {
  return categories
    .map((category) => ({
      category,
      tools: list.filter((tool) => tool.category === category.id),
    }))
    .filter((group) => group.tools.length > 0);
}

export function toolsInCategory(categoryId: ToolCategoryId | string): ToolMeta[] {
  return availableTools.filter((tool) => tool.category === categoryId);
}

export function isCategoryAvailable(categoryId: ToolCategoryId | string): boolean {
  return availableTools.some((tool) => tool.category === categoryId);
}

/** Category ids that have at least one shipped tool. */
export function activeCategories(): Category[] {
  return categories.filter((category) => isCategoryAvailable(category.id));
}

/** Per-category counts for a search query, ignoring any active category chip. */
export function countsForQuery(
  query: string,
  list: ToolMeta[] = availableTools,
): Record<string, number> {
  return countByCategory(filterTools(list, { query }));
}

/**
 * Related tools, scored automatically from catalog data.
 *
 * Same-category tools rank highest, then tools sharing keywords — which is how
 * cross-category pairs like "Base64 Encoder" and "Hash Generator" surface for
 * each other. Falls back to featured tools so the section is never empty and
 * nothing has to be curated by hand.
 */
export function relatedTools(tool: ToolMeta, limit = 4): ToolMeta[] {
  const ownKeywords = new Set(tool.keywords.map((keyword) => keyword.toLowerCase()));

  const scored = availableTools
    .filter((item) => item.id !== tool.id)
    .map((item) => {
      let score = 0;
      if (item.category === tool.category) score += 100;

      for (const keyword of item.keywords) {
        if (ownKeywords.has(keyword.toLowerCase())) score += 12;
      }

      // Nudge well-known tools up when scores are otherwise tied.
      if (item.featured) score += 3;
      if (item.badge === "popular") score += 2;

      return { item, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name));

  const results = scored.slice(0, limit).map((entry) => entry.item);

  // Top up with featured tools if this tool is unusually isolated.
  if (results.length < limit) {
    const chosen = new Set([tool.id, ...results.map((item) => item.id)]);
    for (const candidate of availableTools) {
      if (results.length >= limit) break;
      if (chosen.has(candidate.id) || !candidate.featured) continue;
      results.push(candidate);
      chosen.add(candidate.id);
    }
  }

  return results;
}

const bySlug = new Map<string, ToolMeta>(availableTools.map((tool) => [tool.slug, tool]));

export function findToolBySlug(slug: string): ToolMeta | undefined {
  return bySlug.get(slug);
}

/**
 * Resolves stored slugs into tools, preserving the given order and silently
 * dropping any slug whose tool no longer exists (renamed or removed).
 *
 * De-duplicates, because callers legitimately concatenate lists that can
 * overlap — a tool may be both favorited and recently used, and rendering it
 * twice would produce duplicate React keys.
 */
export function resolveSlugs(slugs: string[]): ToolMeta[] {
  const resolved: ToolMeta[] = [];
  const seen = new Set<string>();
  for (const slug of slugs) {
    if (seen.has(slug)) continue;
    const tool = bySlug.get(slug);
    if (!tool) continue;
    seen.add(slug);
    resolved.push(tool);
  }
  return resolved;
}

/** Slugs that no longer map to a real tool — used to prune stored lists. */
export function findStaleSlugs(slugs: string[]): string[] {
  return slugs.filter((slug) => !bySlug.has(slug));
}

export { categories, getCategory };
