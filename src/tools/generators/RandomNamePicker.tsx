import { useCallback, useMemo, useState } from "react";
import { Trophy, Users } from "lucide-react";
import { HistoryPanel, RandomizerShell } from "@/components/tools/RandomizerShell";
import { NumberField, validateNumber } from "@/components/tools/NumberField";
import { OptionToggle } from "@/components/tools/TextToolShell";
import { pickMany, shuffle } from "@/utils/random";
import { formatNumber } from "@/utils/format";

const SAMPLE = `Ava
Noah
Mia
Liam
Sofia
Ethan
Isla
Lucas`;

export function RandomNamePicker() {
  const [raw, setRaw] = useState(SAMPLE);
  const [count, setCount] = useState("1");
  const [allowRepeats, setAllowRepeats] = useState(false);
  const [removeAfterPick, setRemoveAfterPick] = useState(false);
  const [winners, setWinners] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>([]);

  const names = useMemo(
    () =>
      raw
        .split(/\r\n|\r|\n|,/)
        .map((name) => name.trim())
        .filter(Boolean),
    [raw],
  );

  const countField = validateNumber(count, {
    integer: true,
    min: 1,
    max: 100,
    label: "How many",
  });

  const notEnough =
    !allowRepeats && countField.value !== null && countField.value > names.length;
  const canPick = names.length > 0 && countField.value !== null && !notEnough;

  const pick = useCallback(() => {
    if (!canPick || countField.value === null) return;

    const picked = pickMany(names, countField.value, allowRepeats);
    setWinners(picked);
    setHistory((current) => [picked.join(", "), ...current].slice(0, 12));

    if (removeAfterPick && !allowRepeats) {
      const remaining = names.filter((name) => !picked.includes(name));
      setRaw(remaining.join("\n"));
    }
  }, [canPick, names, countField.value, allowRepeats, removeAfterPick]);

  const shuffleList = useCallback(() => {
    setRaw(shuffle(names).join("\n"));
  }, [names]);

  const reset = () => {
    setRaw(SAMPLE);
    setCount("1");
    setAllowRepeats(false);
    setRemoveAfterPick(false);
    setWinners([]);
  };

  return (
    <RandomizerShell
      onGenerate={pick}
      onReset={reset}
      generateLabel={countField.value === 1 ? "Pick a name" : "Pick names"}
      copyValue={winners.join(", ")}
      history={<HistoryPanel title="Previous draws" items={history} onClear={() => setHistory([])} />}
      note="Draws use the Web Crypto API. Picking without repeats performs a partial shuffle, so each name can only be selected once per draw."
      controls={
        <>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="name-list"
                className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                Names
              </label>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={shuffleList}
                  disabled={names.length < 2}
                  className="rounded-lg px-2 py-1 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-40 dark:hover:bg-slate-800"
                >
                  Shuffle list
                </button>
                <button
                  type="button"
                  onClick={() => setRaw("")}
                  disabled={!raw}
                  className="rounded-lg px-2 py-1 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-40 dark:hover:bg-slate-800"
                >
                  Clear
                </button>
              </div>
            </div>

            <textarea
              id="name-list"
              value={raw}
              onChange={(event) => setRaw(event.target.value)}
              rows={8}
              placeholder="One name per line, or separated by commas…"
              className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm shadow-sm outline-none transition-colors hover:border-slate-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-slate-800 dark:bg-slate-950/60"
            />

            <p className="flex items-center gap-1.5 text-xs muted">
              <Users className="h-3.5 w-3.5" />
              {formatNumber(names.length)} {names.length === 1 ? "entry" : "entries"}
            </p>
          </div>

          <NumberField
            label="How many to pick"
            value={count}
            onChange={setCount}
            error={countField.error}
            presets={[1, 2, 3, 5]}
          />

          <OptionToggle
            checked={allowRepeats}
            onChange={setAllowRepeats}
            label="Allow repeats"
            description="The same name can be drawn more than once."
          />
          <OptionToggle
            checked={removeAfterPick}
            onChange={setRemoveAfterPick}
            label="Remove winners from the list"
            description="Useful for multi-round draws."
          />

          {names.length === 0 ? (
            <p role="alert" className="text-xs font-medium text-amber-600 dark:text-amber-400">
              Add at least one name to draw from.
            </p>
          ) : notEnough ? (
            <p role="alert" className="text-xs font-medium text-rose-600 dark:text-rose-400">
              Only {formatNumber(names.length)} names available — reduce the count or allow repeats.
            </p>
          ) : null}
        </>
      }
      display={
        winners.length === 0 ? (
          <p className="text-sm muted">Press pick to draw a winner.</p>
        ) : winners.length === 1 ? (
          <div className="text-center">
            <Trophy className="mx-auto h-8 w-8 text-amber-500" />
            <p className="mt-3 text-3xl font-semibold tracking-tight break-all sm:text-4xl">
              {winners[0]}
            </p>
          </div>
        ) : (
          <ol className="w-full space-y-2">
            {winners.map((winner, index) => (
              <li
                key={`${winner}-${index}`}
                className="flex items-center gap-3 rounded-xl bg-white px-3 py-2 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1 truncate font-medium">{winner}</span>
              </li>
            ))}
          </ol>
        )
      }
    />
  );
}
