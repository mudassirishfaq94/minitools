import { useMemo, useState } from "react";
import { OptionGrid, OptionToggle, TextToolShell } from "@/components/tools/TextToolShell";
import { Segmented } from "@/components/ui/Segmented";
import { countLines, sortLines, type SortOrder } from "@/utils/text";
import { formatNumber } from "@/utils/format";

const SAMPLE = `banana
Apple
cherry
item10
item2
apple
Date`;

const ORDERS: { value: SortOrder; label: string }[] = [
  { value: "asc", label: "A → Z" },
  { value: "desc", label: "Z → A" },
  { value: "length-asc", label: "Shortest" },
  { value: "length-desc", label: "Longest" },
  { value: "reverse", label: "Reverse" },
  { value: "random", label: "Shuffle" },
];

export function TextSorter() {
  const [input, setInput] = useState(SAMPLE);
  const [order, setOrder] = useState<SortOrder>("asc");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [natural, setNatural] = useState(true);
  const [removeEmpty, setRemoveEmpty] = useState(true);
  const [trimLines, setTrimLines] = useState(true);
  const [numbered, setNumbered] = useState(false);
  /** Re-runs the shuffle without changing any other input. */
  const [shuffleSeed, setShuffleSeed] = useState(0);

  const output = useMemo(() => {
    void shuffleSeed;
    const sorted = sortLines(input, {
      order,
      caseSensitive,
      natural,
      removeEmpty,
      trimLines,
    });
    if (!numbered || !sorted) return sorted;
    return sorted
      .split("\n")
      .map((line, index) => `${index + 1}. ${line}`)
      .join("\n");
  }, [input, order, caseSensitive, natural, removeEmpty, trimLines, numbered, shuffleSeed]);

  return (
    <TextToolShell
      input={input}
      onInputChange={setInput}
      output={output}
      sample={SAMPLE}
      inputLabel="Lines to sort"
      outputLabel="Sorted lines"
      placeholder="One item per line…"
      stats={[
        { label: "Lines in", value: formatNumber(input ? countLines(input) : 0) },
        { label: "Lines out", value: formatNumber(output ? countLines(output) : 0) },
      ]}
      note="Natural order sorts “item2” before “item10”, which plain alphabetical order gets wrong. Sorting is locale-aware, so accented characters group with their base letter."
      options={
        <>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold">Sort order</h3>
              {order === "random" ? (
                <button
                  type="button"
                  onClick={() => setShuffleSeed((seed) => seed + 1)}
                  className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
                >
                  Shuffle again
                </button>
              ) : null}
            </div>
            <Segmented
              options={ORDERS}
              value={order}
              onChange={setOrder}
              size="sm"
              aria-label="Sort order"
            />
          </div>

          <OptionGrid title="Options">
            <OptionToggle
              checked={caseSensitive}
              onChange={setCaseSensitive}
              label="Case sensitive"
              description="Uppercase sorts before lowercase."
            />
            <OptionToggle
              checked={natural}
              onChange={setNatural}
              label="Natural number order"
              description="item2 before item10."
            />
            <OptionToggle
              checked={trimLines}
              onChange={setTrimLines}
              label="Trim each line"
            />
            <OptionToggle
              checked={removeEmpty}
              onChange={setRemoveEmpty}
              label="Remove empty lines"
            />
            <OptionToggle
              checked={numbered}
              onChange={setNumbered}
              label="Number the results"
              description="Prefixes 1., 2., 3.…"
            />
          </OptionGrid>
        </>
      }
    />
  );
}
