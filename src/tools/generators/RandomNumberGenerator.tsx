import { useCallback, useState } from "react";
import { HistoryPanel, RandomizerShell } from "@/components/tools/RandomizerShell";
import { NumberField, validateNumber } from "@/components/tools/NumberField";
import { OptionToggle } from "@/components/tools/TextToolShell";
import { Segmented } from "@/components/ui/Segmented";
import { secureRandomDecimal, secureRandomInt, uniqueIntegers } from "@/utils/random";
import { formatNumber } from "@/utils/format";

type Kind = "integer" | "decimal";

const DEFAULTS = { min: "1", max: "100", count: "1", decimals: "2" };

export function RandomNumberGenerator() {
  const [kind, setKind] = useState<Kind>("integer");
  const [min, setMin] = useState(DEFAULTS.min);
  const [max, setMax] = useState(DEFAULTS.max);
  const [count, setCount] = useState(DEFAULTS.count);
  const [decimals, setDecimals] = useState(DEFAULTS.decimals);
  const [unique, setUnique] = useState(false);
  const [sorted, setSorted] = useState(false);
  const [results, setResults] = useState<number[]>([]);
  const [history, setHistory] = useState<string[]>([]);

  const minField = validateNumber(min, { label: "Minimum" });
  const maxField = validateNumber(max, { label: "Maximum" });
  const countField = validateNumber(count, {
    integer: true,
    min: 1,
    max: 1000,
    label: "How many",
  });
  const decimalsField = validateNumber(decimals, {
    integer: true,
    min: 0,
    max: 10,
    label: "Decimal places",
  });

  const low = minField.value;
  const high = maxField.value;
  const rangeInverted = low !== null && high !== null && low > high;
  const rangeSize = low !== null && high !== null ? Math.floor(high) - Math.ceil(low) + 1 : 0;
  const notEnoughUnique =
    unique && kind === "integer" && countField.value !== null && countField.value > rangeSize;

  const canGenerate =
    low !== null &&
    high !== null &&
    countField.value !== null &&
    !rangeInverted &&
    !notEnoughUnique;

  const generate = useCallback(() => {
    if (!canGenerate || low === null || high === null || countField.value === null) return;

    let values: number[];
    if (kind === "decimal") {
      values = Array.from({ length: countField.value }, () =>
        secureRandomDecimal(low, high, decimalsField.value ?? 2),
      );
    } else if (unique) {
      values = uniqueIntegers(low, high, countField.value);
    } else {
      values = Array.from({ length: countField.value }, () => secureRandomInt(low, high));
    }

    if (sorted) values.sort((a, b) => a - b);

    setResults(values);
    setHistory((current) => [values.join(", "), ...current].slice(0, 12));
  }, [canGenerate, low, high, countField.value, kind, decimalsField.value, unique, sorted]);

  const reset = () => {
    setKind("integer");
    setMin(DEFAULTS.min);
    setMax(DEFAULTS.max);
    setCount(DEFAULTS.count);
    setDecimals(DEFAULTS.decimals);
    setUnique(false);
    setSorted(false);
    setResults([]);
  };

  const copyValue = results.join(", ");

  return (
    <RandomizerShell
      onGenerate={generate}
      onReset={reset}
      generateLabel="Generate numbers"
      copyValue={copyValue}
      history={
        <HistoryPanel items={history} onClear={() => setHistory([])} />
      }
      note="Numbers come from the Web Crypto API using rejection sampling, so every value in the range is equally likely — unlike Math.random() scaled with a modulo, which subtly favours lower values."
      controls={
        <>
          <Segmented
            options={[
              { value: "integer", label: "Whole numbers" },
              { value: "decimal", label: "Decimals" },
            ]}
            value={kind}
            onChange={setKind}
            size="sm"
            aria-label="Number type"
          />

          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="Minimum"
              value={min}
              onChange={setMin}
              error={minField.error}
              presets={[0, 1, 100]}
            />
            <NumberField
              label="Maximum"
              value={max}
              onChange={setMax}
              error={maxField.error}
              presets={[10, 100, 1000]}
            />
          </div>

          <NumberField
            label="How many"
            value={count}
            onChange={setCount}
            error={countField.error}
            presets={[1, 5, 10, 50]}
          />

          {kind === "decimal" ? (
            <NumberField
              label="Decimal places"
              value={decimals}
              onChange={setDecimals}
              error={decimalsField.error}
            />
          ) : (
            <OptionToggle
              checked={unique}
              onChange={setUnique}
              label="No repeats"
              description="Every number appears at most once."
            />
          )}

          <OptionToggle
            checked={sorted}
            onChange={setSorted}
            label="Sort results"
            description="Ascending order."
          />

          {rangeInverted ? (
            <p role="alert" className="text-xs font-medium text-rose-600 dark:text-rose-400">
              Minimum must be less than or equal to maximum.
            </p>
          ) : notEnoughUnique ? (
            <p role="alert" className="text-xs font-medium text-rose-600 dark:text-rose-400">
              Only {formatNumber(rangeSize)} unique values exist in this range — reduce the count or
              widen the range.
            </p>
          ) : null}
        </>
      }
      display={
        results.length === 0 ? (
          <p className="text-sm muted">Press generate to draw your numbers.</p>
        ) : results.length === 1 ? (
          <p className="text-5xl font-semibold tracking-tight tabular-nums break-all sm:text-6xl">
            {results[0].toLocaleString("en-US", { maximumFractionDigits: 10 })}
          </p>
        ) : (
          <div className="flex flex-wrap justify-center gap-2">
            {results.map((value, index) => (
              <span
                key={`${value}-${index}`}
                className="rounded-lg bg-white px-3 py-1.5 font-mono text-sm font-semibold tabular-nums shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800"
              >
                {value.toLocaleString("en-US", { maximumFractionDigits: 10 })}
              </span>
            ))}
          </div>
        )
      }
    />
  );
}
