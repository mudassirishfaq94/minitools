import { useId, type ReactNode } from "react";
import { CircleAlert } from "lucide-react";
import { cn } from "@/utils/cn";
import { isIncompleteNumber, parseNumber } from "@/utils/number";

export interface NumericValidation {
  value: number | null;
  error: string | null;
  empty: boolean;
}

interface ValidateOptions {
  min?: number;
  max?: number;
  /** Reject negative values with a clear message. */
  nonNegative?: boolean;
  /** Reject zero (e.g. divisors, number of people). */
  nonZero?: boolean;
  /** Require a whole number. */
  integer?: boolean;
  label?: string;
}

/** Shared numeric validation used by every calculator field. */
export function validateNumber(raw: string, options: ValidateOptions = {}): NumericValidation {
  const { min, max, nonNegative, nonZero, integer, label = "Value" } = options;
  const trimmed = raw.trim();

  if (!trimmed || isIncompleteNumber(trimmed)) {
    return { value: null, error: null, empty: true };
  }

  const value = parseNumber(trimmed);
  if (value === null) {
    return { value: null, error: `${label} must be a number.`, empty: false };
  }
  if (integer && !Number.isInteger(value)) {
    return { value: null, error: `${label} must be a whole number.`, empty: false };
  }
  if (nonNegative && value < 0) {
    return { value: null, error: `${label} cannot be negative.`, empty: false };
  }
  if (nonZero && value === 0) {
    return { value: null, error: `${label} must be greater than zero.`, empty: false };
  }
  if (min !== undefined && value < min) {
    return { value: null, error: `${label} must be at least ${min}.`, empty: false };
  }
  if (max !== undefined && value > max) {
    return { value: null, error: `${label} cannot exceed ${max}.`, empty: false };
  }

  return { value, error: null, empty: false };
}

interface NumberFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  hint?: ReactNode;
  /** Leading adornment, e.g. a currency symbol. */
  prefix?: string;
  /** Trailing adornment, e.g. "%" or "kg". */
  suffix?: string;
  placeholder?: string;
  className?: string;
  /** Quick-fill chips rendered under the field. */
  presets?: (number | string)[];
  disabled?: boolean;
}

/** Validated numeric input with optional prefix/suffix and preset chips. */
export function NumberField({
  label,
  value,
  onChange,
  error,
  hint,
  prefix,
  suffix,
  placeholder = "0",
  className,
  presets,
  disabled,
}: NumberFieldProps) {
  const id = useId();

  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <label
        htmlFor={id}
        className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
      >
        {label}
      </label>

      <div
        className={cn(
          "flex items-center overflow-hidden rounded-xl border bg-white shadow-sm transition-colors",
          "focus-within:ring-4 dark:bg-slate-950/60",
          error
            ? "border-rose-400 focus-within:border-rose-500 focus-within:ring-rose-500/10 dark:border-rose-500/60"
            : "border-slate-200 hover:border-slate-300 focus-within:border-brand-500 focus-within:ring-brand-500/10 dark:border-slate-800 dark:hover:border-slate-700",
          disabled && "opacity-60",
        )}
      >
        {prefix ? (
          <span className="shrink-0 border-r border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            {prefix}
          </span>
        ) : null}

        <input
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          inputMode="decimal"
          autoComplete="off"
          disabled={disabled}
          placeholder={placeholder}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="min-w-0 flex-1 bg-transparent px-3.5 py-2.5 text-sm font-medium tabular-nums outline-none placeholder:font-normal placeholder:text-slate-400"
        />

        {suffix ? (
          <span className="shrink-0 border-l border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            {suffix}
          </span>
        ) : null}
      </div>

      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="flex items-start gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400"
        >
          <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs muted">{hint}</p>
      ) : null}

      {presets && presets.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {presets.map((preset) => (
            <button
              key={String(preset)}
              type="button"
              onClick={() => onChange(String(preset))}
              className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              {preset}
              {suffix === "%" ? "%" : ""}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
