import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DIST = join(ROOT, "dist");
const SITE_URL = process.env.SITE_URL || "https://mudassirishfaq94.github.io/minitools";

// Import catalog data (Node 24 strips TypeScript type-only imports)
let categories, toolMetas;
try {
  ({ categories } = await import("../src/data/categories.ts"));
  ({ toolMetas } = await import("../src/data/tools.ts"));
} catch (e) {
  console.error("Failed to import catalog data:", e.message);
  process.exit(1);
}

const SITE_NAME = "Toolstack";

function clampDescription(text, max = 158) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : max).replace(/[,.;:]$/, "")}…`;
}

function absoluteUrl(path) {
  const clean = path === "/" ? "" : path;
  return `${SITE_URL}${clean}#${clean || "/"}`;
}

function canonicalUrl(path) {
  const clean = path === "/" ? "" : path;
  return `${SITE_URL}${clean}`;
}

function categoryLabel(id) {
  return categories.find((c) => c.id === id)?.name ?? "Tools";
}

function buildMetaDescription(tool) {
  return `${tool.description} Free ${categoryLabel(tool.category).toLowerCase()} that runs entirely in your browser — no sign-up, no uploads.`;
}

/* ─── Route Data ─────────────────────────────────────────────────── */

const routes = [];

// Home
routes.push({
  path: "/",
  title: `${SITE_NAME} — ${toolMetas.length} Free Online Mini Tools`,
  description: clampDescription(
    `${toolMetas.length} fast, free browser tools: unit converters, calculators, text utilities, JSON and regex tools, generators and image editors. Everything runs locally — no uploads, no sign-up.`,
  ),
  keywords: ["free online tools", "mini tools", "converters", "calculators", "text utilities"],
  structuredData: {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    description: `${toolMetas.length} free online mini tools that run in your browser.`,
    url: canonicalUrl("/"),
  },
});

// All tools
routes.push({
  path: "/tools",
  title: `All ${toolMetas.length} Tools · ${SITE_NAME}`,
  description: clampDescription(
    `Browse all ${toolMetas.length} free online tools across ${categories.length} categories — converters, calculators, text utilities, developer tools, generators and image tools. No sign-up required.`,
  ),
  keywords: ["all tools", "free online tools", "browser utilities"],
  structuredData: [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
        { "@type": "ListItem", position: 2, name: "All tools", item: absoluteUrl("/tools") },
      ],
    },
    { "@context": "https://schema.org", "@type": "CollectionPage", name: "All tools", numberOfItems: toolMetas.length },
  ],
});

// Favorites
routes.push({
  path: "/favorites",
  title: `Your Favorites & Recent Tools · ${SITE_NAME}`,
  description: "Your starred tools and recent activity, saved locally in this browser. No account needed.",
  keywords: ["favorites", "recent tools", "bookmarks"],
  structuredData: null,
});

// About
routes.push({
  path: "/about",
  title: `About · ${SITE_NAME}`,
  description: clampDescription(
    `Toolstack is a collection of ${toolMetas.length} privacy-first micro-tools that run entirely in your browser. No backend, no tracking, no sign-up.`,
  ),
  keywords: ["about", "privacy", "free tools"],
  structuredData: {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "About", item: absoluteUrl("/about") },
    ],
  },
});

// Categories
for (const category of categories) {
  const count = toolMetas.filter((tool) => tool.category === category.id).length;
  routes.push({
    path: category.route,
    title: `${category.name} — ${count} Free Online Tools · ${SITE_NAME}`,
    description: clampDescription(`${category.description} All ${count} tools are free and run in your browser.`),
    keywords: [category.name.toLowerCase(), "free online tools", category.tagline],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
        { "@type": "ListItem", position: 2, name: "Tools", item: absoluteUrl("/tools") },
        { "@type": "ListItem", position: 3, name: category.name, item: absoluteUrl(category.route) },
      ],
    },
  });
}

// Tools
for (const tool of toolMetas) {
  const cat = categories.find((c) => c.id === tool.category);
  const description = clampDescription(buildMetaDescription(tool));
  const breadcrumb = [
    { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
    { "@type": "ListItem", position: 2, name: "Tools", item: absoluteUrl("/tools") },
    ...(cat ? [{ "@type": "ListItem", position: 3, name: cat.name, item: absoluteUrl(cat.route) }] : []),
    { "@type": "ListItem", position: cat ? 4 : 3, name: tool.name, item: absoluteUrl(tool.route) },
  ];
  routes.push({
    path: tool.route,
    title: `${tool.name} — Free Online Tool · ${SITE_NAME}`,
    description,
    keywords: [tool.name.toLowerCase(), ...tool.keywords, "free", "online", "browser"],
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: tool.name,
        description,
        url: absoluteUrl(tool.route),
        applicationCategory: "UtilitiesApplication",
        applicationSubCategory: cat?.name ?? "Tools",
        operatingSystem: "Any",
        browserRequirements: "Requires JavaScript",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        isAccessibleForFree: true,
      },
      { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: breadcrumb },
    ],
  });
}

/* ─── HTML Shell Generator ──────────────────────────────────────── */

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function generateShell(route) {
  const url = canonicalUrl(route.path);
  const hashRoute = route.path === "/" ? "/" : route.path;
  const depth = route.path.split("/").filter(Boolean).length;
  const redirectPrefix = depth === 0 ? "." : "../".repeat(depth);
  const redirectTarget = `${redirectPrefix}index.html#${hashRoute}`;

  const keywords = route.keywords?.join(", ") ?? "";
  const jsonLd = route.structuredData ? escapeHtml(JSON.stringify(route.structuredData)) : "";

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(route.title)}</title>
  <meta name="description" content="${escapeHtml(route.description)}" />
  <meta name="robots" content="index, follow" />
  <meta name="color-scheme" content="light dark" />
  <meta name="theme-color" content="#4f46e5" />
  <link rel="canonical" href="${escapeHtml(url)}" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${escapeHtml(route.title)}" />
  <meta property="og:description" content="${escapeHtml(route.description)}" />
  <meta property="og:url" content="${escapeHtml(url)}" />
  <meta property="og:site_name" content="${SITE_NAME}" />
  <meta property="og:image" content="${SITE_URL}/og-image.png" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(route.title)}" />
  <meta name="twitter:description" content="${escapeHtml(route.description)}" />
  ${keywords ? `<meta name="keywords" content="${escapeHtml(keywords)}" />` : ""}
  <link rel="icon" href="${redirectPrefix}favicon.svg" type="image/svg+xml" />
  <link rel="apple-touch-icon" href="${redirectPrefix}apple-touch-icon.png" />
  ${jsonLd ? `<script type="application/ld+json">${jsonLd}</script>` : ""}
  <meta http-equiv="content-security-policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self'; base-uri 'self'; form-action 'self'" />
</head>
<body>
  <div style="max-width:42rem;margin:4rem auto;padding:0 1.5rem;font-family:system-ui,sans-serif;line-height:1.6">
    <h1 style="font-size:1.75rem;font-weight:700;margin-bottom:0.5rem">${escapeHtml(route.title.replace(` · ${SITE_NAME}`, ""))}</h1>
    <p>${escapeHtml(route.description)}</p>
    <hr style="margin:2rem 0;border:none;border-top:1px solid #e2e8f0" />
    <p style="color:#64748b">This page requires JavaScript to load the interactive tool. <a href="${escapeHtml(redirectTarget)}">Click here</a> to continue to the app.</p>
  </div>
  <script>location.replace("${escapeHtml(redirectTarget)}");</script>
</body>
</html>`;
}

/* ─── Main ───────────────────────────────────────────────────────── */

console.log(`Prerendering ${routes.length} routes for ${SITE_URL}...`);

// The real single-file app lives at dist/index.html and serves the home
// route — it must never be replaced by a redirect shell. Only sub-routes
// get static SEO shells.
if (!existsSync(join(DIST, "index.html"))) {
  console.error("dist/index.html not found — run `npm run build` first.");
  process.exit(1);
}

for (const route of routes) {
  if (route.path === "/") continue;
  const html = generateShell(route);
  const outPath = join(DIST, route.path.slice(1), "index.html");
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, html, "utf-8");
  console.log(`  ✓ ${route.path}`);
}

/* ─── Sitemap ────────────────────────────────────────────────────── */

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (route) => `  <url>
    <loc>${escapeHtml(canonicalUrl(route.path))}</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>${route.path === "/" ? "weekly" : "monthly"}</changefreq>
  </url>`,
  )
  .join("\n")}
</urlset>`;

writeFileSync(join(DIST, "sitemap.xml"), sitemap, "utf-8");
console.log(`  ✓ sitemap.xml (${routes.length} URLs)`);

/* ─── Robots.txt ─────────────────────────────────────────────────── */

const robots = `User-agent: *
Allow: /
Sitemap: ${SITE_URL}/sitemap.xml
`;

writeFileSync(join(DIST, "robots.txt"), robots, "utf-8");
console.log("  ✓ robots.txt");

/* ─── Summary ────────────────────────────────────────────────────── */

console.log(`\nDone — ${routes.length} HTML shells, sitemap.xml, robots.txt`);