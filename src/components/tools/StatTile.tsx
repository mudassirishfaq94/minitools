import type { ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/utils/cn";

interface StatTileProps {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: string;
  className?: string;
}

export function StatTile({ label, value, hint, icon, className }: StatTileProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900/60",
        className,
      )}
    >
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {icon ? <Icon name={icon} className="h-3.5 w-3.5" /> : null}
        <span className="truncate">{label}</span>
      </div>
      <p className="mt-1.5 truncate text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
      {hint ? <p className="mt-0.5 truncate text-xs muted">{hint}</p> : null}
    </div>
  );
}
