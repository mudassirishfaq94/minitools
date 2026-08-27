import type { ReactNode } from "react";
import { Info, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CopyButton } from "@/components/ui/CopyButton";
import { cn } from "@/utils/cn";

interface CalculatorShellProps {
  /** Left column: the input controls. */
  inputs: ReactNode;
  /** Right column: results. */
  results: ReactNode;
  onReset: () => void;
  /** Formula or assumptions note shown at the bottom. */
  note?: ReactNode;
  className?: string;
}

/** Shared two-column calculator layout: inputs left, results right, reset action. */
export function CalculatorShell({
  inputs,
  results,
  onReset,
  note,
  className,
}: CalculatorShellProps) {
  return (
    <div className={cn("space-y-5", className)}>
      <div className="grid gap-5 lg:grid-cols-5">
        <Card className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold">Inputs</h2>
            <Button variant="ghost" size="sm" onClick={onReset} className="h-7 px-2 text-xs">
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
          </div>
          {inputs}
        </Card>

        <div className="space-y-4 lg:col-span-3">{results}</div>
      </div>

      {note ? (
        <p className="flex items-start gap-2 rounded-xl bg-slate-50 px-4 py-3 text-xs muted dark:bg-slate-900/60">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{note}</span>
        </p>
      ) : null}
    </div>
  );
}

interface PrimaryResultProps {
  label: string;
  /** Main figure, already formatted. */
  value: string;
  /** Unit or currency shown next to the value. */
  unit?: string;
  /** Secondary line under the figure. */
  caption?: ReactNode;
  /** Text placed on the clipboard; defaults to value + unit. */
  copyValue?: string;
  tone?: "brand" | "success" | "warning" | "danger";
  placeholder?: string;
  isValid: boolean;
  className?: string;
}

const toneRing: Record<NonNullable<PrimaryResultProps["tone"]>, string> = {
  brand: "border-brand-200/80 dark:border-brand-500/25",
  success: "border-emerald-200/80 dark:border-emerald-500/25",
  warning: "border-amber-200/80 dark:border-amber-500/25",
  danger: "border-rose-200/80 dark:border-rose-500/25",
};

/** Highlighted headline result with a copy button. */
export function PrimaryResult({
  label,
  value,
  unit,
  caption,
  copyValue,
  tone = "brand",
  placeholder = "Enter values to calculate.",
  isValid,
  className,
}: PrimaryResultProps) {
  const clipboard = copyValue ?? (unit ? `${value} ${unit}` : value);

  return (
    <Card className={cn(isValid && toneRing[tone], className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {label}
        </span>
        <CopyButton value={isValid ? clipboard : ""} disabled={!isValid} />
      </div>

      <div className="mt-3 rounded-xl bg-slate-50 p-5 dark:bg-slate-950/60">
        {isValid ? (
          <>
            <p className="text-2xl font-semibold tracking-tight tabular-nums break-all sm:text-3xl">
              {value}
              {unit ? <span className="ml-1.5 text-base font-medium muted">{unit}</span> : null}
            </p>
            {caption ? <div className="mt-1.5 text-sm muted">{caption}</div> : null}
          </>
        ) : (
          <p className="text-sm muted">{placeholder}</p>
        )}
      </div>
    </Card>
  );
}

interface BreakdownRow {
  label: string;
  value: string;
  /** Emphasise this row (e.g. a total). */
  strong?: boolean;
  copy?: string;
}

/** Compact label/value table used for secondary calculator output. */
export function ResultBreakdown({
  title,
  rows,
  className,
}: {
  title?: string;
  rows: BreakdownRow[];
  className?: string;
}) {
  return (
    <Card padded={false} className={cn("overflow-hidden", className)}>
      {title ? (
        <h3 className="border-b border-slate-200 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400">
          {title}
        </h3>
      ) : null}

      <ul className="divide-y divide-slate-100 dark:divide-slate-800">
        {rows.map((row) => (
          <li
            key={row.label}
            className={cn(
              "flex items-center justify-between gap-3 px-4 py-2.5",
              row.strong && "bg-slate-50/80 dark:bg-slate-950/40",
            )}
          >
            <span
              className={cn(
                "min-w-0 flex-1 truncate text-sm",
                row.strong ? "font-semibold" : "muted",
              )}
            >
              {row.label}
            </span>
            <span
              className={cn(
                "shrink-0 text-right font-mono text-sm tabular-nums",
                row.strong && "font-semibold",
              )}
            >
              {row.value}
            </span>
            {row.copy ? (
              <CopyButton
                iconOnly
                value={row.copy}
                label={`Copy ${row.label}`}
                className="h-8 w-8 shrink-0"
              />
            ) : null}
          </li>
        ))}
      </ul>
    </Card>
  );
}
