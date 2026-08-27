import { Layers } from "lucide-react";
import { cn } from "@/utils/cn";

interface LogoProps {
  className?: string;
  showWordmark?: boolean;
  size?: "sm" | "md";
}

export function Logo({ className, showWordmark = true, size = "md" }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 via-brand-600 to-fuchsia-600 text-white shadow-lg shadow-brand-600/25">
        <Layers className="h-[18px] w-[18px]" strokeWidth={2.2} />
        <span className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/25" />
      </span>
      {showWordmark ? (
        <span
          className={cn(
            "font-semibold tracking-tight text-slate-900 dark:text-white",
            size === "sm" ? "text-base" : "text-lg",
          )}
        >
          Tool<span className="text-brand-600 dark:text-brand-400">stack</span>
        </span>
      ) : null}
    </span>
  );
}
