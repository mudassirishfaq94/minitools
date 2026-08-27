import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, Search, Star, X } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { SearchDialog } from "@/components/search/SearchDialog";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Icon } from "@/components/ui/Icon";
import { categories } from "@/data/categories";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useFavorites } from "@/hooks/useFavorites";
import { useHotkey } from "@/hooks/useHotkey";
import { useScrolled } from "@/hooks/useScrolled";
import { cn } from "@/utils/cn";
import { href } from "@/utils/router";

interface NavbarProps {
  path: string;
}

const primaryLinks = [
  { to: "/", label: "Home" },
  { to: "/tools", label: "All tools" },
  { to: "/about", label: "About" },
];

/** Star link with a live count of saved favorites. */
function FavoritesLink({ active, mobile }: { active: boolean; mobile?: boolean }) {
  const { count } = useFavorites();

  if (mobile) {
    return (
      <a
        href={href("/favorites")}
        className={cn(
          "flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
          active
            ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
            : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
        )}
      >
        <span className="inline-flex items-center gap-2">
          <Star className={cn("h-4 w-4", count > 0 && "fill-amber-400 text-amber-500")} />
          Favorites
        </span>
        {count > 0 ? (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
            {count}
          </span>
        ) : null}
      </a>
    );
  }

  return (
    <a
      href={href("/favorites")}
      aria-label={`Favorites${count > 0 ? ` (${count} saved)` : ""}`}
      title="Favorites & recent tools"
      className={cn(
        "relative inline-flex h-9 w-9 items-center justify-center rounded-xl border transition-all",
        active
          ? "border-amber-300 bg-amber-50 text-amber-600 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-400"
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800",
      )}
    >
      <Star className={cn("h-4 w-4", count > 0 && "fill-amber-400 text-amber-500")} />
      {count > 0 ? (
        <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white tabular-nums">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </a>
  );
}

export function Navbar({ path }: NavbarProps) {
  const scrolled = useScrolled(6);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const categoriesRef = useRef<HTMLDivElement>(null);

  useBodyScrollLock(menuOpen);

  // Always close the mobile menu when opening search: leaving both open
  // stacks two body-scroll locks that can unwind in the wrong order.
  const openSearch = useCallback(() => {
    setMenuOpen(false);
    setSearchOpen(true);
  }, []);

  useHotkey("k", openSearch, { meta: true });
  useHotkey("/", openSearch);

  // Close the menu whenever the route changes.
  useEffect(() => {
    setMenuOpen(false);
    setCategoriesOpen(false);
  }, [path]);

  useEffect(() => {
    if (!categoriesOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!categoriesRef.current?.contains(event.target as Node)) setCategoriesOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setCategoriesOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [categoriesOpen]);

  const isActive = (to: string) =>
    to === "/" ? path === "/" || path.startsWith("/tool") : path === to || path.startsWith(`${to}/`);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300",
          scrolled
            ? "border-b border-slate-200/80 bg-white/80 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/80"
            : "border-b border-transparent bg-white/60 backdrop-blur-md dark:bg-slate-950/40",
        )}
      >
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
          <a href={href("/")} className="mr-auto flex items-center" aria-label="Toolstack home">
            <Logo />
          </a>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {primaryLinks.map((link) => (
              <a
                key={link.to}
                href={href(link.to)}
                aria-current={isActive(link.to) ? "page" : undefined}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive(link.to)
                    ? "text-brand-700 dark:text-brand-300"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white",
                )}
              >
                {link.label}
              </a>
            ))}

            <div ref={categoriesRef} className="relative">
              <button
                type="button"
                onClick={() => setCategoriesOpen((open) => !open)}
                aria-expanded={categoriesOpen}
                aria-haspopup="true"
                className={cn(
                  "inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  path.startsWith("/tools/")
                    ? "text-brand-700 dark:text-brand-300"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white",
                )}
              >
                Categories
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition-transform duration-200",
                    categoriesOpen && "rotate-180",
                  )}
                />
              </button>

              {categoriesOpen ? (
                <div className="absolute right-0 mt-2 w-72 animate-scale-in overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                  {categories.map((category) => (
                    <a
                      key={category.id}
                      href={href(category.route)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <span
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                          category.chip,
                        )}
                      >
                        <Icon name={category.icon} className="h-4 w-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-medium">{category.name}</span>
                        <span className="block truncate text-xs muted">{category.tagline}</span>
                      </span>
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openSearch}
              className={cn(
                "group hidden h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white pl-3 pr-2 text-sm text-slate-500 transition-all sm:flex",
                "hover:border-slate-300 hover:text-slate-700",
                "dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800",
              )}
              aria-label="Search tools"
            >
              <Search className="h-4 w-4" />
              <span className="pr-6">Search tools</span>
              <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-sans text-[11px] text-slate-400 dark:border-slate-700 dark:bg-slate-800">
                ⌘K
              </kbd>
            </button>

            <button
              type="button"
              onClick={openSearch}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 sm:hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              aria-label="Search tools"
            >
              <Search className="h-4 w-4" />
            </button>

            <FavoritesLink active={path === "/favorites"} />

            <ThemeToggle />

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 md:hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        <div
          className={cn(
            "overflow-hidden border-slate-200 bg-white transition-[max-height,opacity] duration-300 md:hidden dark:border-slate-800 dark:bg-slate-950",
            menuOpen ? "max-h-[80vh] border-t opacity-100" : "max-h-0 opacity-0",
          )}
        >
          <nav className="max-h-[80vh] space-y-1 overflow-y-auto px-4 py-4 scrollbar-thin" aria-label="Mobile">
            {primaryLinks.map((link) => (
              <a
                key={link.to}
                href={href(link.to)}
                className={cn(
                  "block rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive(link.to)
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
                )}
              >
                {link.label}
              </a>
            ))}

            <FavoritesLink active={path === "/favorites"} mobile />

            <p className="px-3 pt-4 pb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Categories
            </p>
            <div className="grid grid-cols-1 gap-1">
              {categories.map((category) => (
                <a
                  key={category.id}
                  href={href(category.route)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                      category.chip,
                    )}
                  >
                    <Icon name={category.icon} className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">{category.name}</span>
                    <span className="block truncate text-xs muted">{category.tagline}</span>
                  </span>
                </a>
              ))}
            </div>
          </nav>
        </div>
      </header>

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
