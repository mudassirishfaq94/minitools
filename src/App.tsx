import { useEffect, useMemo, type ReactNode } from "react";
import { Layout } from "@/components/layout/Layout";
import { ThemeProvider } from "@/hooks/useTheme";
import { useHashRoute } from "@/hooks/useHashRoute";
import { AboutPage } from "@/pages/AboutPage";
import { CategoryPage } from "@/pages/CategoryPage";
import { FavoritesPage } from "@/pages/FavoritesPage";
import { HomePage } from "@/pages/HomePage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { ToolPage } from "@/pages/ToolPage";
import { ToolsPage } from "@/pages/ToolsPage";
import { availableTools, categories, getCategory } from "@/data/catalog";
import { buildFaqs, buildHowTo, buildMetaDescription } from "@/data/toolContent";
import { getTool } from "@/tools/registry";
import {
  SITE_NAME,
  applySeo,
  breadcrumbSchema,
  clampDescription,
  faqSchema,
  howToSchema,
  softwareSchema,
  type SeoData,
} from "@/utils/seo";

/** Resolves the full metadata payload for the active route. */
function useRouteSeo(route: ReturnType<typeof useHashRoute>): {
  seo: SeoData;
  content: ReactNode;
} {
  return useMemo(() => {
    switch (route.name) {
      case "tools":
        return {
          content: <ToolsPage />,
          seo: {
            title: `All ${availableTools.length} Tools · ${SITE_NAME}`,
            description: clampDescription(
              `Browse all ${availableTools.length} free online tools across ${categories.length} categories — converters, calculators, text utilities, developer tools, generators and image tools. No sign-up required.`,
            ),
            path: "/tools",
            structuredData: [
              breadcrumbSchema([
                { name: "Home", path: "/" },
                { name: "All tools", path: "/tools" },
              ]),
              {
                "@context": "https://schema.org",
                "@type": "CollectionPage",
                name: "All tools",
                numberOfItems: availableTools.length,
              },
            ],
          },
        };

      case "category": {
        const category = getCategory(route.category ?? "");
        const count = availableTools.filter(
          (tool) => tool.category === route.category,
        ).length;

        if (!category) {
          return {
            content: <CategoryPage categoryId={route.category ?? ""} />,
            seo: {
              title: `Category not found · ${SITE_NAME}`,
              description: "That tool category does not exist. Browse all available tools instead.",
              path: route.path,
            },
          };
        }

        return {
          content: <CategoryPage categoryId={category.id} />,
          seo: {
            title: `${category.name} — ${count} Free Online Tools · ${SITE_NAME}`,
            description: clampDescription(`${category.description} All ${count} tools are free and run in your browser.`),
            path: category.route,
            keywords: [category.name.toLowerCase(), "free online tools", category.tagline],
            structuredData: breadcrumbSchema([
              { name: "Home", path: "/" },
              { name: "Tools", path: "/tools" },
              { name: category.name, path: category.route },
            ]),
          },
        };
      }

      case "tool": {
        const tool = getTool(route.slug ?? "");

        if (!tool) {
          return {
            content: <ToolPage slug={route.slug ?? ""} />,
            seo: {
              title: `Tool not found · ${SITE_NAME}`,
              description: "That tool does not exist. Browse the full collection of free online tools.",
              path: route.path,
            },
          };
        }

        const category = getCategory(tool.category);
        const description = clampDescription(buildMetaDescription(tool));

        return {
          content: <ToolPage slug={tool.slug} />,
          seo: {
            title: `${tool.name} — Free Online Tool · ${SITE_NAME}`,
            description,
            path: tool.route,
            keywords: [tool.name.toLowerCase(), ...tool.keywords, "free", "online", "browser"],
            structuredData: [
              softwareSchema({
                name: tool.name,
                description,
                path: tool.route,
                category: category?.name ?? "Tools",
              }),
              breadcrumbSchema([
                { name: "Home", path: "/" },
                { name: "Tools", path: "/tools" },
                ...(category ? [{ name: category.name, path: category.route }] : []),
                { name: tool.name, path: tool.route },
              ]),
              howToSchema(`How to use ${tool.name}`, buildHowTo(tool)),
              faqSchema(buildFaqs(tool)),
            ],
          },
        };
      }

      case "favorites":
        return {
          content: <FavoritesPage />,
          seo: {
            title: `Your Favorites & Recent Tools · ${SITE_NAME}`,
            description:
              "Your starred tools and recent activity, saved locally in this browser. No account needed.",
            path: "/favorites",
          },
        };

      case "about":
        return {
          content: <AboutPage />,
          seo: {
            title: `About · ${SITE_NAME}`,
            description: clampDescription(
              `Toolstack is a collection of ${availableTools.length} privacy-first micro-tools that run entirely in your browser. No backend, no tracking, no sign-up.`,
            ),
            path: "/about",
            structuredData: breadcrumbSchema([
              { name: "Home", path: "/" },
              { name: "About", path: "/about" },
            ]),
          },
        };

      case "home":
        return {
          content: <HomePage />,
          seo: {
            title: `${SITE_NAME} — ${availableTools.length} Free Online Mini Tools`,
            description: clampDescription(
              `${availableTools.length} fast, free browser tools: unit converters, calculators, text utilities, JSON and regex tools, generators and image editors. Everything runs locally — no uploads, no sign-up.`,
            ),
            path: "/",
            structuredData: {
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: SITE_NAME,
              description: `${availableTools.length} free online mini tools that run in your browser.`,
            },
          },
        };

      default:
        return {
          content: <NotFoundPage />,
          seo: {
            title: `Page not found · ${SITE_NAME}`,
            description: "That page does not exist. Browse the full collection of free online tools.",
            path: route.path,
          },
        };
    }
  }, [route.name, route.category, route.slug, route.path]);
}

function Router() {
  const route = useHashRoute();
  const { seo, content } = useRouteSeo(route);

  useEffect(() => {
    applySeo(seo);
  }, [seo]);

  return <Layout path={route.path}>{content}</Layout>;
}

export default function App() {
  return (
    <ThemeProvider>
      <Router />
    </ThemeProvider>
  );
}
