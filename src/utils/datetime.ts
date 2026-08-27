/**
 * Pure date arithmetic shared by the date-based calculators.
 * All functions work on local calendar dates (time-of-day is ignored).
 */

export const MS_PER_DAY = 86_400_000;

/** Parses a `yyyy-mm-dd` value into a local midnight Date, or null. */
export function parseDateInput(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  // Reject rolled-over dates such as 2024-02-31.
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

/** Formats a Date as `yyyy-mm-dd` for date inputs. */
export function toDateInputValue(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function todayInputValue(): string {
  return toDateInputValue(new Date());
}

export interface DateBreakdown {
  years: number;
  months: number;
  days: number;
}

/**
 * Adds whole months, clamping to the end of the target month.
 * Jan 31 + 1 month → Feb 29 (leap) / Feb 28, never March 2/3.
 */
export function addMonthsClamped(date: Date, months: number): Date {
  const year = date.getFullYear();
  const month = date.getMonth() + months;
  const lastDay = new Date(year, month + 1, 0).getDate();
  return new Date(year, month, Math.min(date.getDate(), lastDay));
}

/**
 * Calendar-accurate years / months / days between two dates.
 *
 * Anchors `from` forward by whole months (clamped to real month lengths),
 * stepping back one month if it overshoots, then measures the remaining days.
 * This is correct across leap years and short months — a naive
 * "borrow the previous month's length" approach returns negative days for
 * cases such as 2024-01-31 → 2024-03-01.
 */
export function calendarDifference(from: Date, to: Date): DateBreakdown {
  if (to < from) return calendarDifference(to, from);

  let totalMonths =
    (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());

  let anchor = addMonthsClamped(from, totalMonths);
  if (anchor > to) {
    totalMonths -= 1;
    anchor = addMonthsClamped(from, totalMonths);
  }

  const days = Math.round((to.getTime() - anchor.getTime()) / MS_PER_DAY);

  return {
    years: Math.floor(totalMonths / 12),
    months: totalMonths % 12,
    days,
  };
}

/** Whole days between two dates (absolute). */
export function daysBetween(from: Date, to: Date): number {
  return Math.round(Math.abs(to.getTime() - from.getTime()) / MS_PER_DAY);
}

/** Counts weekdays (Mon–Fri) and weekend days in an inclusive range. */
export function countWeekdays(from: Date, to: Date) {
  const start = from <= to ? new Date(from) : new Date(to);
  const end = from <= to ? new Date(to) : new Date(from);

  let weekdays = 0;
  let weekends = 0;
  const cursor = new Date(start);

  while (cursor <= end) {
    const day = cursor.getDay();
    if (day === 0 || day === 6) weekends++;
    else weekdays++;
    cursor.setDate(cursor.getDate() + 1);
  }

  return { weekdays, weekends, totalDays: weekdays + weekends };
}

/** Next occurrence of a month/day anniversary on or after `reference`. */
export function nextAnniversary(from: Date, reference: Date): Date {
  const candidate = new Date(reference.getFullYear(), from.getMonth(), from.getDate());
  if (candidate < reference) {
    candidate.setFullYear(candidate.getFullYear() + 1);
  }
  return candidate;
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function formatLongDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
