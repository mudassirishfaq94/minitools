import { useMemo, useState } from "react";
import { Eraser, FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CopyButton } from "@/components/ui/CopyButton";
import { StatTile } from "@/components/tools/StatTile";
import { NumberField, validateNumber } from "@/components/tools/NumberField";
import { cn } from "@/utils/cn";
import { formatBytes, formatNumber } from "@/utils/format";
import { countLines, countSentences, countWords, utf8Bytes } from "@/utils/text";

const SAMPLE =
  "Count every character with confidence.\n\nThis tool separates letters, digits, spaces and punctuation, tracks emoji correctly, and warns you before you exceed a platform limit.";

/** Common platform limits users write against. */
const LIMITS = [
  { label: "X / Twitter post", value: 280 },
  { label: "SMS (single)", value: 160 },
  { label: "Meta title tag", value: 60 },
  { label: "Meta description", value: 160 },
  { label: "Instagram caption", value: 2200 },
  { label: "LinkedIn post", value: 3000 },
];

export function CharacterCounter() {
  const [text, setText] = useState(SAMPLE);
  const [limit, setLimit] = useState("280");

  const limitField = validateNumber(limit, {
    integer: true,
    min: 1,
    max: 1_000_000,
    label: "Limit",
  });

  const stats = useMemo(() => {
    // Array.from counts astral characters (emoji) as one unit.
    const graphemes = Array.from(text);
    let letters = 0;
    let digits = 0;
    let spaces = 0;
    let punctuation = 0;
    let other = 0;

    for (const char of graphemes) {
      if (/\p{L}/u.test(char)) letters++;
      else if (/\p{N}/u.test(char)) digits++;
      else if (/\s/u.test(char)) spaces++;
      else if (/[\p{P}\p{S}]/u.test(char)) punctuation++;
      else other++;
    }

    const frequency = new Map<string, number>();
    for (const char of text.toLowerCase()) {
      if (/\p{L}/u.test(char)) frequency.set(char, (frequency.get(char) ?? 0) + 1);
    }

    return {
      characters: text.length,
      graphemes: graphemes.length,
      withoutSpaces: text.replace(/\s/g, "").length,
      letters,
      digits,
      spaces,
      punctuation,
      other,
      words: countWords(text),
      sentences: countSentences(text),
      lines: text ? countLines(text) : 0,
      bytes: utf8Bytes(text),
      topLetters: [...frequency.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8),
    };
  }, [text]);

  const limitValue = limitField.value;
  const remaining = limitValue === null ? null : limitValue - stats.characters;
  const usedPercent =
    limitValue === null ? 0 : Math.min(100, (stats.characters / limitValue) * 100);
  const overLimit = remaining !== null && remaining < 0;

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <label
              htmlFor="char-input"
              className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Your text
            </label>
            <div className="flex gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setText(SAMPLE)}
              >
                <FileText className="h-3.5 w-3.5" />
                Sample
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setText("")}
                disabled={!text}
              >
                <Eraser className="h-3.5 w-3.5" />
                Clear
              </Button>
              <CopyButton value={text} disabled={!text} />
            </div>
          </div>

          <textarea
            id="char-input"
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={12}
            spellCheck={false}
            placeholder="Type or paste text to analyse…"
            className={cn(
              "w-full resize-y rounded-xl border bg-white px-3.5 py-3 text-sm leading-relaxed shadow-sm transition-colors",
              "placeholder:text-slate-400 focus:ring-4 focus:outline-none dark:bg-slate-950/60",
              overLimit
                ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/10 dark:border-rose-500/60"
                : "border-slate-200 hover:border-slate-300 focus:border-brand-500 focus:ring-brand-500/10 dark:border-slate-800 dark:hover:border-slate-700",
            )}
          />
        </Card>

        <div className="space-y-4 lg:col-span-2">
          <Card className="space-y-3">
            <NumberField
              label="Character limit"
              value={limit}
              onChange={setLimit}
              error={limitField.error}
              suffix="chars"
            />

            <div className="flex flex-wrap gap-1.5">
              {LIMITS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setLimit(String(preset.value))}
                  className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {limitValue !== null ? (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="muted">Used</span>
                  <span
                    className={cn(
                      "font-semibold tabular-nums",
                      overLimit && "text-rose-600 dark:text-rose-400",
                    )}
                  >
                    {formatNumber(stats.characters)} / {formatNumber(limitValue)}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-300",
                      overLimit
                        ? "bg-rose-500"
                        : usedPercent > 85
                          ? "bg-amber-500"
                          : "bg-emerald-500",
                    )}
                    style={{ width: `${usedPercent}%` }}
                  />
                </div>
                <p
                  className={cn(
                    "text-xs font-medium",
                    overLimit ? "text-rose-600 dark:text-rose-400" : "muted",
                  )}
                  role={overLimit ? "alert" : undefined}
                >
                  {overLimit
                    ? `${formatNumber(Math.abs(remaining!))} characters over the limit.`
                    : `${formatNumber(remaining!)} characters remaining.`}
                </p>
              </div>
            ) : null}
          </Card>

          {stats.topLetters.length > 0 ? (
            <Card>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Most frequent letters
              </h3>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {stats.topLetters.map(([letter, count]) => (
                  <span
                    key={letter}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium dark:bg-slate-800"
                  >
                    <span className="font-mono">{letter}</span>
                    <span className="text-slate-400">×{count}</span>
                  </span>
                ))}
              </div>
            </Card>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatTile label="Characters" value={formatNumber(stats.characters)} icon="Hash" />
        <StatTile
          label="No spaces"
          value={formatNumber(stats.withoutSpaces)}
          icon="Type"
        />
        <StatTile label="Letters" value={formatNumber(stats.letters)} icon="CaseSensitive" />
        <StatTile label="Digits" value={formatNumber(stats.digits)} icon="Binary" />
        <StatTile label="Spaces" value={formatNumber(stats.spaces)} icon="Minus" />
        <StatTile
          label="Punctuation"
          value={formatNumber(stats.punctuation)}
          icon="Braces"
        />
        <StatTile label="Words" value={formatNumber(stats.words)} icon="Type" />
        <StatTile label="Sentences" value={formatNumber(stats.sentences)} icon="FileText" />
        <StatTile label="Lines" value={formatNumber(stats.lines)} icon="Layers" />
        <StatTile
          label="Visible units"
          value={formatNumber(stats.graphemes)}
          hint="emoji count as 1"
          icon="Sparkles"
        />
        <StatTile label="Other symbols" value={formatNumber(stats.other)} icon="Shuffle" />
        <StatTile label="UTF-8 size" value={formatBytes(stats.bytes)} icon="Gauge" />
      </div>

      <p className="rounded-xl bg-slate-50 px-4 py-3 text-xs muted dark:bg-slate-900/60">
        “Characters” counts UTF-16 code units, the same way most platforms enforce limits.
        “Visible units” counts what a reader actually sees, so an emoji counts once even
        though it may occupy two code units.
      </p>
    </div>
  );
}
