import { useMemo, useState } from "react";
import { NumberField, validateNumber } from "@/components/tools/NumberField";
import { OptionToggle, TextToolShell } from "@/components/tools/TextToolShell";
import { Segmented } from "@/components/ui/Segmented";
import { repeatText } from "@/utils/text";
import { formatNumber } from "@/utils/format";

const SAMPLE = "Toolstack";

type SeparatorId = "newline" | "space" | "comma" | "none" | "custom";

const SEPARATORS: Record<Exclude<SeparatorId, "custom">, string> = {
  newline: "\n",
  space: " ",
  comma: ", ",
  none: "",
};

/** Guards against generating an unusably large string. */
const MAX_OUTPUT = 500_000;

export function TextRepeater() {
  const [input, setInput] = useState(SAMPLE);
  const [times, setTimes] = useState("10");
  const [separatorId, setSeparatorId] = useState<SeparatorId>("newline");
  const [customSeparator, setCustomSeparator] = useState(" | ");
  const [numbered, setNumbered] = useState(false);

  const timesField = validateNumber(times, {
    integer: true,
    min: 1,
    max: 10_000,
    label: "Repeat count",
  });

  const separator =
    separatorId === "custom" ? customSeparator : SEPARATORS[separatorId];

  const { output, truncated } = useMemo(() => {
    if (timesField.value === null || !input) return { output: "", truncated: false };

    const projected = (input.length + separator.length) * timesField.value;
    if (projected > MAX_OUTPUT) {
      const safeCount = Math.max(
        1,
        Math.floor(MAX_OUTPUT / Math.max(1, input.length + separator.length)),
      );
      return {
        output: repeatText(input, { times: safeCount, separator, numbered }),
        truncated: true,
      };
    }

    return {
      output: repeatText(input, { times: timesField.value, separator, numbered }),
      truncated: false,
    };
  }, [input, timesField.value, separator, numbered]);

  return (
    <TextToolShell
      input={input}
      onInputChange={setInput}
      output={output}
      sample={SAMPLE}
      inputLabel="Text to repeat"
      outputLabel="Repeated text"
      placeholder="Enter the text you want to repeat…"
      rows={6}
      stats={[
        {
          label: "Copies",
          value: formatNumber(timesField.value ?? 0),
        },
        { label: "Output size", value: `${formatNumber(output.length)} chars` },
      ]}
      message={
        timesField.error
          ? { tone: "error", text: timesField.error }
          : truncated
            ? {
                tone: "warning",
                text: "Output was capped at 500,000 characters to keep the page responsive.",
              }
            : null
      }
      note="Useful for generating test fixtures, filler content or repeated markup. Numbering prefixes each copy with an incrementing counter."
      options={
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField
              label="Repeat count"
              value={times}
              onChange={setTimes}
              error={timesField.error}
              suffix="times"
              presets={[5, 10, 50, 100]}
            />

            <div className="space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Separator
              </span>
              <Segmented
                options={[
                  { value: "newline", label: "New line" },
                  { value: "space", label: "Space" },
                  { value: "comma", label: "Comma" },
                  { value: "none", label: "None" },
                  { value: "custom", label: "Custom" },
                ]}
                value={separatorId}
                onChange={setSeparatorId}
                size="sm"
                aria-label="Separator"
              />
              {separatorId === "custom" ? (
                <input
                  value={customSeparator}
                  onChange={(event) => setCustomSeparator(event.target.value)}
                  aria-label="Custom separator"
                  placeholder="Enter a separator…"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm shadow-sm outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-950/60"
                />
              ) : null}
            </div>
          </div>

          <OptionToggle
            checked={numbered}
            onChange={setNumbered}
            label="Number each copy"
            description="Prefixes every repetition with 1., 2., 3.…"
          />
        </>
      }
    />
  );
}
