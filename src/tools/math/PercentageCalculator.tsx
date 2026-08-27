import { useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Field";
import { Segmented } from "@/components/ui/Segmented";
import { ResultPanel } from "@/components/tools/ResultPanel";
import type { SegmentedOption } from "@/components/ui/Segmented";

type Mode = "percentOf" | "isWhatPercent" | "change" | "increase" | "decrease";

const modes: SegmentedOption<Mode>[] = [
  { value: "percentOf", label: "X% of Y" },
  { value: "isWhatPercent", label: "X of Y %" },
  { value: "change", label: "% change" },
  { value: "increase", label: "+ X%" },
  { value: "decrease", label: "- X%" },
];

const labels: Record<Mode, { a: string; b: string; formula: string }> = {
  percentOf: { a: "Percentage (%)", b: "Of value", formula: "(percentage ÷ 100) × value" },
  isWhatPercent: { a: "Part", b: "Whole", formula: "(part ÷ whole) × 100" },
  change: { a: "From", b: "To", formula: "((to − from) ÷ from) × 100" },
  increase: { a: "Percentage (%)", b: "Base value", formula: "value × (1 + percentage ÷ 100)" },
  decrease: { a: "Percentage (%)", b: "Base value", formula: "value × (1 − percentage ÷ 100)" },
};

function format(value: number): string {
  if (!Number.isFinite(value)) return "—";
  const rounded = Math.round(value * 1000000) / 1000000;
  return String(Number(rounded.toFixed(6)));
}

export function PercentageCalculator() {
  const [mode, setMode] = useState<Mode>("percentOf");
  const [a, setA] = useState("15");
  const [b, setB] = useState("240");

  const result = useMemo(() => {
    const first = Number(a);
    const second = Number(b);
    if (!Number.isFinite(first) || !Number.isFinite(second)) return null;

    switch (mode) {
      case "percentOf":
        return { value: (first / 100) * second, suffix: "" };
      case "isWhatPercent":
        return second === 0 ? null : { value: (first / second) * 100, suffix: "%" };
      case "change":
        return first === 0 ? null : { value: ((second - first) / first) * 100, suffix: "%" };
      case "increase":
        return { value: second * (1 + first / 100), suffix: "" };
      case "decrease":
        return { value: second * (1 - first / 100), suffix: "" };
      default:
        return null;
    }
  }, [mode, a, b]);

  const meta = labels[mode];

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold">Inputs</h2>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => {
              setMode("percentOf");
              setA("15");
              setB("240");
            }}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>
        </div>

        <Segmented options={modes} value={mode} onChange={setMode} size="sm" aria-label="Mode" />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label={meta.a}
            type="number"
            value={a}
            onChange={(event) => setA(event.target.value)}
          />
          <Input
            label={meta.b}
            type="number"
            value={b}
            onChange={(event) => setB(event.target.value)}
          />
        </div>

        <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950/60">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Formula</p>
          <p className="mt-1.5 font-mono text-[13px]">{meta.formula}</p>
        </div>
      </Card>

      <div className="space-y-5">
        <ResultPanel
          label="Result"
          value={result ? `${format(result.value)}${result.suffix}` : ""}
          placeholder={
            result === null && a && b ? "Cannot divide by zero." : "Enter values to calculate…"
          }
        >
          <div className="flex min-h-[6rem] items-center justify-center rounded-xl bg-slate-50 p-6 dark:bg-slate-950/60">
            {result ? (
              <p className="text-center text-3xl font-semibold tracking-tight tabular-nums break-all">
                {format(result.value)}
                {result.suffix}
              </p>
            ) : (
              <p className="text-sm muted">
                {a && b ? "Cannot divide by zero." : "Enter values to calculate…"}
              </p>
            )}
          </div>
        </ResultPanel>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 text-sm dark:border-slate-800 dark:bg-slate-900/60">
          <p className="font-medium">What this calculates</p>
          <p className="mt-1.5 muted">
            {mode === "percentOf" && `What is ${a || "X"}% of ${b || "Y"}?`}
            {mode === "isWhatPercent" && `${a || "X"} is what percent of ${b || "Y"}?`}
            {mode === "change" && `Percentage change from ${a || "X"} to ${b || "Y"}.`}
            {mode === "increase" && `${b || "Y"} increased by ${a || "X"}%.`}
            {mode === "decrease" && `${b || "Y"} decreased by ${a || "X"}%.`}
          </p>
        </div>
      </div>
    </div>
  );
}
