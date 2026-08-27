import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padded?: boolean;
  children?: ReactNode;
}

export function Card({ hover, padded = true, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200/80 bg-white shadow-sm",
        "dark:border-slate-800 dark:bg-slate-900/60",
        padded && "p-5",
        hover &&
          "transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-300/70 hover:shadow-xl hover:shadow-slate-900/5 dark:hover:border-brand-500/40",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <h3 className={cn("text-base font-semibold tracking-tight", className)}>{children}</h3>
  );
}

export function CardDescription({ className, children }: { className?: string; children: ReactNode }) {
  return <p className={cn("mt-1 text-sm leading-relaxed muted", className)}>{children}</p>;
}
