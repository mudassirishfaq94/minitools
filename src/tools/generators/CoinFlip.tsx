import { useCallback, useMemo, useState } from "react";
import { HistoryPanel, RandomizerShell } from "@/components/tools/RandomizerShell";
import { NumberField, validateNumber } from "@/components/tools/NumberField";
import { StatTile } from "@/components/tools/StatTile";
import { flipCoins, type CoinSide } from "@/utils/random";
import { cn } from "@/utils/cn";
import { formatNumber } from "@/utils/format";
import { formatPercent } from "@/utils/number";

export function CoinFlip() {
  const [count, setCount] = useState("1");
  const [flips, setFlips] = useState<CoinSide[]>([]);
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  /** Cumulative tally across every flip this session. */
  const [tally, setTally] = useState({ heads: 0, tails: 0 });

  const countField = validateNumber(count, {
    integer: true,
    min: 1,
    max: 1000,
    label: "How many",
  });

  const flip = useCallback(() => {
    if (countField.value === null) return;

    setBusy(true);
    // Brief delay so repeated flips read as distinct events.
    window.setTimeout(() => {
      const results = flipCoins(countField.value!);
      setFlips(results);

      const heads = results.filter((side) => side === "heads").length;
      setTally((current) => ({
        heads: current.heads + heads,
        tails: current.tails + (results.length - heads),
      }));
      setHistory((current) =>
        [
          results.length === 1
            ? results[0]
            : `${heads}H / ${results.length - heads}T`,
          ...current,
        ].slice(0, 12),
      );
      setBusy(false);
    }, 260);
  }, [countField.value]);

  const reset = () => {
    setCount("1");
    setFlips([]);
    setTally({ heads: 0, tails: 0 });
  };

  const current = useMemo(() => {
    const heads = flips.filter((side) => side === "heads").length;
    return { heads, tails: flips.length - heads };
  }, [flips]);

  const totalFlips = tally.heads + tally.tails;

  return (
    <RandomizerShell
      onGenerate={flip}
      onReset={reset}
      generateLabel={countField.value === 1 ? "Flip coin" : "Flip coins"}
      busy={busy}
      copyValue={
        flips.length === 0
          ? ""
          : flips.length === 1
            ? flips[0]
            : `${current.heads} heads, ${current.tails} tails`
      }
      history={<HistoryPanel items={history} onClear={() => setHistory([])} compact />}
      note="Each flip is an independent 50/50 draw from the Web Crypto API. Over a session the running tally should drift towards 50% — but past flips never influence the next one."
      controls={
        <>
          <NumberField
            label="How many flips"
            value={count}
            onChange={setCount}
            error={countField.error}
            presets={[1, 2, 10, 100]}
          />

          {totalFlips > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              <StatTile
                label="Heads total"
                value={formatNumber(tally.heads)}
                hint={formatPercent((tally.heads / totalFlips) * 100, 1)}
                icon="CircleCheck"
              />
              <StatTile
                label="Tails total"
                value={formatNumber(tally.tails)}
                hint={formatPercent((tally.tails / totalFlips) * 100, 1)}
                icon="Circle"
              />
            </div>
          ) : null}
        </>
      }
      display={
        flips.length === 0 ? (
          <p className="text-sm muted">Press flip to toss the coin.</p>
        ) : flips.length === 1 ? (
          <div className="text-center">
            <div
              className={cn(
                "mx-auto flex h-28 w-28 items-center justify-center rounded-full text-2xl font-bold shadow-lg transition-transform",
                busy && "animate-spin",
                flips[0] === "heads"
                  ? "bg-gradient-to-br from-amber-300 to-amber-500 text-amber-900"
                  : "bg-gradient-to-br from-slate-300 to-slate-500 text-slate-900",
              )}
            >
              {flips[0] === "heads" ? "H" : "T"}
            </div>
            <p className="mt-4 text-2xl font-semibold capitalize tracking-tight">{flips[0]}</p>
          </div>
        ) : (
          <div className="w-full space-y-4">
            <div className="flex justify-center gap-6">
              <div className="text-center">
                <p className="text-3xl font-semibold tabular-nums text-amber-600 dark:text-amber-400">
                  {current.heads}
                </p>
                <p className="text-xs muted">Heads</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-semibold tabular-nums text-slate-500">
                  {current.tails}
                </p>
                <p className="text-xs muted">Tails</p>
              </div>
            </div>

            <div className="flex max-h-32 flex-wrap justify-center gap-1 overflow-y-auto scrollbar-thin">
              {flips.slice(0, 200).map((side, index) => (
                <span
                  key={index}
                  title={side}
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold",
                    side === "heads"
                      ? "bg-amber-200 text-amber-900 dark:bg-amber-500/30 dark:text-amber-200"
                      : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
                  )}
                >
                  {side === "heads" ? "H" : "T"}
                </span>
              ))}
              {flips.length > 200 ? (
                <span className="self-center text-xs muted">
                  +{formatNumber(flips.length - 200)} more
                </span>
              ) : null}
            </div>
          </div>
        )
      }
    />
  );
}
