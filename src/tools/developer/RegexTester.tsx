import { useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Field";
import { ResultPanel } from "@/components/tools/ResultPanel";
import { StatTile } from "@/components/tools/StatTile";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/utils/cn";
import { formatNumber } from "@/utils/format";

const FLAGS = ["g", "i", "m", "s", "u", "y"] as const;
type Flag = (typeof FLAGS)[number];

const flagHints: Record<Flag, string> = {
  g: "global",
  i: "ignore case",
  m: "multiline",
  s: "dotall",
  u: "unicode",
  y: "sticky",
};

interface MatchResult {
  match: string;
  index: number;
  groups: string[];
}

const DEFAULTS = {
  pattern: "(\\w+)@(\\w+)\\.com",
  flags: ["g", "i"] as Flag[],
  text: "Reach us at hello@toolstack.com or support@toolstack.com.\nInvalid: admin@localhost",
  replacement: "$1 [at] $2",
};

export function RegexTester() {
  const [pattern, setPattern] = useState(DEFAULTS.pattern);
  const [flags, setFlags] = useState<Flag[]>(DEFAULTS.flags);
  const [text, setText] = useState(DEFAULTS.text);
  const [replacement, setReplacement] = useState(DEFAULTS.replacement);

  const reset = () => {
    setPattern(DEFAULTS.pattern);
    setFlags(DEFAULTS.flags);
    setText(DEFAULTS.text);
    setReplacement(DEFAULTS.replacement);
  };

  const { regex, error, matches, replaced } = useMemo(() => {
    try {
      const built = new RegExp(pattern, flags.join(""));
      const found: MatchResult[] = [];

      if (flags.includes("g")) {
        for (const match of text.matchAll(built)) {
          found.push({
            match: match[0],
            index: match.index ?? 0,
            groups: match.slice(1),
          });
          if (found.length >= 500) break;
        }
      } else {
        const match = built.exec(text);
        if (match) {
          found.push({ match: match[0], index: match.index ?? 0, groups: match.slice(1) });
        }
      }

      const output = pattern ? text.replace(built, replacement) : text;
      return { regex: built, error: null as string | null, matches: found, replaced: output };
    } catch (caught) {
      return {
        regex: null,
        error: (caught as Error).message,
        matches: [] as MatchResult[],
        replaced: "",
      };
    }
  }, [pattern, flags, text, replacement]);

  const highlighted = useMemo(() => {
    if (!regex || matches.length === 0) return [{ text, match: false }];
    const parts: { text: string; match: boolean }[] = [];
    let cursor = 0;
    for (const item of matches) {
      if (item.index < cursor) continue;
      if (item.index > cursor) parts.push({ text: text.slice(cursor, item.index), match: false });
      parts.push({ text: item.match, match: true });
      cursor = item.index + item.match.length;
    }
    if (cursor < text.length) parts.push({ text: text.slice(cursor), match: false });
    return parts;
  }, [regex, matches, text]);

  const toggleFlag = (flag: Flag) =>
    setFlags((current) =>
      current.includes(flag) ? current.filter((item) => item !== flag) : [...current, flag],
    );

  return (
    <div className="space-y-5">
      <Card className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="min-w-0 flex-1">
            <label
              htmlFor="regex-pattern"
              className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Pattern
            </label>
            <div className="mt-1.5 flex items-stretch overflow-hidden rounded-xl border border-slate-200 bg-white focus-within:border-brand-500 dark:border-slate-800 dark:bg-slate-950/60">
              <span className="flex items-center bg-slate-50 px-3 font-mono text-sm text-slate-400 dark:bg-slate-900">
                /
              </span>
              <input
                id="regex-pattern"
                value={pattern}
                onChange={(event) => setPattern(event.target.value)}
                placeholder="enter a regular expression"
                className="min-w-0 flex-1 bg-transparent px-2 py-2.5 font-mono text-[13px] outline-none"
              />
              <span className="flex items-center bg-slate-50 px-3 font-mono text-sm text-slate-400 dark:bg-slate-900">
                /{flags.join("")}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:pt-6">
            <div className="flex flex-wrap gap-1.5">
              {FLAGS.map((flag) => {
                const active = flags.includes(flag);
                return (
                  <button
                    key={flag}
                    type="button"
                    onClick={() => toggleFlag(flag)}
                    title={flagHints[flag]}
                    aria-pressed={active}
                    className={cn(
                      "h-9 w-9 rounded-lg border font-mono text-sm transition-all",
                      active
                        ? "border-brand-400 bg-brand-50 text-brand-700 dark:border-brand-500/50 dark:bg-brand-500/10 dark:text-brand-200"
                        : "border-slate-200 text-slate-500 hover:border-slate-300 dark:border-slate-800 dark:text-slate-400",
                    )}
                  >
                    {flag}
                  </button>
                );
              })}
            </div>

            <Button variant="ghost" size="sm" onClick={reset} className="h-9 shrink-0 px-2.5">
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
          </div>
        </div>

        {error ? (
          <p className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
            {error}
          </p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {flags.map((flag) => (
              <Badge key={flag} tone="brand">
                {flag} · {flagHints[flag]}
              </Badge>
            ))}
          </div>
        )}
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <Textarea
            label="Test string"
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={10}
            className="font-sans text-[15px]"
          />
          <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm leading-relaxed dark:bg-slate-950/60">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Preview
            </span>
            <p className="mt-1.5 whitespace-pre-wrap break-words font-mono text-[13px]">
              {highlighted.map((part, index) =>
                part.match ? (
                  <mark
                    key={index}
                    className="rounded bg-brand-200/70 px-0.5 text-brand-900 dark:bg-brand-500/30 dark:text-brand-100"
                  >
                    {part.text}
                  </mark>
                ) : (
                  <span key={index}>{part.text}</span>
                ),
              )}
            </p>
          </div>
        </Card>

        <div className="space-y-5">
          <Card>
            <h3 className="text-sm font-semibold">
              Matches{" "}
              <span className="font-normal muted">
                ({formatNumber(matches.length)}
                {matches.length >= 500 ? "+" : ""})
              </span>
            </h3>
            <div className="mt-3 max-h-64 space-y-2 overflow-y-auto pr-1 scrollbar-thin">
              {matches.length === 0 ? (
                <p className="py-6 text-center text-sm muted">
                  {error ? "Fix the pattern to see matches." : "No matches found."}
                </p>
              ) : (
                matches.map((item, index) => (
                  <div
                    key={`${item.index}-${index}`}
                    className="rounded-xl border border-slate-200 p-3 dark:border-slate-800"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <code className="truncate font-mono text-[13px] font-semibold">
                        {item.match || <span className="text-slate-400">(empty)</span>}
                      </code>
                      <span className="shrink-0 text-xs muted">index {item.index}</span>
                    </div>
                    {item.groups.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {item.groups.map((group, groupIndex) => (
                          <span
                            key={groupIndex}
                            className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                          >
                            ${groupIndex + 1}: {group === undefined ? "undefined" : group}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="space-y-3">
            <Input
              label="Replacement"
              value={replacement}
              onChange={(event) => setReplacement(event.target.value)}
              hint="Use $1, $2… for capture groups."
              className="font-mono text-[13px]"
            />
            <ResultPanel label="Replaced text" value={replaced} />
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Matches" value={formatNumber(matches.length)} icon="Search" />
        <StatTile label="Flags" value={flags.length} icon="Tags" />
        <StatTile label="Pattern length" value={formatNumber(pattern.length)} icon="Hash" />
        <StatTile label="Test length" value={formatNumber(text.length)} icon="Type" />
      </div>
    </div>
  );
}
