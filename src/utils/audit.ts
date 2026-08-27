/**
 * Project integrity audit.
 *
 * These checks catch the class of bug that fails silently rather than
 * throwing: a tool whose component was never registered simply disappears
 * from the catalog, and a mistyped icon name quietly renders a generic star.
 * Both look fine in a screenshot, so they are asserted here instead.
 *
 * Runs in development only, alongside the calculation self-test.
 */

import { hasIcon } from "@/components/ui/Icon";
import { categories } from "@/data/categories";
import { toolMetas } from "@/data/tools";
import { availableTools, relatedTools } from "@/data/catalog";
import { unitCategories } from "@/data/units";
import { tools as registeredTools } from "@/tools/registry";
import { buildFaqs, buildHowTo, buildIntro } from "@/data/toolContent";
import { parseRoute } from "@/utils/router";
import { validateUnitData } from "@/utils/units";

export interface AuditIssue {
  area: string;
  detail: string;
}

export function runProjectAudit(): AuditIssue[] {
  const issues: AuditIssue[] = [];
  const add = (area: string, detail: string) => issues.push({ area, detail });

  /* ------------------------------------------------- catalog integrity */

  // A tool present in data but missing from the registry is filtered out
  // silently, so it would vanish from the site with no error.
  const registeredIds = new Set(registeredTools.map((tool) => tool.id));
  for (const meta of toolMetas) {
    if (!registeredIds.has(meta.id)) {
      add("registry", `"${meta.id}" has catalog data but no registered component`);
    }
  }

  // Duplicate ids or slugs would make routing ambiguous.
  const ids = new Set<string>();
  const slugs = new Set<string>();
  for (const meta of toolMetas) {
    if (ids.has(meta.id)) add("catalog", `duplicate tool id "${meta.id}"`);
    ids.add(meta.id);
    if (slugs.has(meta.slug)) add("catalog", `duplicate slug "${meta.slug}"`);
    slugs.add(meta.slug);
  }

  // Required fields must be present and non-empty.
  for (const meta of toolMetas) {
    if (!meta.name.trim()) add("catalog", `"${meta.id}" has no name`);
    if (!meta.description.trim()) add("catalog", `"${meta.id}" has no description`);
    if (!meta.keywords.length) add("catalog", `"${meta.id}" has no keywords`);
    if (meta.route !== `/tool/${meta.slug}`) {
      add("catalog", `"${meta.id}" route "${meta.route}" does not match its slug`);
    }
    if (!categories.some((category) => category.id === meta.category)) {
      add("catalog", `"${meta.id}" points at unknown category "${meta.category}"`);
    }
  }

  /* ------------------------------------------------------------ icons */

  for (const meta of toolMetas) {
    if (!hasIcon(meta.icon)) {
      add("icons", `tool "${meta.id}" uses unregistered icon "${meta.icon}"`);
    }
  }
  for (const category of categories) {
    if (!hasIcon(category.icon)) {
      add("icons", `category "${category.id}" uses unregistered icon "${category.icon}"`);
    }
  }
  for (const category of unitCategories) {
    if (!hasIcon(category.icon)) {
      add("icons", `unit category "${category.id}" uses unregistered icon "${category.icon}"`);
    }
  }

  /* ----------------------------------------------------------- routes */

  for (const meta of toolMetas) {
    const parsed = parseRoute(meta.route);
    if (parsed.name !== "tool" || parsed.slug !== meta.slug) {
      add("routes", `"${meta.route}" does not resolve back to tool "${meta.id}"`);
    }
  }
  for (const category of categories) {
    const parsed = parseRoute(category.route);
    if (parsed.name !== "category" || parsed.category !== category.id) {
      add("routes", `"${category.route}" does not resolve back to category "${category.id}"`);
    }
  }
  for (const path of ["/", "/tools", "/favorites", "/about"]) {
    if (parseRoute(path).name === "not-found") {
      add("routes", `static route "${path}" resolves to not-found`);
    }
  }

  /* --------------------------------------------------------- category */

  for (const category of categories) {
    const count = availableTools.filter((tool) => tool.category === category.id).length;
    if (count === 0 && !category.comingSoon) {
      add(
        "categories",
        `"${category.id}" has no tools but is not marked comingSoon — it will render an empty page`,
      );
    }
    if (count > 0 && category.comingSoon) {
      add("categories", `"${category.id}" has ${count} tools but is still marked comingSoon`);
    }
  }

  /* ---------------------------------------------------------- content */

  for (const tool of availableTools) {
    if (buildHowTo(tool).length < 3) add("content", `"${tool.id}" has fewer than 3 how-to steps`);
    if (buildFaqs(tool).length < 3) add("content", `"${tool.id}" has fewer than 3 FAQ entries`);
    if (!buildIntro(tool).trim()) add("content", `"${tool.id}" has no intro paragraph`);

    const related = relatedTools(tool);
    if (related.length === 0) add("content", `"${tool.id}" has no related tools`);
    if (related.some((item) => item.id === tool.id)) {
      add("content", `"${tool.id}" lists itself as related`);
    }
  }

  /* ------------------------------------------------------------ units */

  for (const problem of validateUnitData()) {
    add("units", problem);
  }

  return issues;
}

/** Logs the audit result to the console. */
export function reportProjectAudit() {
  const issues = runProjectAudit();

  if (issues.length === 0) {
    console.info(
      `✅ Project audit: ${toolMetas.length} tools, ${categories.length} categories, ${unitCategories.length} unit groups — no issues.`,
    );
  } else {
    console.error(`❌ Project audit found ${issues.length} issue(s).`);
    console.table(issues);
  }

  return issues;
}
