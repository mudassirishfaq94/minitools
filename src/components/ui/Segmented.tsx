import { cn } from "@/utils/cn";

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: "sm" | "md";
  className?: string;
  "aria-label"?: string;
}

/** Accessible pill-style segmented control. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  size = "md",
  className,
  "aria-label": ariaLabel,
}: SegmentedProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex w-full max-w-full items-center gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-slate-100/70 p-1 no-scrollbar",
        "dark:border-slate-800 dark:bg-slate-900/70",
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex-1 rounded-lg font-medium transition-all duration-200 whitespace-nowrap",
              size === "sm" ? "px-3 py-1.5 text-xs" : "px-3.5 py-2 text-sm",
              active
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
