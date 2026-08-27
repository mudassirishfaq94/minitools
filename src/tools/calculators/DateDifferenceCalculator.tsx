import { useMemo, useState } from "react";
import { CalculatorShell, PrimaryResult, ResultBreakdown } from "@/components/tools/CalculatorShell";
import { StatTile } from "@/components/tools/StatTile";
import { Switch } from "@/components/ui/Field";
import {
  addDays,
  calendarDifference,
  countWeekdays,
  daysBetween,
  formatLongDate,
  parseDateInput,
  todayInputValue,
} from "@/utils/datetime";
import { formatNumber } from "@/utils/format";
import { formatDecimal } from "@/utils/number";

export function DateDifferenceCalculator() {
  const [start, setStart] = useState("2024-01-01");
  const [end, setEnd] = useState(todayInputValue);
  const [includeEnd, setIncludeEnd] = useState(false);

  const startDate = parseDateInput(start);
  const endDate = parseDateInput(end);

  const error =
    (start && !startDate && "Start date is not a valid calendar date.") ||
    (end && !endDate && "End date is not a valid calendar date.") ||
    null;

  const result = useMemo(() => {
    if (!startDate || !endDate) return null;

    // Work in chronological order so a reversed range still calculates.
    const from = startDate <= endDate ? startDate : endDate;
    const to = startDate <= endDate ? endDate : startDate;
    const reversed = startDate > endDate;

    const breakdown = calendarDifference(from, to);
    const totalDays = daysBetween(from, to) + (includeEnd ? 1 : 0);

    // Weekday counting mirrors the inclusive/exclusive choice above:
    // without "include end date" the final day is not counted.
    const countTo = includeEnd ? to : addDays(to, -1);
    const { weekdays, weekends } =
      countTo < from ? { weekdays: 0, weekends: 0 } : countWeekdays(from, countTo);

    return {
      reversed,
      breakdown,
      totalDays,
      totalWeeks: totalDays / 7,
      totalMonths: breakdown.years * 12 + breakdown.months,
      totalHours: totalDays * 24,
      totalMinutes: totalDays * 24 * 60,
      weekdays,
      weekends,
      from,
      to,
    };
  }, [startDate, endDate, includeEnd]);

  const reset = () => {
    setStart("2024-01-01");
    setEnd(todayInputValue());
    setIncludeEnd(false);
  };

  const summary = result
    ? `${result.breakdown.years}y ${result.breakdown.months}m ${result.breakdown.days}d (${formatNumber(
        result.totalDays,
      )} days)`
    : "";

  return (
    <CalculatorShell
      onReset={reset}
      note="Years, months and days are calendar-accurate: the day count borrows from the real length of the preceding month, so leap years and short months are handled correctly."
      inputs={
        <>
          <DateField label="Start date" value={start} onChange={setStart} />
          <DateField label="End date" value={end} onChange={setEnd} />

          <Switch
            checked={includeEnd}
            onChange={setIncludeEnd}
            label="Include end date"
            description="Counts both the first and last day (inclusive range)."
          />

          {error ? (
            <p role="alert" className="text-xs font-medium text-rose-600 dark:text-rose-400">
              {error}
            </p>
          ) : result?.reversed ? (
            <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
              End date is before the start date — showing the absolute difference.
            </p>
          ) : null}
        </>
      }
      results={
        <>
          <PrimaryResult
            label="Difference"
            value={
              result
                ? `${result.breakdown.years}y ${result.breakdown.months}m ${result.breakdown.days}d`
                : ""
            }
            copyValue={summary}
            isValid={Boolean(result)}
            placeholder="Pick two valid dates."
            caption={
              result ? `${formatNumber(result.totalDays)} days in total` : undefined
            }
          />

          {result ? (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <StatTile label="Days" value={formatNumber(result.totalDays)} icon="Clock" />
                <StatTile
                  label="Weeks"
                  value={formatDecimal(result.totalWeeks, 2)}
                  icon="Timer"
                />
                <StatTile label="Months" value={formatNumber(result.totalMonths)} icon="Layers" />
                <StatTile label="Hours" value={formatNumber(result.totalHours)} icon="Gauge" />
                <StatTile
                  label="Weekdays"
                  value={formatNumber(result.weekdays)}
                  hint="Mon–Fri"
                  icon="Braces"
                />
                <StatTile
                  label="Weekend days"
                  value={formatNumber(result.weekends)}
                  hint="Sat & Sun"
                  icon="Star"
                />
              </div>

              <ResultBreakdown
                title="Range"
                rows={[
                  { label: "From", value: formatLongDate(result.from) },
                  { label: "To", value: formatLongDate(result.to) },
                  {
                    label: "Exact difference",
                    value: `${result.breakdown.years}y ${result.breakdown.months}m ${result.breakdown.days}d`,
                    strong: true,
                    copy: summary,
                  },
                  { label: "Total minutes", value: formatNumber(result.totalMinutes) },
                ]}
              />
            </>
          ) : null}
        </>
      }
    />
  );
}

function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </label>
      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm shadow-sm transition-colors hover:border-slate-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:outline-none dark:border-slate-800 dark:bg-slate-950/60 dark:hover:border-slate-700"
      />
    </div>
  );
}
