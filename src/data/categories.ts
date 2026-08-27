import type { Category, ToolCategoryId } from "@/types";

/**
 * Centralized category registry.
 * Every listing, filter, menu and footer link is generated from this array —
 * adding a category here makes it appear everywhere automatically.
 */
export const categories: Category[] = [
  {
    id: "converters",
    name: "Converters",
    tagline: "Change one format into another",
    description:
      "Units, encodings, colors and timestamps — translate values between formats without leaving the page.",
    icon: "ArrowUpDown",
    route: "/tools/converters",
    accent: "from-emerald-500 to-teal-500",
    chip: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
  },
  {
    id: "calculators",
    name: "Calculators",
    tagline: "Quick, precise math",
    description:
      "Percentages, dates and everyday numbers worked out instantly, with the formula always visible.",
    icon: "Calculator",
    route: "/tools/calculators",
    accent: "from-amber-500 to-orange-500",
    chip: "bg-amber-500/10 text-amber-600 dark:text-amber-300",
  },
  {
    id: "text",
    name: "Text Tools",
    tagline: "Clean, count & reshape text",
    description:
      "Counters, case converters and formatting helpers for writing, editing and content work.",
    icon: "Type",
    route: "/tools/text",
    accent: "from-violet-500 to-indigo-500",
    chip: "bg-violet-500/10 text-violet-600 dark:text-violet-300",
  },
  {
    id: "developer",
    name: "Developer Tools",
    tagline: "Everyday dev utilities",
    description:
      "JSON formatting, regex testing and hashing — built for fast debugging and inspection.",
    icon: "Code",
    route: "/tools/developer",
    accent: "from-sky-500 to-cyan-500",
    chip: "bg-sky-500/10 text-sky-600 dark:text-sky-300",
  },
  {
    id: "generators",
    name: "Generators",
    tagline: "Create data on demand",
    description:
      "Passwords, UUIDs, slugs and placeholder copy generated locally with secure randomness.",
    icon: "WandSparkles",
    route: "/tools/generators",
    accent: "from-fuchsia-500 to-pink-500",
    chip: "bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-300",
  },
  {
    id: "image",
    name: "Image Tools",
    tagline: "Compress, convert & resize",
    description:
      "Compress, convert and resize images entirely in your browser — nothing is ever uploaded.",
    icon: "Image",
    route: "/tools/image",
    accent: "from-rose-500 to-orange-500",
    chip: "bg-rose-500/10 text-rose-600 dark:text-rose-300",
  },
];

const categoryMap = new Map<ToolCategoryId, Category>(
  categories.map((category) => [category.id, category]),
);

export function getCategory(id: ToolCategoryId | string): Category | undefined {
  return categoryMap.get(id as ToolCategoryId);
}

export function categoryLabel(id: ToolCategoryId | string): string {
  return getCategory(id)?.name ?? "Other";
}

export function categoryRoute(id: ToolCategoryId | string): string {
  return getCategory(id)?.route ?? "/tools";
}
