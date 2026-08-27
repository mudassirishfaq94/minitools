import type { ReactNode } from "react";
import { SearchX } from "lucide-react";
import { cn } from "@/utils/cn";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 px-6 py-14 text-center",
        "dark:border-slate-700 dark:bg-slate-900/40",
        className,
      )}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm dark:bg-slate-800 dark:text-slate-500">
        {icon ?? <SearchX className="h-5 w-5" />}
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      {description ? <p className="mt-1.5 max-w-sm text-sm muted">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
