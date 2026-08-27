import type { ComponentType } from "react";

export * from "./units";

/** Name of an icon resolved through the icon registry (src/components/ui/Icon.tsx). */
export type IconName = string;

export type ToolCategoryId =
  | "converters"
  | "calculators"
  | "text"
  | "developer"
  | "generators"
  | "image";

export type ToolBadge = "new" | "popular" | "updated";

export interface Category {
  id: ToolCategoryId;
  name: string;
  tagline: string;
  description: string;
  icon: IconName;
  /** Hash route for the category listing, e.g. "/tools/converters". */
  route: string;
  /** Tailwind gradient classes used for the category accent. */
  accent: string;
  /** Tailwind classes for the soft icon chip. */
  chip: string;
  /** Category is planned but has no shipped tools yet. */
  comingSoon?: boolean;
}

export interface ToolMeta {
  /** Stable unique id. */
  id: string;
  /** URL segment used by the router. */
  slug: string;
  name: string;
  description: string;
  category: ToolCategoryId;
  icon: IconName;
  /** Full hash route to the tool, e.g. "/tool/word-counter". */
  route: string;
  /** Extra search terms (aliases, synonyms, typos...). */
  keywords: string[];
  featured?: boolean;
  badge?: ToolBadge;
}

export interface ToolDefinition extends ToolMeta {
  /** The actual, fully working tool implementation. */
  component: ComponentType;
}

export type Theme = "light" | "dark";

export interface Route {
  /** Normalized path, e.g. "/tool/word-counter" */
  path: string;
  /** Raw hash without the leading "#". */
  hash: string;
}

export type SortKey = "popular" | "name" | "category";
