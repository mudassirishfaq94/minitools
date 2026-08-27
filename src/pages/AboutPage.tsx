import { ArrowRight, Blocks, Feather, Heart, Shield, Star, Zap } from "lucide-react";
import { Container, SectionHeading } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { categories } from "@/data/categories";
import { availableTools as tools } from "@/data/catalog";
import { formatNumber } from "@/utils/format";
import { href } from "@/utils/router";

const principles = [
  {
    icon: Shield,
    title: "Privacy first",
    body: "Every tool runs client-side. There is no backend, no analytics and no upload step — your data never leaves the tab.",
  },
  {
    icon: Zap,
    title: "Fast by default",
    body: "No frameworks you have to wait for, no spinners between keystrokes. Results update as you type.",
  },
  {
    icon: Blocks,
    title: "One consistent system",
    body: "Shared components, spacing and typography across every tool, so learning one means knowing them all.",
  },
  {
    icon: Feather,
    title: "Lightweight & focused",
    body: "Small utilities that do one thing well, instead of sprawling dashboards packed with features you never use.",
  },
  {
    icon: Star,
    title: "Yours, without an account",
    body: "Favorites and recent tools are saved in your browser with localStorage — no sign-up, no profile, nothing sent to a server.",
  },
];

const stack = [
  "React 19",
  "TypeScript",
  "Tailwind CSS v4",
  "Vite",
  "Web Crypto API",
  "Hash routing",
];

export function AboutPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-slate-200 dark:border-slate-800">
        <div aria-hidden="true" className="absolute inset-0 grid-bg" />
        <Container className="relative py-14 sm:py-20">
          <div className="max-w-3xl">
            <Badge tone="brand">About the project</Badge>
            <h1 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              A toolkit that respects your time and your data
            </h1>
            <p className="mt-4 text-pretty text-base leading-relaxed muted sm:text-lg">
              Toolstack is a curated collection of {formatNumber(tools.length)} micro-utilities for
              developers, writers and designers — built as a single, coherent product instead of a
              pile of unrelated pages.
            </p>
          </div>
        </Container>
      </section>

      <Container className="py-14 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">The idea</h2>
            <div className="mt-4 space-y-4 leading-relaxed muted">
              <p>
                The internet is full of single-purpose tool sites: cluttered layouts, pop-ups,
                trackers, and a different interface every time. They solve a real problem — you just
                wish they solved it better.
              </p>
              <p>
                Toolstack takes the same idea and applies product thinking to it: a shared design
                system, instant search, dark mode, and consistent behaviour across every utility.
                Each tool is implemented as an isolated module, so new ones can be added without
                touching anything else.
              </p>
              <p>
                Everything is computed in the browser using standard Web APIs. That is not just a
                privacy claim — it also makes the tools instant, and it means they keep working with
                no network at all once the page has loaded.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-slate-50/70 p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900/40">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              What's inside
            </h3>
            <ul className="mt-5 space-y-3">
              {categories.map((category) => (
                <li key={category.id} className="flex items-center gap-3">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${category.chip}`}
                  >
                    <Icon name={category.icon} className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <a
                      href={href(category.route)}
                      className="text-sm font-medium hover:text-brand-600 dark:hover:text-brand-400"
                    >
                      {category.name}
                    </a>
                    <span className="block truncate text-xs muted">{category.tagline}</span>
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-7 border-t border-slate-200 pt-5 dark:border-slate-800">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                Built with
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {stack.map((item) => (
                  <Badge key={item} tone="glass">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="mt-7 border-t border-slate-200 pt-5 dark:border-slate-800">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                Created by
              </h3>
              <p className="mt-2 inline-flex items-center gap-1.5 text-sm">
                Designed and developed with
                <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" aria-label="love" />
                by{" "}
                <span className="font-semibold text-slate-900 dark:text-white">
                  Mudassir Ishfaq
                </span>
              </p>
            </div>
          </div>
        </div>
      </Container>

      <section className="border-y border-slate-200 bg-slate-50/60 py-14 sm:py-20 dark:border-slate-800 dark:bg-slate-900/30">
        <Container>
          <SectionHeading
            eyebrow="Principles"
            title="How every tool is designed"
            align="center"
          />
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {principles.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
                  <item.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-[15px] font-semibold">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed muted">{item.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <Container className="py-16 text-center">
        <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
          Ready to try it?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-pretty muted">
          Open any tool, or press ⌘K to search the whole catalog from anywhere on the site.
        </p>
        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button href="/tools" size="lg">
            Browse all tools
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </Container>
    </>
  );
}
