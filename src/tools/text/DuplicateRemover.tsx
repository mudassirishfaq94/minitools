import { useMemo, useState } from "react";
import { OptionGrid, OptionToggle, TextToolShell } from "@/components/tools/TextToolShell";
import { Segmented } from "@/components/ui/Segmented";
import { countLines, removeDuplicateLines } from "@/utils/text";
import { formatNumber } from "@/utils/format";

const SAMPLE = `apple
banana
Apple
cherry
banana
date
  cherry  
elderberry`;

type Mode = "unique" | "duplicates" | "strip-all";

export function DuplicateRemover() {
  const [input, setInput] = useState(SAMPLE);
  const [mode, setMode] = useState<Mode>("unique");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(true);
  const [sortResult, setSortResult] = useState(false);

  const result = useMemo(() => {
    const deduped = removeDuplicateLines(input, {
      caseSensitive,
      ignoreWhitespace,
      keepOnlyDuplicates: mode === "duplicates",
      removeAllOccurrences: mode === "strip-all",
    });

    if (!sortResult) return deduped;
    return {
      ...deduped,
      text: deduped.text
        .split("\n")
        .sort((a, b) => a.localeCompare(b))
        .join("\n"),
    };
  }, [input, mode, caseSensitive, ignoreWhitespace, sortResult]);

  const inputLines = input ? countLines(input) : 0;
  const outputLines = result.text ? countLines(result.text) : 0;

  return (
    <TextToolShell
      input={input}
      onInputChange={setInput}
      output={result.text}
      sample={SAMPLE}
      inputLabel="Lines"
      outputLabel={
        mode === "duplicates" ? "Duplicated lines only" : "Deduplicated lines"
      }
      placeholder="One item per line…"
      stats={[
        { label: "Lines in", value: formatNumber(inputLines) },
        { label: "Lines out", value: formatNumber(outputLines) },
        { label: "Removed", value: formatNumber(Math.max(0, inputLines - outputLines)) },
        { label: "Duplicate groups", value: formatNumber(result.duplicateGroups) },
      ]}
      note="Lines keep their original order of first appearance. “Keep only unique” drops every line that appears more than once, whereas “Remove duplicates” keeps the first of each."
      options={
        <>
          <div className="space-y-1.5">
            <h3 className="text-sm font-semibold">Mode</h3>
            <Segmented
              options={[
                { value: "unique", label: "Remove duplicates" },
                { value: "duplicates", label: "Show duplicates" },
                { value: "strip-all", label: "Keep only unique" },
              ]}
              value={mode}
              onChange={setMode}
              size="sm"
              aria-label="Deduplication mode"
            />
          </div>

          <OptionGrid title="Matching">
            <OptionToggle
              checked={caseSensitive}
              onChange={setCaseSensitive}
              label="Case sensitive"
              description="“Apple” and “apple” stay separate."
            />
            <OptionToggle
              checked={ignoreWhitespace}
              onChange={setIgnoreWhitespace}
              label="Ignore surrounding spaces"
              description="Trims before comparing."
            />
            <OptionToggle
              checked={sortResult}
              onChange={setSortResult}
              label="Sort the result"
            />
          </OptionGrid>
        </>
      }
    />
  );
}
