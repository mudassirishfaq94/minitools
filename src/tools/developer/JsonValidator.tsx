import { useMemo, useState } from "react";
import { CircleAlert, CircleCheck, Eraser, FileJson, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { StatTile } from "@/components/tools/StatTile";
import { analyzeJson } from "@/utils/codec";
import { cn } from "@/utils/cn";
import { formatBytes, formatNumber } from "@/utils/format";

const SAMPLE = `{
  "name": "Toolstack",
  "version": "1.0.0",
  "private": true,
  "tags": ["tools", "privacy", "offline"],
  "meta": {
    "clientSide": true,
    "tracking": null,
    "tools": 42
  }
}`;

const BROKEN = `{
  "name": "Toolstack",
  "tags": ["a", "b",],
  "meta": { "ok": true }
}`;

export function JsonValidator() {
  const [input, setInput] = useState(SAMPLE);

  const analysis = useMemo(() => analyzeJson(input), [input]);
  const lines = useMemo(() => input.split(/\r\n|\r|\n/), [input]);

  const reset = () => setInput(SAMPLE);

  return (
    <div className="space-y-5">
      {/* Status banner */}
      <div
        role="status"
        aria-live="polite"
        className={cn(
          "flex flex-col gap-3 rounded-2xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
          !input.trim()
            ? "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60"
            : analysis.valid
              ? "border-emerald-200 bg-emerald-50 dark:border-emerald-500/25 dark:bg-emerald-500/10"
              : "border-rose-200 bg-rose-50 dark:border-rose-500/25 dark:bg-rose-500/10",
        )}
      >
        <span className="flex items-center gap-2 text-sm font-semibold">
          {!input.trim() ? (
            <>
              <FileJson className="h-4 w-4 text-slate-400" />
              <span className="muted">Paste JSON to validate it</span>
            </>
          ) : analysis.valid ? (
            <>
              <CircleCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-emerald-700 dark:text-emerald-300">Valid JSON</span>
            </>
          ) : (
            <>
              <CircleAlert className="h-4 w-4 text-rose-600 dark:text-rose-400" />
              <span className="text-rose-700 dark:text-rose-300">Invalid JSON</span>
            </>
          )}
        </span>

        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" size="sm" onClick={() => setInput(SAMPLE)}>
            <FileJson className="h-3.5 w-3.5" />
            Valid sample
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setInput(BROKEN)}>
            Broken sample
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setInput("")} disabled={!input}>
            <Eraser className="h-3.5 w-3.5" />
            Clear
          </Button>
          <Button variant="ghost" size="sm" onClick={reset}>
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Editor with line numbers */}
        <Card className="flex flex-col">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              JSON input
            </span>
            <CopyButton value={input} disabled={!input} />
          </div>

          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            rows={16}
            spellCheck={false}
            placeholder="Paste JSON here…"
            aria-invalid={analysis.error ? true : undefined}
            className={cn(
              "w-full flex-1 resize-y rounded-xl border bg-white px-3.5 py-3 font-mono text-[13px] leading-relaxed shadow-sm transition-colors",
              "placeholder:font-sans placeholder:text-slate-400 focus:ring-4 focus:outline-none dark:bg-slate-950/60",
              analysis.error
                ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/10 dark:border-rose-500/60"
                : "border-slate-200 hover:border-slate-300 focus:border-brand-500 focus:ring-brand-500/10 dark:border-slate-800",
            )}
          />
        </Card>

        {/* Diagnostics */}
        <div className="space-y-4">
          {analysis.error ? (
            <Card className="border-rose-200 dark:border-rose-500/25">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-rose-700 dark:text-rose-300">
                <CircleAlert className="h-4 w-4" />
                Parser error
              </h3>

              <p className="mt-2 font-mono text-[13px] break-words text-rose-600 dark:text-rose-400">
                {analysis.error.message}
              </p>

              {analysis.error.line !== null ? (
                <>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs muted">
                    <span>
                      Line <strong className="text-slate-900 dark:text-white">{analysis.error.line}</strong>
                    </span>
                    <span>
                      Column{" "}
                      <strong className="text-slate-900 dark:text-white">
                        {analysis.error.column}
                      </strong>
                    </span>
                    {analysis.error.position !== null ? (
                      <span>Offset {formatNumber(analysis.error.position)}</span>
                    ) : null}
                  </div>

                  {analysis.error.snippet !== null ? (
                    <div className="mt-3 overflow-x-auto rounded-xl bg-slate-950 p-3 scrollbar-thin">
                      <pre className="font-mono text-[12px] leading-relaxed text-slate-300">
                        <span className="mr-3 select-none text-slate-600">
                          {String(analysis.error.line).padStart(3, " ")}
                        </span>
                        {analysis.error.snippet}
                        {"\n"}
                        <span className="mr-3 select-none text-slate-600">{"   "}</span>
                        <span className="text-rose-400">
                          {" ".repeat(Math.max(0, (analysis.error.column ?? 1) - 1))}^
                        </span>
                      </pre>
                    </div>
                  ) : null}
                </>
              ) : null}

              <p className="mt-3 text-xs muted">
                Common causes: a trailing comma before <code>{"}"}</code> or <code>]</code>, single
                quotes instead of double quotes, unquoted keys, or a missing comma between entries.
              </p>
            </Card>
          ) : analysis.valid && analysis.stats ? (
            <>
              <Card>
                <h3 className="text-sm font-semibold">Structure</h3>
                <ul className="mt-3 divide-y divide-slate-100 text-sm dark:divide-slate-800">
                  <li className="flex justify-between py-2">
                    <span className="muted">Root type</span>
                    <span className="font-mono">{analysis.stats.type}</span>
                  </li>
                  <li className="flex justify-between py-2">
                    <span className="muted">
                      {analysis.stats.type === "array" ? "Array length" : "Top-level keys"}
                    </span>
                    <span className="font-mono">{formatNumber(analysis.stats.keys)}</span>
                  </li>
                  <li className="flex justify-between py-2">
                    <span className="muted">Total keys (all levels)</span>
                    <span className="font-mono">{formatNumber(analysis.stats.totalKeys)}</span>
                  </li>
                  <li className="flex justify-between py-2">
                    <span className="muted">Maximum depth</span>
                    <span className="font-mono">{analysis.stats.depth}</span>
                  </li>
                </ul>
              </Card>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <StatTile label="Objects" value={formatNumber(analysis.stats.objects)} icon="Braces" />
                <StatTile label="Arrays" value={formatNumber(analysis.stats.arrays)} icon="Layers" />
                <StatTile label="Strings" value={formatNumber(analysis.stats.strings)} icon="Type" />
                <StatTile label="Numbers" value={formatNumber(analysis.stats.numbers)} icon="Hash" />
                <StatTile
                  label="Booleans"
                  value={formatNumber(analysis.stats.booleans)}
                  icon="CircleCheck"
                />
                <StatTile label="Nulls" value={formatNumber(analysis.stats.nulls)} icon="Minus" />
              </div>
            </>
          ) : (
            <Card>
              <p className="py-8 text-center text-sm muted">
                Validation results will appear here.
              </p>
            </Card>
          )}

          <div className="grid grid-cols-2 gap-3">
            <StatTile label="Lines" value={formatNumber(input ? lines.length : 0)} icon="Layers" />
            <StatTile
              label="Size"
              value={formatBytes(new TextEncoder().encode(input).length)}
              icon="Gauge"
            />
          </div>
        </div>
      </div>

      <p className="rounded-xl bg-slate-50 px-4 py-3 text-xs muted dark:bg-slate-900/60">
        Validation uses the browser's native <code>JSON.parse()</code>, so results match exactly what
        your JavaScript runtime accepts. Nothing is uploaded. Note that JSON does not permit
        trailing commas, comments or single-quoted strings, even though many editors tolerate them.
      </p>
    </div>
  );
}
