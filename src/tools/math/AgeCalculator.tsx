import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Field";
import { ResultPanel } from "@/components/tools/ResultPanel";
import { StatTile } from "@/components/tools/StatTile";
import { formatNumber, pluralize } from "@/utils/format";
import {
  calendarDifference,
  daysBetween,
  nextAnniversary,
  parseDateInput,
  todayInputValue as today,
} from "@/utils/datetime";

export function AgeCalculator() {
  const [birth, setBirth] = useState("1995-06-15");
  const [asOf, setAsOf] = useState(today);

  const result = useMemo(() => {
    const from = parseDateInput(birth);
    const to = parseDateInput(asOf);
    if (!from || !to || to < from) return null;

    // Shared, leap-year-safe calendar arithmetic.
    const { years, months, days } = calendarDifference(from, to);

    const totalDays = daysBetween(from, to);
    const nextBirthday = nextAnniversary(from, to);
    const daysToBirthday = daysBetween(to, nextBirthday);

    return {
      years,
      months,
      days,
      totalDays,
      totalWeeks: Math.floor(totalDays / 7),
      totalMonths: years * 12 + months,
      totalHours: totalDays * 24,
      daysToBirthday,
      nextBirthdayAge: nextBirthday.getFullYear() - from.getFullYear(),
      weekday: from.toLocaleDateString(undefined, { weekday: "long" }),
    };
  }, [birth, asOf]);

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <Card className="space-y-4 lg:col-span-1">
        <Input
          label="Date of birth"
          type="date"
          value={birth}
          onChange={(event) => setBirth(event.target.value)}
        />
        <Input
          label="Calculate as of"
          type="date"
          value={asOf}
          onChange={(event) => setAsOf(event.target.value)}
        />
        <button
          type="button"
          onClick={() => setAsOf(today())}
          className="h-10 w-full rounded-xl border border-slate-200 text-sm font-medium transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
        >
          Reset to today
        </button>
      </Card>

      <div className="space-y-5 lg:col-span-2">
        {result ? (
          <>
            <ResultPanel
              label="Exact age"
              value={`${result.years} years, ${result.months} months, ${result.days} days`}
            >
              <div className="rounded-xl bg-slate-50 p-6 text-center dark:bg-slate-950/60">
                <p className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  {result.years}
                  <span className="text-base font-normal muted">y</span> {result.months}
                  <span className="text-base font-normal muted">m</span> {result.days}
                  <span className="text-base font-normal muted">d</span>
                </p>
                <p className="mt-1.5 text-sm muted">{pluralize(result.totalDays, "day")} in total</p>
              </div>
            </ResultPanel>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <StatTile label="Years" value={formatNumber(result.years)} icon="Cake" />
              <StatTile label="Months" value={formatNumber(result.totalMonths)} icon="Layers" />
              <StatTile label="Weeks" value={formatNumber(result.totalWeeks)} icon="Timer" />
              <StatTile label="Days" value={formatNumber(result.totalDays)} icon="Clock" />
              <StatTile label="Hours" value={formatNumber(result.totalHours)} icon="Gauge" />
              <StatTile
                label="Born on"
                value={<span className="text-base">{result.weekday}</span>}
                icon="Star"
              />
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 text-sm dark:border-slate-800 dark:bg-slate-900/60">
              {result.daysToBirthday === 0 ? (
                <p>
                  🎉 Today is the birthday — turning{" "}
                  <strong>{result.nextBirthdayAge}</strong>!
                </p>
              ) : (
                <p>
                  Next birthday in <strong>{pluralize(result.daysToBirthday, "day")}</strong> —
                  turning <strong>{result.nextBirthdayAge}</strong>.
                </p>
              )}
            </div>
          </>
        ) : (
          <ResultPanel label="Exact age" value="" placeholder="Pick a valid date of birth…" />
        )}
      </div>
    </div>
  );
}
