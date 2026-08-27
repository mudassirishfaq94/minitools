import { useState, type MouseEvent } from "react";
import { Star } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { cn } from "@/utils/cn";

interface FavoriteButtonProps {
  slug: string;
  /** Tool name, used for the accessible label. */
  name: string;
  /** `icon` is a bare star for cards; `button` adds a visible label. */
  variant?: "icon" | "button";
  className?: string;
}

/**
 * Toggles a tool's favorite state.
 *
 * Safe to render inside a link — the click is stopped from bubbling so
 * starring a tool card never triggers navigation.
 */
export function FavoriteButton({
  slug,
  name,
  variant = "icon",
  className,
}: FavoriteButtonProps) {
  const { isFavorite, toggle } = useFavorites();
  const [pulse, setPulse] = useState(false);
  const active = isFavorite(slug);

  const handleClick = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const added = toggle(slug);
    if (added) {
      setPulse(true);
      window.setTimeout(() => setPulse(false), 320);
    }
  };

  const label = active ? `Remove ${name} from favorites` : `Add ${name} to favorites`;

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={active}
        aria-label={label}
        className={cn(
          "inline-flex h-10 items-center gap-2 rounded-xl border px-4 text-sm font-medium transition-all active:scale-[0.98]",
          active
            ? "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300"
            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800",
          className,
        )}
      >
        <Star
          className={cn("h-4 w-4 transition-transform", active && "fill-current", pulse && "scale-125")}
        />
        {active ? "Favorited" : "Add to favorites"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={active}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-lg transition-all active:scale-90",
        active
          ? "text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10"
          : "text-slate-300 hover:bg-slate-100 hover:text-slate-500 dark:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-400",
        className,
      )}
    >
      <Star
        className={cn(
          "h-4 w-4 transition-transform duration-300",
          active && "fill-current",
          pulse && "scale-125",
        )}
      />
    </button>
  );
}
