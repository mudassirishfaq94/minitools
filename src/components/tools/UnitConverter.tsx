import { useId } from "react";
import { ArrowUpDown, CircleAlert, Eraser, Info, RotateCcw, TriangleAlert } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useUnitConverter } from "@/hooks/useUnitConverter";
import { cn } from "@/utils/cn";
import type { UnitCategoryId } from "@/types";

interface UnitConverterProps {
  category: UnitCategoryId;
  /** Optional shortcut values shown as chips under the input. */
  presets?: number[];
}

/**
 * Reusable converter interface.
 *
 * All eight converter tools render this component with a different category id —
 * the maths, validation and formatting come from `useUnitConverter` / `@/utils/units`,
 * so there is no per-tool logic to duplicate.
 */
export function UnitConverter({ category, presets = [1, 10, 100, 1000] }: UnitConverterProps) {
  const converter = useUnitConverter(category);
  const inputId = useId();
  const fromId = useId();
  const toId = useId();

  const {
    category: meta,
    input,
    setInput,
    error,
    warning,
    isEmpty,
    from,
    to,
    setFrom,
    setTo,
    swap,
    reset,
    clear,
    fromUnit,
    toUnit,
    options,
    formatted,
    formattedWithSymbol,
    all,
    formula,
    ratioLabel,
    isValid,
  } = converter;

  if (!meta) {
    return (
      <EmptyState
        title="Unknown conversion category"
        description="This converter has no unit data attached."
      />
    );
  }

  const selectClass =
    "h-11 w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white px-3.5 pr-9 text-sm shadow-sm transition-colors " +
    "hover:border-slate-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:outline-none " +
    "dark:border-slate-800 dark:bg-slate-950/60 dark:hover:border-slate-700 dark:focus:border-brand-400";

  return (
    <div className="space-y-5">
      <Card className="space-y-5">
        {/* Value ------------------------------------------------------- */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <label
              htmlFor={inputId}
              className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Value
            </label>
            <div className="flex gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={clear}
                disabled={!input}
                className="h-7 px-2 text-xs"
              >
                <Eraser className="h-3.5 w-3.5" />
                Clear
              </Button>
              <Button variant="ghost" size="sm" onClick={reset} className="h-7 px-2 text-xs">
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </Button>
            </div>
          </div>

          <input
            id={inputId}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            inputMode="decimal"
            autoComplete="off"
            placeholder="Enter a number…"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${inputId}-error` : undefined}
            className={cn(
              "h-14 w-full rounded-xl border bg-white px-4 text-lg font-medium tabular-nums shadow-sm transition-colors",
              "placeholder:font-normal placeholder:text-slate-400 focus:ring-4 focus:outline-none",
              "dark:bg-slate-950/60",
              error
                ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/10 dark:border-rose-500/60"
                : "border-slate-200 hover:border-slate-300 focus:border-brand-500 focus:ring-brand-500/10 dark:border-slate-800 dark:hover:border-slate-700",
            )}
          />

          {error ? (
            <p
              id={`${inputId}-error`}
              role="alert"
              className="flex items-start gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400"
            >
              <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {error}
            </p>
          ) : warning ? (
            <p className="flex items-start gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
              <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {warning}
            </p>
          ) : (
            <p className="text-xs muted">
              Accepts decimals, negatives and thousands separators.
            </p>
          )}

          {presets.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {presets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setInput(String(preset))}
                  className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  {preset.toLocaleString("en-US")}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {/* From / swap / To -------------------------------------------- */}
        <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-[1fr_auto_1fr]">
          <div className="min-w-0 space-y-1.5">
            <label
              htmlFor={fromId}
              className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              From
            </label>
            <div className="relative">
              <select
                id={fromId}
                value={from}
                onChange={(event) => setFrom(event.target.value)}
                className={selectClass}
              >
                {options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronGlyph />
            </div>
          </div>

          <div className="flex justify-center sm:pb-0.5">
            <button
              type="button"
              onClick={swap}
              aria-label={`Swap ${fromUnit?.name ?? "from"} and ${toUnit?.name ?? "to"}`}
              title="Swap units"
              className={cn(
                "inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-all",
                "hover:border-brand-300 hover:text-brand-600 active:scale-95",
                "dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-brand-500/40 dark:hover:text-brand-300",
              )}
            >
              <ArrowUpDown className="h-4 w-4 sm:rotate-90" />
            </button>
          </div>

          <div className="min-w-0 space-y-1.5">
            <label
              htmlFor={toId}
              className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              To
            </label>
            <div className="relative">
              <select
                id={toId}
                value={to}
                onChange={(event) => setTo(event.target.value)}
                className={selectClass}
              >
                {options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronGlyph />
            </div>
          </div>
        </div>
      </Card>

      {/* Result --------------------------------------------------------- */}
      <Card
        className={cn(
          "overflow-hidden",
          isValid && "border-brand-200/80 dark:border-brand-500/25",
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Result
          </span>
          <CopyButton value={formattedWithSymbol} disabled={!isValid} />
        </div>

        <div className="mt-3 rounded-xl bg-slate-50 p-5 dark:bg-slate-950/60">
          {isValid ? (
            <>
              <p className="text-2xl font-semibold tracking-tight tabular-nums break-all sm:text-3xl">
                {formatted}
                <span className="ml-1.5 text-base font-medium muted">{toUnit?.symbol}</span>
              </p>
              <p className="mt-1.5 text-sm muted">
                {input.trim()} {fromUnit?.symbol} = {formatted} {toUnit?.symbol}
              </p>
            </>
          ) : (
            <p className="text-sm muted">
              {error
                ? "Fix the value above to see a result."
                : isEmpty
                  ? "Enter a value to convert."
                  : "Waiting for a valid number…"}
            </p>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs muted">
          {ratioLabel ? <span className="font-mono">{ratioLabel}</span> : null}
          {formula ? (
            <span>
              Formula: <span className="font-mono">{formula}</span>
            </span>
          ) : null}
        </div>
      </Card>

      {/* All units ------------------------------------------------------ */}
      {all.length > 0 ? (
        <Card padded={false} className="overflow-hidden">
          <div className="flex items-center justify-between gap-2 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              All {meta.name.toLowerCase()} units
            </h3>
            <span className="text-xs muted">
              from {input.trim()} {fromUnit?.symbol}
            </span>
          </div>

          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {all.map((item) => (
              <li
                key={item.unit.id}
                className={cn(
                  "flex items-center justify-between gap-3 px-4 py-2.5 transition-colors",
                  item.unit.id === to && "bg-brand-50/60 dark:bg-brand-500/5",
                )}
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{item.unit.name}</span>
                  <span className="block text-xs muted">{item.unit.symbol}</span>
                </span>
                <span className="shrink-0 text-right font-mono text-sm tabular-nums">
                  {item.formatted}
                </span>
                <CopyButton
                  iconOnly
                  value={`${item.formatted} ${item.unit.symbol}`}
                  label={`Copy value in ${item.unit.plural.toLowerCase()}`}
                  className="h-8 w-8 shrink-0"
                />
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {meta.note ? (
        <p className="flex items-start gap-2 rounded-xl bg-slate-50 px-4 py-3 text-xs muted dark:bg-slate-900/60">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {meta.note}
        </p>
      ) : null}
    </div>
  );
}

function ChevronGlyph() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-slate-400"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
