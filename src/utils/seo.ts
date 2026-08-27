/**
 * Document metadata management.
 *
 * The app is a single-page build, so meta tags are written imperatively on
 * navigation. Tags are reused rather than recreated, and structured data is
 * kept in one script node that is replaced wholesale.
 */

export const SITE_NAME = "Toolstack";
export const SITE_TAGLINE = "Free online mini tools";

export interface SeoData {
  /** Full <title>, already including the site name. */
  title: string;
  description: string;
  /** Route path such as "/tool/word-counter". */
  path: string;
  /** JSON-LD structured data for this page. */
  structuredData?: Record<string, unknown> | Record<string, unknown>[];
  /** Comma-separated keywords. */
  keywords?: string[];
}

/** Absolute URL for a hash route, based on wherever the app is deployed. */
export function absoluteUrl(path: string): string {
  if (typeof window === "undefined") return path;
  const { origin, pathname } = window.location;
  const clean = path === "/" ? "" : path;
  return `${origin}${pathname}#${clean || "/"}`;
}

function upsertMeta(selector: string, attribute: "name" | "property", key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function upsertLink(rel: string, href: string) {
  let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    document.head.appendChild(element);
  }
  element.setAttribute("href", href);
}

const STRUCTURED_DATA_ID = "toolstack-structured-data";

function setStructuredData(data: SeoData["structuredData"]) {
  const existing = document.getElementById(STRUCTURED_DATA_ID);
  if (!data) {
    existing?.remove();
    return;
  }

  const script = existing ?? document.createElement("script");
  script.id = STRUCTURED_DATA_ID;
  script.setAttribute("type", "application/ld+json");
  script.textContent = JSON.stringify(data);
  if (!existing) document.head.appendChild(script);
}

/** Applies every metadata tag for the current page. */
export function applySeo({ title, description, path, structuredData, keywords }: SeoData) {
  if (typeof document === "undefined") return;

  const url = absoluteUrl(path);

  document.title = title;
  upsertMeta('meta[name="description"]', "name", "description", description);
  if (keywords?.length) {
    upsertMeta('meta[name="keywords"]', "name", "keywords", keywords.join(", "));
  }

  // Open Graph — used by social previews and some crawlers.
  upsertMeta('meta[property="og:title"]', "property", "og:title", title);
  upsertMeta('meta[property="og:description"]', "property", "og:description", description);
  upsertMeta('meta[property="og:type"]', "property", "og:type", "website");
  upsertMeta('meta[property="og:url"]', "property", "og:url", url);
  upsertMeta('meta[property="og:site_name"]', "property", "og:site_name", SITE_NAME);

  upsertMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
  upsertMeta('meta[name="twitter:title"]', "name", "twitter:title", title);
  upsertMeta('meta[name="twitter:description"]', "name", "twitter:description", description);

  upsertLink("canonical", url);
  setStructuredData(structuredData);
}

/** Breadcrumb structured data, built from a trail of label/path pairs. */
export function breadcrumbSchema(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/** Schema.org WebApplication entry for a single tool. */
export function softwareSchema(options: {
  name: string;
  description: string;
  path: string;
  category: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: options.name,
    description: options.description,
    url: absoluteUrl(options.path),
    applicationCategory: "UtilitiesApplication",
    applicationSubCategory: options.category,
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    isAccessibleForFree: true,
  };
}

/** FAQPage structured data — eligible for rich results. */
export function faqSchema(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

/** HowTo structured data from an ordered list of steps. */
export function howToSchema(name: string, steps: { title: string; body: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    step: steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.title,
      text: step.body,
    })),
  };
}

/**
 * Trims a description to a search-friendly length without cutting mid-word.
 * Around 155 characters is what most engines display.
 */
export function clampDescription(text: string, max = 158): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : max).replace(/[,.;:]$/, "")}…`;
}
