import type { ReactNode } from "react";
import { RotateCcw, Shuffle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CopyButton } from "@/components/ui/CopyButton";
import { cn } from "@/utils/cn";

interface RandomizerShellProps {
  /** Settings column. */
  controls: ReactNode;
  /** Headline output. */
  display: ReactNode;
  /** Text placed on the clipboard for the current result. */
  copyValue?: string;
  onGenerate: () => void;
  onReset: () => void;
  generateLabel?: string;
  /** Rolling/flipping animation state. */
  busy?: boolean;
  /** Optional history panel. */
  history?: ReactNode;
  note?: ReactNode;
  className?: string;
}

/**
 * Shared layout for random-result tools: controls on the left, a large
 * result display on the right, plus generate/reset/copy actions.
 */
export function RandomizerShell({
  controls,
  display,
  copyValue,
  onGenerate,
  onReset,
  generateLabel = "Generate",
  busy,
  history,
  note,
  className,
}: RandomizerShellProps) {
  return (
    <div className={cn("space-y-5", className)}>
      <div className="grid gap-5 lg:grid-cols-5">
        <Card className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold">Settings</h2>
            <Button variant="ghost" size="sm" onClick={onReset} className="h-7 px-2 text-xs">
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
          </div>

          {controls}

          <Button onClick={onGenerate} size="lg" className="w-full" disabled={busy}>
            <Shuffle className={cn("h-4 w-4", busy && "animate-spin")} />
            {generateLabel}
          </Button>
        </Card>

        <div className="space-y-4 lg:col-span-3">
          <Card>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Result
              </span>
              {copyValue !== undefined ? (
                <CopyButton value={copyValue} disabled={!copyValue} />
              ) : null}
            </div>

            <div
              className="mt-3 flex min-h-[10rem] items-center justify-center rounded-xl bg-slate-50 p-6 dark:bg-slate-950/60"
              aria-live="polite"
            >
              {display}
            </div>
          </Card>

          {history}
        </div>
      </div>

      {note ? (
        <p className="rounded-xl bg-slate-50 px-4 py-3 text-xs muted dark:bg-slate-900/60">{note}</p>
      ) : null}
    </div>
  );
}

interface HistoryPanelProps {
  title?: string;
  items: string[];
  onClear: () => void;
  /** Renders each entry as a monospace chip instead of a list row. */
  compact?: boolean;
}

/** Shared recent-results panel used by the randomizer tools. */
export function HistoryPanel({
  title = "Recent results",
  items,
  onClear,
  compact,
}: HistoryPanelProps) {
  return (
    <Card padded={false} className="overflow-hidden">
      <div className="flex items-center justify-between gap-2 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {title}
        </h3>
        <div className="flex items-center gap-1.5">
          {items.length > 0 ? (
            <>
              <CopyButton value={items.join("\n")} label="Copy all" />
              <button
                type="button"
                onClick={onClear}
                aria-label="Clear history"
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </>
          ) : null}
        </div>
      </div>

      {items.length === 0 ? (
        <p className="px-4 py-6 text-center text-sm muted">Nothing generated yet.</p>
      ) : compact ? (
        <div className="flex flex-wrap gap-1.5 p-4">
          {items.map((item, index) => (
            <span
              key={`${item}-${index}`}
              className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-xs dark:bg-slate-800"
            >
              {item}
            </span>
          ))}
        </div>
      ) : (
        <ul className="max-h-64 divide-y divide-slate-100 overflow-y-auto scrollbar-thin dark:divide-slate-800">
          {items.map((item, index) => (
            <li
              key={`${item}-${index}`}
              className="flex items-center justify-between gap-3 px-4 py-2 text-sm"
            >
              <span className="min-w-0 flex-1 truncate font-mono">{item}</span>
              <span className="shrink-0 text-xs muted">#{items.length - index}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
