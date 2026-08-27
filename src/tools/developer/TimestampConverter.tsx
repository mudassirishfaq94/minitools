import { useEffect, useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Field";
import { ResultPanel } from "@/components/tools/ResultPanel";
import { StatTile } from "@/components/tools/StatTile";
import { Button } from "@/components/ui/Button";
import { formatNumber } from "@/utils/format";

function toLocalInputValue(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

export function TimestampConverter() {
  const [now, setNow] = useState(() => Date.now());
  const [timestampInput, setTimestampInput] = useState(() => String(Math.floor(Date.now() / 1000)));
  const [dateInput, setDateInput] = useState(() => toLocalInputValue(new Date()));

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const parsed = useMemo(() => {
    const digits = timestampInput.trim();
    if (!/^\d+$/.test(digits)) return null;
    const value = Number(digits);
    // Values that large are already in milliseconds.
    const ms = value > 1e11 ? value : value * 1000;
    const date = new Date(ms);
    return Number.isNaN(date.getTime()) ? null : date;
  }, [timestampInput]);

  const fromDate = useMemo(() => {
    const date = new Date(dateInput);
    return Number.isNaN(date.getTime()) ? null : date;
  }, [dateInput]);

  const relative = useMemo(() => {
    if (!parsed) return "";
    const diff = Math.round((parsed.getTime() - now) / 1000);
    const absolute = Math.abs(diff);
    const units: [number, string][] = [
      [60, "second"],
      [3600, "minute"],
      [86400, "hour"],
      [2592000, "day"],
      [31536000, "month"],
      [Infinity, "year"],
    ];
    let value = absolute;
    let label = "second";
    for (const [limit, unit] of units) {
      if (absolute < limit) {
        const divisors: Record<string, number> = {
          second: 1,
          minute: 60,
          hour: 3600,
          day: 86400,
          month: 2592000,
          year: 31536000,
        };
        value = Math.round(absolute / divisors[unit]);
        label = unit;
        break;
      }
    }
    const plural = value === 1 ? label : `${label}s`;
    if (diff === 0) return "right now";
    return diff > 0 ? `in ${value} ${plural}` : `${value} ${plural} ago`;
  }, [parsed, now]);

  const reset = () => {
    setTimestampInput(String(Math.floor(Date.now() / 1000)));
    setDateInput(toLocalInputValue(new Date()));
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={reset}>
          <RotateCcw className="h-3.5 w-3.5" />
          Reset to now
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          label="Current Unix time"
          value={formatNumber(Math.floor(now / 1000))}
          hint="updates every second"
          icon="Clock"
        />
        <StatTile label="Milliseconds" value={formatNumber(now)} icon="Timer" />
        <StatTile
          label="UTC now"
          value={<span className="text-base">{new Date(now).toISOString().slice(11, 19)}</span>}
          icon="Globe"
        />
        <StatTile
          label="Local now"
          value={
            <span className="text-base">
              {new Date(now).toLocaleTimeString(undefined, { hour12: false })}
            </span>
          }
          icon="Home"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="space-y-4">
          <Input
            label="Unix timestamp"
            value={timestampInput}
            onChange={(event) => setTimestampInput(event.target.value)}
            inputMode="numeric"
            placeholder="e.g. 1700000000"
            hint="Seconds or milliseconds — both are detected automatically."
            error={timestampInput.trim() && !parsed ? "Enter digits only." : undefined}
            action={
              <Button
                variant="subtle"
                size="sm"
                className="h-7 px-2.5 text-xs"
                onClick={() => setTimestampInput(String(Math.floor(Date.now() / 1000)))}
              >
                Use now
              </Button>
            }
          />

          {parsed ? (
            <div className="space-y-3">
              <ResultPanel label="ISO 8601 (UTC)" value={parsed.toISOString()} />
              <ResultPanel label="Local date & time" value={parsed.toLocaleString()} />
              <ResultPanel label="UTC date & time" value={parsed.toUTCString()} />
              <ResultPanel label="Relative" value={relative} />
            </div>
          ) : (
            <p className="rounded-xl bg-slate-50 px-3 py-6 text-center text-sm muted dark:bg-slate-950/60">
              Enter a valid timestamp to convert it.
            </p>
          )}
        </Card>

        <Card className="space-y-4">
          <Input
            label="Date & time"
            type="datetime-local"
            value={dateInput}
            onChange={(event) => setDateInput(event.target.value)}
            hint="Converted in your local timezone."
            action={
              <Button
                variant="subtle"
                size="sm"
                className="h-7 px-2.5 text-xs"
                onClick={() => setDateInput(toLocalInputValue(new Date()))}
              >
                Use now
              </Button>
            }
          />

          {fromDate ? (
            <div className="space-y-3">
              <ResultPanel label="Unix (seconds)" value={String(Math.floor(fromDate.getTime() / 1000))} />
              <ResultPanel label="Unix (milliseconds)" value={String(fromDate.getTime())} />
              <ResultPanel label="ISO 8601" value={fromDate.toISOString()} />
            </div>
          ) : (
            <p className="rounded-xl bg-slate-50 px-3 py-6 text-center text-sm muted dark:bg-slate-950/60">
              Pick a date to convert it to a timestamp.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
