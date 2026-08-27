import { useId, useMemo, type ReactNode } from "react";
import { ArrowRight, Eraser, FileText, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CopyButton } from "@/components/ui/CopyButton";
import { cn } from "@/utils/cn";
import { formatBytes, formatNumber } from "@/utils/format";
import { countLines, countWords, utf8Bytes } from "@/utils/text";

export interface TextToolStat {
  label: string;
  value: string;
}

interface TextToolShellProps {
  input: string;
  onInputChange: (value: string) => void;
  /** Processed result. Empty string renders the placeholder. */
  output: string;
  /** Controls rendered between the input and output panes. */
  options?: ReactNode;
  /** Extra stats appended to the default word/char counts. */
  stats?: TextToolStat[];
  /** Sample text loaded by the "Sample" button. */
  sample?: string;
  inputLabel?: string;
  outputLabel?: string;
  placeholder?: string;
  /** Validation or informational message shown under the input. */
  message?: { tone: "error" | "warning" | "info"; text: string } | null;
  /** Footnote explaining behaviour or assumptions. */
  note?: ReactNode;
  rows?: number;
  className?: string;
}

const messageTone = {
  error: "text-rose-600 dark:text-rose-400",
  warning: "text-amber-600 dark:text-amber-400",
  info: "muted",
};

/**
 * Shared layout for text tools: input pane, options, live output and stats.
 *
 * Every text tool composes this instead of re-implementing the textarea,
 * clear/sample actions, copy button and counters.
 */
export function TextToolShell({
  input,
  onInputChange,
  output,
  options,
  stats,
  sample,
  inputLabel = "Input text",
  outputLabel = "Result",
  placeholder = "Type or paste your text…",
  message,
  note,
  rows = 12,
  className,
}: TextToolShellProps) {
  const inputId = useId();

  const summary = useMemo(() => {
    const base: TextToolStat[] = [
      { label: "Characters", value: formatNumber(input.length) },
      { label: "Words", value: formatNumber(countWords(input)) },
      { label: "Lines", value: formatNumber(input ? countLines(input) : 0) },
      { label: "Size", value: formatBytes(utf8Bytes(input)) },
    ];
    return [...base, ...(stats ?? [])];
  }, [input, stats]);

  return (
    <div className={cn("space-y-5", className)}>
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Input ------------------------------------------------------- */}
        <Card className="flex flex-col">
          <div className="mb-2 flex items-center justify-between gap-2">
            <label
              htmlFor={inputId}
              className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              {inputLabel}
            </label>
            <div className="flex gap-1.5">
              {sample ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => onInputChange(sample)}
                >
                  <FileText className="h-3.5 w-3.5" />
                  Sample
                </Button>
              ) : null}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => onInputChange("")}
                disabled={!input}
              >
                <Eraser className="h-3.5 w-3.5" />
                Clear
              </Button>
            </div>
          </div>

          <textarea
            id={inputId}
            value={input}
            onChange={(event) => onInputChange(event.target.value)}
            rows={rows}
            placeholder={placeholder}
            spellCheck={false}
            aria-invalid={message?.tone === "error" ? true : undefined}
            className={cn(
              "w-full flex-1 resize-y rounded-xl border bg-white px-3.5 py-3 text-sm leading-relaxed shadow-sm transition-colors",
              "placeholder:text-slate-400 focus:ring-4 focus:outline-none",
              "dark:bg-slate-950/60",
              message?.tone === "error"
                ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/10 dark:border-rose-500/60"
                : "border-slate-200 hover:border-slate-300 focus:border-brand-500 focus:ring-brand-500/10 dark:border-slate-800 dark:hover:border-slate-700",
            )}
          />

          {message ? (
            <p
              role={message.tone === "error" ? "alert" : undefined}
              className={cn("mt-2 text-xs font-medium", messageTone[message.tone])}
            >
              {message.text}
            </p>
          ) : null}
        </Card>

        {/* Output ------------------------------------------------------ */}
        <Card className="flex flex-col">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {outputLabel}
            </span>
            <div className="flex items-center gap-1.5">
              {output ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => onInputChange(output)}
                  title="Use the result as the new input"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reuse
                </Button>
              ) : null}
              <CopyButton value={output} disabled={!output} />
            </div>
          </div>

          <div
            className={cn(
              "min-h-[12rem] flex-1 overflow-auto rounded-xl bg-slate-50 px-3.5 py-3 scrollbar-thin dark:bg-slate-950/60",
            )}
          >
            {output ? (
              <pre className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                {output}
              </pre>
            ) : (
              <p className="text-sm muted">
                {input ? "No output for these settings." : "Your result will appear here."}
              </p>
            )}
          </div>

          {output ? (
            <p className="mt-2 text-xs muted">
              {formatNumber(output.length)} characters ·{" "}
              {formatNumber(countWords(output))} words ·{" "}
              {formatNumber(countLines(output))} lines
            </p>
          ) : null}
        </Card>
      </div>

      {/* Options ------------------------------------------------------- */}
      {options ? <Card className="space-y-4">{options}</Card> : null}

      {/* Stats --------------------------------------------------------- */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {summary.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/60"
          >
            <p className="truncate text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {stat.label}
            </p>
            <p className="mt-0.5 truncate text-lg font-semibold tabular-nums">{stat.value}</p>
          </div>
        ))}
      </div>

      {note ? (
        <p className="flex items-start gap-2 rounded-xl bg-slate-50 px-4 py-3 text-xs muted dark:bg-slate-900/60">
          <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{note}</span>
        </p>
      ) : null}
    </div>
  );
}

interface OptionToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}

/** Compact checkbox used for text-tool option grids. */
export function OptionToggle({ checked, onChange, label, description }: OptionToggleProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "flex items-start gap-2.5 rounded-xl border p-3 text-left transition-all",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
        checked
          ? "border-brand-400 bg-brand-50 dark:border-brand-500/50 dark:bg-brand-500/10"
          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60",
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
          checked
            ? "border-brand-600 bg-brand-600 text-white"
            : "border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900",
        )}
        aria-hidden="true"
      >
        {checked ? (
          <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path d="m2.5 6 2.5 2.5 4.5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : null}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium">{label}</span>
        {description ? <span className="mt-0.5 block text-xs muted">{description}</span> : null}
      </span>
    </button>
  );
}

/** Responsive grid wrapper for `OptionToggle` groups. */
export function OptionGrid({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <div className="space-y-2">
      {title ? (
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {title}
        </h3>
      ) : null}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </div>
  );
}
