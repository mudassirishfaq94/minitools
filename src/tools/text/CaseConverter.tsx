import { useMemo, useState } from "react";
import { Eraser, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Field";
import { ResultPanel } from "@/components/tools/ResultPanel";
import { StatTile } from "@/components/tools/StatTile";
import {
  toAlternatingCase,
  toCamelCase,
  toConstantCase,
  toKebabCase,
  toPascalCase,
  toSentenceCase,
  toSnakeCase,
  toTitleCase,
} from "@/utils/text";
import { formatNumber } from "@/utils/format";

type CaseId =
  | "upper"
  | "lower"
  | "title"
  | "sentence"
  | "camel"
  | "pascal"
  | "snake"
  | "kebab"
  | "constant"
  | "alternating";

const cases: { id: CaseId; label: string; preview: string; transform: (value: string) => string }[] =
  [
    { id: "upper", label: "UPPERCASE", preview: "HELLO WORLD", transform: (v) => v.toUpperCase() },
    { id: "lower", label: "lowercase", preview: "hello world", transform: (v) => v.toLowerCase() },
    { id: "title", label: "Title Case", preview: "Hello World", transform: toTitleCase },
    {
      id: "sentence",
      label: "Sentence case",
      preview: "Hello world",
      transform: toSentenceCase,
    },
    {
      id: "camel",
      label: "camelCase",
      preview: "helloWorld",
      transform: toCamelCase,
    },
    { id: "pascal", label: "PascalCase", preview: "HelloWorld", transform: toPascalCase },
    { id: "snake", label: "snake_case", preview: "hello_world", transform: toSnakeCase },
    { id: "kebab", label: "kebab-case", preview: "hello-world", transform: toKebabCase },
    {
      id: "constant",
      label: "CONSTANT_CASE",
      preview: "HELLO_WORLD",
      transform: toConstantCase,
    },
    {
      id: "alternating",
      label: "aLtErNaTiNg",
      preview: "hElLo",
      transform: toAlternatingCase,
    },
  ];

const SAMPLE = "hello world from toolstack";

export function CaseConverter() {
  const [text, setText] = useState(SAMPLE);
  const [active, setActive] = useState<CaseId>("title");

  const reset = () => {
    setText(SAMPLE);
    setActive("title");
  };

  const output = useMemo(() => {
    const transform = cases.find((item) => item.id === active)?.transform ?? ((v: string) => v);
    return transform(text);
  }, [text, active]);

  return (
    <div className="grid gap-5 lg:grid-cols-5">
      <Card className="lg:col-span-3">
        <Textarea
          label="Input text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Type or paste text to convert…"
          rows={8}
          className="font-sans text-[15px]"
          action={
            <div className="flex gap-1.5">
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
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={reset}>
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </Button>
            </div>
          }
        />
        <div className="mt-2 flex flex-wrap gap-1.5 text-xs muted">
          <span>{formatNumber(text.length)} characters</span>
          <span aria-hidden="true">·</span>
          <span>Converted instantly</span>
        </div>
      </Card>

      <div className="space-y-5 lg:col-span-2">
        <Card>
          <h3 className="text-sm font-semibold">Choose a case</h3>
          <div className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-1">
            {cases.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActive(item.id)}
                aria-pressed={active === item.id}
                className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left text-sm transition-all ${
                  active === item.id
                    ? "border-brand-400 bg-brand-50 text-brand-700 dark:border-brand-500/50 dark:bg-brand-500/10 dark:text-brand-200"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
                }`}
              >
                <span className="truncate font-medium">{item.label}</span>
                <span className="shrink-0 font-mono text-[11px] muted">{item.preview}</span>
              </button>
            ))}
          </div>
        </Card>

        <ResultPanel label="Output" value={output} />
        <StatTile label="Output length" value={formatNumber(output.length)} icon="Hash" />
      </div>
    </div>
  );
}
