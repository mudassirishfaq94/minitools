import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/cn";
import { href as toHref } from "@/utils/router";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "subtle";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

const base =
  "relative inline-flex items-center justify-center gap-2 rounded-xl font-medium " +
  "transition-all duration-200 select-none whitespace-nowrap " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 " +
  "disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-600 text-white shadow-lg shadow-brand-600/20 hover:bg-brand-700 hover:shadow-brand-600/30 " +
    "dark:bg-brand-500 dark:hover:bg-brand-400 dark:shadow-brand-500/20",
  secondary:
    "bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200",
  outline:
    "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 " +
    "dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800",
  ghost:
    "text-slate-600 hover:bg-slate-100 hover:text-slate-900 " +
    "dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white",
  subtle:
    "bg-slate-100 text-slate-700 hover:bg-slate-200 " +
    "dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700",
  danger: "bg-rose-600 text-white hover:bg-rose-700 shadow-sm",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
  icon: "h-10 w-10",
};

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children?: ReactNode;
}

export interface ButtonProps
  extends CommonProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> {
  /** When provided the button renders as a hash-routed anchor. */
  href?: string;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  href,
  ...props
}: ButtonProps) {
  const classes = cn(base, variants[variant], sizes[size], className);

  if (href) {
    return (
      <a href={href.startsWith("#") ? href : toHref(href)} className={classes}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  );
}
