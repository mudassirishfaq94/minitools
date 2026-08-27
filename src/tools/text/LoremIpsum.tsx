import { useCallback, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input, Switch } from "@/components/ui/Field";
import { Segmented } from "@/components/ui/Segmented";
import { ResultPanel } from "@/components/tools/ResultPanel";
import { StatTile } from "@/components/tools/StatTile";
import { generateLorem, generateSentence } from "@/utils/text";
import { formatNumber, pluralize } from "@/utils/format";
import type { SegmentedOption } from "@/components/ui/Segmented";

type Unit = "paragraphs" | "sentences" | "words";

const units: SegmentedOption<Unit>[] = [
  { value: "paragraphs", label: "Paragraphs" },
  { value: "sentences", label: "Sentences" },
  { value: "words", label: "Words" },
];

export function LoremIpsum() {
  const [count, setCount] = useState(3);
  const [unit, setUnit] = useState<Unit>("paragraphs");
  const [startClassic, setStartClassic] = useState(true);
  const [seed, setSeed] = useState(0);

  const text = useMemo(() => {
    const safeCount = Math.max(1, Math.min(50, Math.round(count) || 1));
    let output: string;

    if (unit === "words") {
      output = generateLorem(1, Math.ceil(safeCount / 8)).split(/\s+/).slice(0, safeCount).join(" ");
      output = `${output.charAt(0).toUpperCase()}${output.slice(1)}.`;
    } else if (unit === "sentences") {
      output = Array.from({ length: safeCount }, () => generateSentence(6 + (seed % 6))).join(" ");
    } else {
      output = generateLorem(safeCount, 4);
    }

    if (startClassic && unit !== "words") {
      const classic = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";
      output = output.replace(/^[^.!?]*[.!?]/, classic);
    }
    return output;
  }, [count, unit, startClassic, seed]);

  const regenerate = useCallback(() => setSeed((value) => value + 1), []);
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <Card className="space-y-4 lg:col-span-1">
        <Input
          label="Amount"
          type="number"
          min={1}
          max={50}
          value={count}
          onChange={(event) => setCount(Number(event.target.value))}
        />

        <div className="space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Generate
          </span>
          <Segmented options={units} value={unit} onChange={setUnit} size="sm" aria-label="Unit" />
        </div>

        <Switch
          checked={startClassic}
          onChange={setStartClassic}
          label="Start with “Lorem ipsum”"
          description="Begins the text with the classic opening line."
        />

        <button
          type="button"
          onClick={regenerate}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 text-sm font-medium text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
        >
          <RefreshCw className="h-4 w-4" />
          Generate again
        </button>
      </Card>

      <div className="space-y-5 lg:col-span-2">
        <ResultPanel label="Generated text" value={text}>
          <div className="max-h-96 overflow-y-auto rounded-xl bg-slate-50 p-4 text-sm leading-relaxed break-words dark:bg-slate-950/60">
            {text ? (
              <p className="whitespace-pre-wrap">{text}</p>
            ) : (
              <span className="text-slate-400">Nothing generated yet.</span>
            )}
          </div>
        </ResultPanel>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatTile label="Words" value={formatNumber(words)} icon="Type" />
          <StatTile label="Characters" value={formatNumber(text.length)} icon="Hash" />
          <StatTile
            label="Paragraphs"
            value={formatNumber(text ? text.split(/\n{2,}/).length : 0)}
            icon="Layers"
          />
        </div>
        <p className="text-xs muted">
          {pluralize(words, "word")} of placeholder text, generated locally.
        </p>
      </div>
    </div>
  );
}
