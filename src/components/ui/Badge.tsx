import type { ReactNode } from "react";
import { cn } from "@/utils/cn";
import type { ToolBadge } from "@/types";

type BadgeTone = "neutral" | "brand" | "success" | "warning" | "danger" | "glass";

const tones: Record<BadgeTone, string> = {
  neutral:
    "bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700",
  brand:
    "bg-brand-50 text-brand-700 ring-brand-200 dark:bg-brand-500/15 dark:text-brand-300 dark:ring-brand-500/25",
  success:
    "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/25",
  warning:
    "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/25",
  danger:
    "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/25",
  glass:
    "bg-white/70 text-slate-600 ring-white/60 backdrop-blur dark:bg-slate-900/60 dark:text-slate-300 dark:ring-slate-700/60",
};

export interface BadgeProps {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}

export function Badge({ tone = "neutral", className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

const badgeTones: Record<ToolBadge, BadgeTone> = {
  new: "success",
  popular: "brand",
  updated: "warning",
};

const badgeLabels: Record<ToolBadge, string> = {
  new: "New",
  popular: "Popular",
  updated: "Updated",
};

export function ToolBadgePill({ badge, className }: { badge?: ToolBadge; className?: string }) {
  if (!badge) return null;
  return (
    <Badge tone={badgeTones[badge]} className={className}>
      {badgeLabels[badge]}
    </Badge>
  );
}
