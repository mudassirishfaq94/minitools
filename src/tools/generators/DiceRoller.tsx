import { useCallback, useState } from "react";
import { HistoryPanel, RandomizerShell } from "@/components/tools/RandomizerShell";
import { NumberField, validateNumber } from "@/components/tools/NumberField";
import { StatTile } from "@/components/tools/StatTile";
import { rollDice, type DiceRoll } from "@/utils/random";
import { cn } from "@/utils/cn";
import { formatNumber } from "@/utils/format";

/** Standard polyhedral dice. */
const DICE = [4, 6, 8, 10, 12, 20, 100];

/** Unicode pip faces for a six-sided die. */
const PIPS = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

export function DiceRoller() {
  const [sides, setSides] = useState(6);
  const [count, setCount] = useState("2");
  const [modifier, setModifier] = useState("0");
  const [roll, setRoll] = useState<DiceRoll | null>(null);
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const countField = validateNumber(count, {
    integer: true,
    min: 1,
    max: 100,
    label: "Number of dice",
  });
  const modifierField = validateNumber(modifier, {
    integer: true,
    min: -1000,
    max: 1000,
    label: "Modifier",
  });

  const doRoll = useCallback(() => {
    if (countField.value === null || modifierField.value === null) return;

    setBusy(true);
    window.setTimeout(() => {
      const result = rollDice(countField.value!, sides, modifierField.value!);
      setRoll(result);
      setHistory((current) =>
        [
          `${result.rolls.length}d${sides}${
            result.modifier ? (result.modifier > 0 ? `+${result.modifier}` : result.modifier) : ""
          } = ${result.total}`,
          ...current,
        ].slice(0, 12),
      );
      setBusy(false);
    }, 280);
  }, [countField.value, modifierField.value, sides]);

  const reset = () => {
    setSides(6);
    setCount("2");
    setModifier("0");
    setRoll(null);
  };

  const notation = `${countField.value ?? 1}d${sides}${
    modifierField.value
      ? modifierField.value > 0
        ? `+${modifierField.value}`
        : modifierField.value
      : ""
  }`;

  return (
    <RandomizerShell
      onGenerate={doRoll}
      onReset={reset}
      generateLabel={`Roll ${notation}`}
      busy={busy}
      copyValue={
        roll ? `${notation} = ${roll.total} (${roll.rolls.join(", ")})` : ""
      }
      history={<HistoryPanel items={history} onClear={() => setHistory([])} />}
      note="Each die is rolled independently with the Web Crypto API, so results are uniform across all faces. Standard dice notation applies: 2d6+3 means two six-sided dice plus three."
      controls={
        <>
          <div className="space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Die type
            </span>
            <div className="grid grid-cols-4 gap-2">
              {DICE.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSides(value)}
                  aria-pressed={sides === value}
                  className={cn(
                    "rounded-xl border py-2 text-sm font-semibold transition-all",
                    sides === value
                      ? "border-brand-400 bg-brand-50 text-brand-700 dark:border-brand-500/50 dark:bg-brand-500/10 dark:text-brand-200"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800",
                  )}
                >
                  d{value}
                </button>
              ))}
            </div>
          </div>

          <NumberField
            label="Number of dice"
            value={count}
            onChange={setCount}
            error={countField.error}
            presets={[1, 2, 4, 6]}
          />
          <NumberField
            label="Modifier"
            value={modifier}
            onChange={setModifier}
            error={modifierField.error}
            hint="Added to the total after rolling."
            presets={[0, 1, 3, 5]}
          />

          {roll ? (
            <div className="grid grid-cols-3 gap-2">
              <StatTile label="Lowest" value={formatNumber(Math.min(...roll.rolls))} />
              <StatTile label="Highest" value={formatNumber(Math.max(...roll.rolls))} />
              <StatTile
                label="Average"
                value={(roll.subtotal / roll.rolls.length).toFixed(1)}
              />
            </div>
          ) : null}
        </>
      }
      display={
        !roll ? (
          <p className="text-sm muted">Press roll to throw the dice.</p>
        ) : (
          <div className="w-full text-center">
            <div className="flex max-h-40 flex-wrap justify-center gap-2 overflow-y-auto scrollbar-thin">
              {roll.rolls.map((value, index) => (
                <span
                  key={index}
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl bg-white font-semibold shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800",
                    busy && "animate-pulse",
                    value === roll.sides && "ring-2 ring-emerald-400 dark:ring-emerald-500",
                    value === 1 && "ring-2 ring-rose-300 dark:ring-rose-500/50",
                  )}
                  title={`d${roll.sides}: ${value}`}
                >
                  {roll.sides === 6 ? (
                    <span className="text-2xl leading-none">{PIPS[value]}</span>
                  ) : (
                    <span className="tabular-nums">{value}</span>
                  )}
                </span>
              ))}
            </div>

            <p className="mt-5 text-4xl font-semibold tracking-tight tabular-nums sm:text-5xl">
              {roll.total}
            </p>
            <p className="mt-1 text-sm muted">
              {roll.rolls.join(" + ")}
              {roll.modifier
                ? ` ${roll.modifier > 0 ? "+" : "−"} ${Math.abs(roll.modifier)}`
                : ""}{" "}
              = {roll.total}
            </p>
          </div>
        )
      }
    />
  );
}
