import { useState } from "react";
import { ArrowRight, Command, Cpu, Gauge, Keyboard, Search, Sparkles, Zap } from "lucide-react";
import { Container, SectionHeading } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { CategoryCard } from "@/components/tools/CategoryCard";
import { PersonalSection } from "@/components/tools/PersonalSection";
import { ToolCard } from "@/components/tools/ToolCard";
import { SearchDialog } from "@/components/search/SearchDialog";
import {
  availableTools as tools,
  categoriesWithCounts,
  featuredTools,
} from "@/data/catalog";
import { categories } from "@/data/categories";
import { formatNumber } from "@/utils/format";
import { href } from "@/utils/router";

const highlights = [
  {
    icon: Zap,
    title: "Instant, no setup",
    description:
      "Every tool runs the moment you open it. No sign-up, no configuration, no loading screens.",
  },
  {
    icon: Cpu,
    title: "Runs in your browser",
    description:
      "All processing happens locally with Web APIs — your text and files never leave the device.",
  },
  {
    icon: Keyboard,
    title: "Keyboard friendly",
    description:
      "Press ⌘K (or Ctrl+K) anywhere to search the whole catalog and jump straight to a tool.",
  },
  {
    icon: Gauge,
    title: "Designed for focus",
    description:
      "Clean, distraction-free layouts that work just as well on a phone as on a 27-inch display.",
  },
];

export function HomePage() {
  const [searchOpen, setSearchOpen] = useState(false);

  const stats = [
    { label: "Tools", value: formatNumber(tools.length) },
    { label: "Categories", value: formatNumber(categories.length) },
    { label: "Data uploaded", value: "0 KB" },
    { label: "Sign-ups", value: "None" },
  ];

  return (
    <>
      {/* ------------------------------------------------------------ hero */}
      <section className="relative overflow-hidden border-b border-slate-200 dark:border-slate-800">
        <div aria-hidden="true" className="absolute inset-0 grid-bg" />
        <div
          aria-hidden="true"
          className="absolute -top-32 left-1/2 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-brand-500/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute top-24 -right-24 h-64 w-64 rounded-full bg-fuchsia-500/15 blur-3xl"
        />

        <Container className="relative py-16 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3.5 py-1.5 text-xs font-medium text-slate-600 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300">
              <Sparkles className="h-3.5 w-3.5 text-brand-500" />
              {tools.length} free tools · no account required
            </span>

            <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Every small tool you need,{" "}
              <span className="text-gradient">in one clean workspace</span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-400">
              Format JSON, test regex, convert colors, hash data, generate passwords — fast
              micro-utilities with a consistent, privacy-first design.
            </p>

            <div className="mx-auto mt-8 max-w-xl">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="group flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-left shadow-sm transition-all hover:border-brand-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-500/40"
              >
                <Search className="h-4.5 w-4.5 shrink-0 text-slate-400" />
                <span className="flex-1 truncate text-sm text-slate-500 dark:text-slate-400">
                  Search {tools.length} tools — try “base64”, “regex” or “password”…
                </span>
                <kbd className="hidden shrink-0 items-center gap-0.5 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 font-sans text-[11px] text-slate-500 sm:inline-flex dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                  <Command className="h-3 w-3" />K
                </kbd>
              </button>
            </div>

            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button href="/tools" size="lg">
                Browse all tools
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button href="/about" variant="outline" size="lg">
                Why Toolstack?
              </Button>
            </div>

            <dl className="mx-auto mt-12 grid max-w-lg grid-cols-2 gap-4 sm:grid-cols-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-slate-200/70 bg-white/60 px-3 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/50"
                >
                  <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {stat.label}
                  </dt>
                  <dd className="mt-0.5 text-lg font-semibold tracking-tight tabular-nums">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </Container>
      </section>

      {/* ------------------------------------------- favorites & recents */}
      <PersonalSection />

      {/* ------------------------------------------------------ categories */}
      <Container className="py-14 sm:py-20">
        <SectionHeading
          eyebrow="Browse"
          title="Tools organised by what you're doing"
          description="Jump into a category to see only the utilities relevant to the task at hand."
          actions={
            <Button href="/tools" variant="outline" size="sm">
              All tools
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          }
        />

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categoriesWithCounts().map(({ category, count }) => (
            <CategoryCard key={category.id} category={category} count={count} />
          ))}
        </div>
      </Container>

      {/* --------------------------------------------------- popular tools */}
      <section className="border-y border-slate-200 bg-slate-50/60 py-14 sm:py-20 dark:border-slate-800 dark:bg-slate-900/30">
        <Container>
          <SectionHeading
            eyebrow="Popular"
            title="Tools people open first"
            description="A handful of everyday utilities — the rest are one search away."
            actions={
              <Button href="/tools" variant="ghost" size="sm">
                See everything
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            }
          />

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredTools.slice(0, 6).map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </Container>
      </section>

      {/* ------------------------------------------------------- highlights */}
      <Container className="py-14 sm:py-20">
        <SectionHeading
          eyebrow="Why Toolstack"
          title="Small tools, done properly"
          description="One consistent design system instead of fifty different one-off pages."
          align="center"
        />

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/60"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
                <item.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-[15px] font-semibold">{item.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed muted">{item.description}</p>
            </div>
          ))}
        </div>
      </Container>

      {/* -------------------------------------------------------------- CTA */}
      <Container className="pb-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-fuchsia-700 px-6 py-12 text-center shadow-xl sm:px-12 sm:py-16">
          <div
            aria-hidden="true"
            className="absolute -top-16 -right-10 h-52 w-52 rounded-full bg-white/10 blur-2xl"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-white/10 blur-2xl"
          />
          <div className="relative">
            <h2 className="text-balance text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Stop bookmarking random one-off tool sites
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-pretty text-sm text-white/80 sm:text-base">
              Bookmark Toolstack once and get a growing, consistent set of utilities that respect
              your privacy.
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href={href("/tools")}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-semibold text-slate-900 shadow-lg transition-transform hover:scale-[1.02]"
              >
                Explore all tools
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href={href("/about")}
                className="inline-flex h-12 items-center justify-center rounded-xl border border-white/30 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Read the story
              </a>
            </div>
          </div>
        </div>
      </Container>

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
