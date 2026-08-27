import { useEffect, useMemo, useState } from "react";
import { CircleAlert, CircleCheck, Eraser, FileJson, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Field";
import { Segmented } from "@/components/ui/Segmented";
import { ResultPanel } from "@/components/tools/ResultPanel";
import { StatTile } from "@/components/tools/StatTile";
import { Button } from "@/components/ui/Button";
import { formatBytes, formatNumber } from "@/utils/format";

type Indent = "2" | "4" | "tab" | "minify";

const sample = `{
  "name": "Toolstack",
  "version": "1.0.0",
  "private": true,
  "tools": ["JSON Formatter", "Regex Tester"],
  "meta": { "clientSide": true, "tracking": false }
}`;

const indentOptions = [
  { value: "2" as Indent, label: "2 spaces" },
  { value: "4" as Indent, label: "4 spaces" },
  { value: "tab" as Indent, label: "Tab" },
  { value: "minify" as Indent, label: "Minify" },
];

export function JsonFormatter() {
  const [input, setInput] = useState(sample);
  const [indent, setIndent] = useState<Indent>("2");

  const parsed = useMemo(() => {
    if (!input.trim()) return { ok: true as const, value: undefined, empty: true };
    try {
      return { ok: true as const, value: JSON.parse(input) as unknown, empty: false };
    } catch (error) {
      return { ok: false as const, error: (error as Error).message, empty: false };
    }
  }, [input]);

  const [output, setOutput] = useState("");

  useEffect(() => {
    if (!parsed.ok) {
      setOutput("");
      return;
    }
    if (parsed.empty) {
      setOutput("");
      return;
    }
    try {
      const space =
        indent === "minify" ? undefined : indent === "tab" ? "\t" : Number(indent);
      setOutput(JSON.stringify(parsed.value, null, space));
    } catch (error) {
      setOutput((error as Error).message);
    }
  }, [parsed, indent]);

  const stats = useMemo(() => {
    if (!parsed.ok || parsed.empty) return { bytes: 0, keys: 0, type: "—" };
    const value = parsed.value;
    const type = Array.isArray(value)
      ? "array"
      : value === null
        ? "null"
        : typeof value;
    return {
      bytes: new TextEncoder().encode(output).length,
      keys: value && typeof value === "object" ? Object.keys(value as object).length : 0,
      type,
    };
  }, [parsed, output]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {parsed.ok ? (
            parsed.empty ? (
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500">
                <CircleCheck className="h-4 w-4" />
                Waiting for input…
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                <CircleCheck className="h-4 w-4" />
                Valid JSON
              </span>
            )
          ) : (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-rose-600 dark:text-rose-400">
              <CircleAlert className="h-4 w-4" />
                Invalid JSON
            </span>
          )}
        </div>

        <Segmented
          options={indentOptions}
          value={indent}
          onChange={setIndent}
          size="sm"
          className="w-auto"
          aria-label="Indentation"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <Textarea
            label="Input JSON"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Paste JSON here…"
            rows={14}
            action={
              <div className="flex gap-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setInput(sample)}
                  className="h-8 px-2.5 text-xs"
                >
                  <FileJson className="h-3.5 w-3.5" />
                  Sample
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setInput("")}
                  disabled={!input}
                  className="h-8 px-2.5 text-xs"
                >
                  <Eraser className="h-3.5 w-3.5" />
                  Clear
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setInput(sample);
                    setIndent("2");
                  }}
                  className="h-8 px-2.5 text-xs"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </Button>
              </div>
            }
          />
          {!parsed.ok ? (
            <p className="mt-2 text-xs font-medium text-rose-600 dark:text-rose-400">
              {parsed.error}
            </p>
          ) : null}
        </Card>

        <ResultPanel
          label={indent === "minify" ? "Minified JSON" : "Formatted JSON"}
          value={output}
          placeholder="Formatted output appears here…"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Type" value={stats.type} icon="Braces" />
        <StatTile label="Top-level keys" value={formatNumber(stats.keys)} icon="Hash" />
        <StatTile label="Output size" value={formatBytes(stats.bytes)} icon="Gauge" />
        <StatTile
          label="Saved"
          value={
            input && output
              ? `${Math.max(
                  0,
                  Math.round((1 - output.length / Math.max(input.length, 1)) * 100),
                )}%`
              : "—"
          }
          hint="compared to input"
          icon="Sparkles"
        />
      </div>
    </div>
  );
}
