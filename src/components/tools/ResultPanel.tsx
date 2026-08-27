import type { ReactNode } from "react";
import { CopyButton } from "@/components/ui/CopyButton";
import { cn } from "@/utils/cn";

interface ResultPanelProps {
  label: string;
  /** Raw text used by the copy button. */
  value: string;
  /** Custom body — falls back to a monospace block containing `value`. */
  children?: ReactNode;
  actions?: ReactNode;
  className?: string;
  placeholder?: string;
  error?: string | null;
}

/** Consistent "output" surface used by tools: label, copy action, mono result. */
export function ResultPanel({
  label,
  value,
  children,
  actions,
  className,
  placeholder = "Your result will appear here…",
  error,
}: ResultPanelProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-1.5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60",
        error && "border-rose-300 dark:border-rose-500/40",
        className,
      )}
    >
      <div className="flex min-w-0 items-center justify-between gap-2">
        <span className="truncate text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {label}
        </span>
        <div className="flex shrink-0 items-center gap-2">
          {actions}
          <CopyButton value={value} disabled={!value} />
        </div>
      </div>

      {children ?? (
        <div
          className={cn(
            "min-h-[3.5rem] overflow-x-auto rounded-xl bg-slate-50 p-3 text-[13px] leading-relaxed scrollbar-thin dark:bg-slate-950/60",
            error ? "text-rose-600 dark:text-rose-400" : "font-mono break-words",
          )}
        >
          {error ? error : value ? (
            <span className="whitespace-pre-wrap break-all">{value}</span>
          ) : (
            <span className="font-sans text-slate-400">{placeholder}</span>
          )}
        </div>
      )}
    </div>
  );
}
