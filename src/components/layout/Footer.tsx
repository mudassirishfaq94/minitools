import { Heart, Shield } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { Container } from "@/components/ui/Container";
import { categories } from "@/data/categories";
import { href } from "@/utils/router";

const exploreLinks = [
  { to: "/", label: "Home" },
  { to: "/tools", label: "All tools" },
  { to: "/favorites", label: "Favorites" },
  { to: "/about", label: "About" },
];

export function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-950">
      <Container className="py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed muted">
              A growing collection of fast, focused micro-tools for developers, writers and
              designers. Everything runs in your browser — no uploads, no tracking, no sign-up.
            </p>
            <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200 ring-inset dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/25">
              <Shield className="h-3.5 w-3.5" />
              Private by default · 100% client-side
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Categories</h3>
            <ul className="mt-4 space-y-2.5">
              {categories.map((category) => (
                <li key={category.id}>
                  <a
                    href={href(category.route)}
                    className="text-sm muted transition-colors hover:text-brand-600 dark:hover:text-brand-400"
                  >
                    {category.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Explore</h3>
            <ul className="mt-4 space-y-2.5">
              {exploreLinks.map((link) => (
                <li key={link.to}>
                  <a
                    href={href(link.to)}
                    className="text-sm muted transition-colors hover:text-brand-600 dark:hover:text-brand-400"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-6 text-xs muted sm:flex-row dark:border-slate-800">
          <p>© {new Date().getFullYear()} Toolstack. Free forever, no account required.</p>
          <p className="inline-flex items-center gap-1.5">
            Built with
            <Heart className="h-3 w-3 fill-rose-500 text-rose-500" aria-label="love" />
            by
            <span className="font-medium text-slate-700 dark:text-slate-200">
              Mudassir Ishfaq
            </span>
          </p>
        </div>
      </Container>
    </footer>
  );
}
