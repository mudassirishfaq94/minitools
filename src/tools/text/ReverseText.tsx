import { useMemo, useState } from "react";
import { TextToolShell } from "@/components/tools/TextToolShell";
import { Segmented } from "@/components/ui/Segmented";
import { reverseText, type ReverseMode } from "@/utils/text";

const SAMPLE = `Hello world from Toolstack
Second line here
Third and final line`;

const MODES: { value: ReverseMode; label: string; description: string }[] = [
  {
    value: "characters",
    label: "Characters",
    description: "Reverses every character in the whole text.",
  },
  {
    value: "words",
    label: "Words",
    description: "Reverses word order across the entire text.",
  },
  {
    value: "lines",
    label: "Lines",
    description: "Puts the last line first, keeping each line intact.",
  },
  {
    value: "words-in-line",
    label: "Words per line",
    description: "Reverses word order within each line separately.",
  },
];

export function ReverseText() {
  const [input, setInput] = useState(SAMPLE);
  const [mode, setMode] = useState<ReverseMode>("characters");

  const output = useMemo(() => reverseText(input, mode), [input, mode]);
  const active = MODES.find((item) => item.value === mode);

  return (
    <TextToolShell
      input={input}
      onInputChange={setInput}
      output={output}
      sample={SAMPLE}
      outputLabel="Reversed text"
      note="Character reversal is emoji-safe: multi-code-unit characters such as 👨‍👩‍👧 are treated as single units rather than being split into broken fragments."
      options={
        <div className="space-y-1.5">
          <h3 className="text-sm font-semibold">Reverse by</h3>
          <Segmented
            options={MODES.map((item) => ({ value: item.value, label: item.label }))}
            value={mode}
            onChange={setMode}
            size="sm"
            aria-label="Reverse mode"
          />
          {active ? <p className="text-xs muted">{active.description}</p> : null}
        </div>
      }
    />
  );
}
