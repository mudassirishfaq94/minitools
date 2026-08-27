/**
 * Canonical numeric parsing, rounding and formatting helpers.
 * Shared by the unit engine, the calculators and any validated numeric input.
 */

/** Parses loose user input ("1,234.5", " 42 ", "1e3") into a number, or null. */
export function parseNumber(input: string): number | null {
  const cleaned = input.replace(/[\s,_]/g, "");
  if (!cleaned || !/^[-+]?\d*\.?\d+([eE][-+]?\d+)?$/.test(cleaned)) return null;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : null;
}

/**
 * True while the text looks like an in-progress entry ("-", ".", "1.", "2e-").
 * Used so inputs stay neutral instead of flashing an error mid-typing.
 */
export function isIncompleteNumber(input: string): boolean {
  const trimmed = input.trim();
  return (
    /^[-+]?$/.test(trimmed) ||
    /^[-+]?\.$/.test(trimmed) ||
    /^[-+]?\d*\.$/.test(trimmed) ||
    /^[-+]?\d*\.?\d*[eE][-+]?$/.test(trimmed)
  );
}

export function clampNumber(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Rounds to a fixed number of decimals without floating-point drift. */
export function roundTo(value: number, decimals = 2): number {
  if (!Number.isFinite(value)) return Number.NaN;
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

/** Fixed-decimal display with thousands separators: 1234.5 → "1,234.50". */
export function formatMoney(value: number, decimals = 2): string {
  if (!Number.isFinite(value)) return "—";
  return roundTo(value, decimals).toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Trims trailing zeros: 22.860 → "22.86", 5.00 → "5". */
export function formatDecimal(value: number, decimals = 2): string {
  if (!Number.isFinite(value)) return "—";
  return String(roundTo(value, decimals)).replace(/\.0+$/, "");
}

export function formatPercent(value: number, decimals = 2): string {
  if (!Number.isFinite(value)) return "—";
  return `${formatDecimal(value, decimals)}%`;
}
