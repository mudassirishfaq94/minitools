import { categoryLabel } from "@/data/categories";
import type { ToolMeta } from "@/types";

/** Lowercase, accent-free, trimmed text used for all matching. */
export function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/** True when every character of `needle` appears in order inside `haystack`. */
export function fuzzyMatch(needle: string, haystack: string): boolean {
  let i = 0;
  for (let j = 0; j < haystack.length && i < needle.length; j++) {
    if (haystack[j] === needle[i]) i++;
  }
  return i === needle.length;
}

/**
 * Relevance score for a tool against a query.
 * 0 means "no match" and the tool is filtered out.
 */
export function scoreTool(tool: ToolMeta, rawQuery: string): number {
  const query = normalize(rawQuery);
  if (!query) return 1;

  const name = normalize(tool.name);
  const description = normalize(tool.description);
  // Match both the id ("developer") and the display name ("Developer Tools").
  const category = `${normalize(tool.category)} ${normalize(categoryLabel(tool.category))}`;
  const keywords = tool.keywords.map(normalize);
  const haystack = [name, description, category, ...keywords].join(" ");

  if (name === query) return 1000;
  if (name.startsWith(query)) return 600;

  const words = query.split(/\s+/);
  if (name.includes(query)) return 400;
  if (keywords.some((keyword) => keyword.startsWith(query))) return 260;
  if (keywords.some((keyword) => keyword.includes(query))) return 200;
  if (description.includes(query)) return 140;
  if (category.includes(query)) return 110;
  if (words.length > 1 && words.every((word) => haystack.includes(word))) return 90;
  if (fuzzyMatch(query.replace(/\s+/g, ""), name.replace(/\s+/g, ""))) return 40;

  return 0;
}

export interface ToolFilter {
  query?: string;
  category?: string | null;
}

export function matchesCategory(tool: ToolMeta, category?: string | null): boolean {
  return !category || category === "all" || tool.category === category;
}

/** Filter + rank tools. Stable: ties fall back to alphabetical order. */
export function filterTools<T extends ToolMeta>(
  tools: T[],
  { query = "", category = null }: ToolFilter = {},
): T[] {
  const hasQuery = query.trim().length > 0;

  return tools
    .map((tool) => ({ tool, score: scoreTool(tool, query) }))
    .filter(({ tool, score }) => score > 0 && matchesCategory(tool, category))
    .sort((a, b) => {
      // Without a query keep a predictable alphabetical listing.
      if (!hasQuery) return a.tool.name.localeCompare(b.tool.name);
      if (b.score !== a.score) return b.score - a.score;
      if (a.tool.featured !== b.tool.featured) return a.tool.featured ? -1 : 1;
      return a.tool.name.localeCompare(b.tool.name);
    })
    .map(({ tool }) => tool);
}

/** Highlight ranges of `query` inside `text` for rendering <mark>-style output. */
export function highlightRanges(
  text: string,
  rawQuery: string,
): { text: string; match: boolean }[] {
  const query = normalize(rawQuery).trim();
  if (!query) return [{ text, match: false }];

  const lower = text.toLowerCase();
  const parts: { text: string; match: boolean }[] = [];
  let cursor = 0;

  while (cursor < text.length) {
    const index = lower.indexOf(query, cursor);
    if (index === -1) {
      parts.push({ text: text.slice(cursor), match: false });
      break;
    }
    if (index > cursor) parts.push({ text: text.slice(cursor, index), match: false });
    parts.push({ text: text.slice(index, index + query.length), match: true });
    cursor = index + query.length;
  }

  return parts.length ? parts : [{ text, match: false }];
}
