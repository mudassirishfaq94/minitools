import { useCallback, useRef, type ReactNode } from "react";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

interface LayoutProps {
  path: string;
  children: ReactNode;
}

export function Layout({ path, children }: LayoutProps) {
  const mainRef = useRef<HTMLElement>(null);

  /**
   * The app uses hash routing, so a plain `href="#main-content"` would be
   * parsed as the route "/main-content" and land on the 404 page. Move focus
   * manually instead and leave the hash untouched.
   */
  const skipToContent = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    const main = mainRef.current;
    if (!main) return;
    main.focus({ preventScroll: true });
    main.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main-content"
        onClick={skipToContent}
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[200] focus:rounded-lg focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-sm focus:text-white"
      >
        Skip to content
      </a>
      <Navbar path={path} />
      <main id="main-content" ref={mainRef} tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>
      <Footer />
    </div>
  );
}
