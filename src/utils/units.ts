import { unitCategories, unitCategoryMap } from "@/data/units";
import { isIncompleteNumber, parseNumber } from "@/utils/number";
import type {
  ConversionResult,
  Unit,
  UnitCategory,
  UnitCategoryId,
} from "@/types";

/* ------------------------------------------------------------------ lookup */

export function getUnitCategory(id: UnitCategoryId | string): UnitCategory | undefined {
  return unitCategoryMap.get(id as UnitCategoryId);
}

export function listUnits(categoryId: UnitCategoryId | string): Unit[] {
  return getUnitCategory(categoryId)?.units ?? [];
}

export function getUnit(
  categoryId: UnitCategoryId | string,
  unitId: string,
): Unit | undefined {
  return listUnits(categoryId).find((unit) => unit.id === unitId);
}

export function getBaseUnit(categoryId: UnitCategoryId | string): Unit | undefined {
  const category = getUnitCategory(categoryId);
  return category ? getUnit(category.id, category.base) : undefined;
}

/** Options usable by a `<select>`: `[{ value, label }]`. */
export function unitOptions(
  categoryId: UnitCategoryId | string,
): { value: string; label: string }[] {
  return listUnits(categoryId).map((unit) => ({
    value: unit.id,
    label: `${unit.name} (${unit.symbol})`,
  }));
}

/** Resolves a unit from an id, symbol or alias — used by search and parsing. */
export function findUnit(
  categoryId: UnitCategoryId | string,
  query: string,
): Unit | undefined {
  const needle = query.trim().toLowerCase();
  if (!needle) return undefined;
  return listUnits(categoryId).find(
    (unit) =>
      unit.id === needle ||
      unit.symbol.toLowerCase() === needle ||
      unit.name.toLowerCase() === needle ||
      unit.plural.toLowerCase() === needle ||
      (unit.aliases ?? []).some((alias) => alias.toLowerCase() === needle),
  );
}

/* -------------------------------------------------------------- conversion */

/** Converts a value expressed in `unit` into the category's base unit. */
export function toBaseValue(unit: Unit, value: number): number {
  if (unit.toBase) return unit.toBase(value);
  return value * (unit.factor ?? 1);
}

/** Converts a value expressed in the base unit into `unit`. */
export function fromBaseValue(unit: Unit, value: number): number {
  if (unit.fromBase) return unit.fromBase(value);
  return value / (unit.factor ?? 1);
}

/**
 * Core conversion: every pair goes value → base → target,
 * so each unit only ever needs to describe its relationship to the base.
 * Returns `null` when the inputs are unknown or not finite.
 */
export function convert(
  value: number,
  fromId: string,
  toId: string,
  categoryId: UnitCategoryId | string,
): number | null {
  if (!Number.isFinite(value)) return null;
  const from = getUnit(categoryId, fromId);
  const to = getUnit(categoryId, toId);
  if (!from || !to) return null;
  if (from.id === to.id) return value;

  const result = fromBaseValue(to, toBaseValue(from, value));
  return Number.isFinite(result) ? result : null;
}

/** Converts one value into every unit of its category (great for result tables). */
export function convertToAll(
  value: number,
  fromId: string,
  categoryId: UnitCategoryId | string,
  precision?: number,
): ConversionResult[] {
  const category = getUnitCategory(categoryId);
  if (!category) return [];
  const digits = precision ?? category.precision;

  return category.units.map((unit) => {
    const converted = convert(value, fromId, unit.id, category.id) ?? Number.NaN;
    return {
      unit,
      value: converted,
      formatted: formatUnitValue(converted, digits),
    };
  });
}

/**
 * Human-readable description of the conversion, e.g.
 * "value × 1000" or "(value − 32) × 5/9".
 */
export function describeConversion(
  fromId: string,
  toId: string,
  categoryId: UnitCategoryId | string,
): string {
  const from = getUnit(categoryId, fromId);
  const to = getUnit(categoryId, toId);
  if (!from || !to) return "";
  if (from.id === to.id) return "value";

  if (categoryId === "temperature") {
    const key = `${from.id}->${to.id}`;
    const formulas: Record<string, string> = {
      "celsius->fahrenheit": "(°C × 9/5) + 32",
      "celsius->kelvin": "°C + 273.15",
      "fahrenheit->celsius": "(°F − 32) × 5/9",
      "fahrenheit->kelvin": "((°F − 32) × 5/9) + 273.15",
      "kelvin->celsius": "K − 273.15",
      "kelvin->fahrenheit": "((K − 273.15) × 9/5) + 32",
    };
    return formulas[key] ?? "";
  }

  const ratio = (from.factor ?? 1) / (to.factor ?? 1);
  if (ratio === 1) return "value";
  return ratio > 1
    ? `value × ${formatUnitValue(ratio, 10)}`
    : `value ÷ ${formatUnitValue(1 / ratio, 10)}`;
}

/** How many `toId` fit in one `fromId` — used for "1 m = 3.28 ft" style hints. */
export function conversionRatio(
  fromId: string,
  toId: string,
  categoryId: UnitCategoryId | string,
): number | null {
  return convert(1, fromId, toId, categoryId);
}

/* -------------------------------------------------------------- formatting */

/**
 * Formats a converted number: significant digits, trimmed trailing zeros,
 * thousands separators for readable magnitudes and exponential notation
 * for very large / very small results.
 */
export function formatUnitValue(value: number, precision = 8): string {
  if (!Number.isFinite(value)) return "—";
  if (value === 0) return "0";

  const magnitude = Math.abs(value);
  if (magnitude >= 1e15 || magnitude < 1e-6) {
    return value.toExponential(Math.min(6, Math.max(2, precision - 2)));
  }

  const rounded = Number(value.toPrecision(precision));
  const decimals = countDecimals(rounded);

  return rounded.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: Math.min(decimals, 12),
    useGrouping: magnitude >= 10_000,
  });
}

function countDecimals(value: number): number {
  const text = String(value);
  if (text.includes("e") || text.includes("E")) return 12;
  const parts = text.split(".");
  return parts.length > 1 ? parts[1].length : 0;
}

/** "12.5 km" — value plus symbol. */
export function formatWithSymbol(value: number, unit: Unit, precision = 8): string {
  return `${formatUnitValue(value, precision)} ${unit.symbol}`;
}

/** "12.5 kilometers" — value plus a correctly pluralised name. */
export function formatWithName(value: number, unit: Unit, precision = 8): string {
  const formatted = formatUnitValue(value, precision);
  const name = Math.abs(value) === 1 ? unit.name : unit.plural;
  return `${formatted} ${name.toLowerCase()}`;
}

/** Parses loose user input ("1,234.5", " 42 ") into a number, or null. */
export function parseNumericInput(input: string): number | null {
  return parseNumber(input);
}

/* -------------------------------------------------------------- validation */

export interface InputValidation {
  /** Parsed value, or null when the input is empty or malformed. */
  value: number | null;
  /** Hard error — conversion cannot proceed. */
  error: string | null;
  /** Soft warning — conversion still runs (e.g. physically unusual values). */
  warning: string | null;
  /** True when the field is blank (neutral state, not an error). */
  empty: boolean;
}

/** Categories where negative amounts are not physically meaningful. */
const NON_NEGATIVE: ReadonlySet<string> = new Set([
  "length",
  "weight",
  "area",
  "volume",
  "data",
  "time",
]);

/** Absolute zero expressed in each temperature unit. */
const ABSOLUTE_ZERO: Record<string, number> = {
  celsius: -273.15,
  fahrenheit: -459.67,
  kelvin: 0,
};

/**
 * Single validation routine shared by every converter.
 * Keeps the rules in the engine rather than duplicated across eight UIs.
 */
export function validateUnitInput(
  raw: string,
  categoryId: UnitCategoryId | string,
  unitId: string,
): InputValidation {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { value: null, error: null, warning: null, empty: true };
  }

  // Treat in-progress entries ("-", ".", "1.", "1e", "2e-") as neutral, not errors.
  if (isIncompleteNumber(trimmed)) {
    return { value: null, error: null, warning: null, empty: true };
  }

  const value = parseNumericInput(trimmed);
  if (value === null) {
    return {
      value: null,
      error: "Enter a valid number — digits, an optional minus sign and one decimal point.",
      warning: null,
      empty: false,
    };
  }

  if (Math.abs(value) > 1e21) {
    return {
      value: null,
      error: "That number is too large to convert accurately.",
      warning: null,
      empty: false,
    };
  }

  if (categoryId === "temperature") {
    const floor = ABSOLUTE_ZERO[unitId];
    if (floor !== undefined && value < floor) {
      const unit = getUnit(categoryId, unitId);
      return {
        value: null,
        error: `Below absolute zero (${floor}${unit ? ` ${unit.symbol}` : ""}).`,
        warning: null,
        empty: false,
      };
    }
    return { value, error: null, warning: null, empty: false };
  }

  if (value < 0 && NON_NEGATIVE.has(String(categoryId))) {
    return {
      value,
      error: null,
      warning: "Negative values are unusual for this measurement.",
      empty: false,
    };
  }

  return { value, error: null, warning: null, empty: false };
}

/* -------------------------------------------------------------- discovery */

export interface UnitSearchHit {
  category: UnitCategory;
  unit: Unit;
}

/** Finds units by name, symbol or alias across every category. */
export function searchUnits(query: string, limit = 8): UnitSearchHit[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];

  const hits: UnitSearchHit[] = [];
  for (const category of unitCategories) {
    for (const unit of category.units) {
      const haystack = [unit.id, unit.name, unit.plural, unit.symbol, ...(unit.aliases ?? [])]
        .join(" ")
        .toLowerCase();
      if (haystack.includes(needle)) hits.push({ category, unit });
      if (hits.length >= limit) return hits;
    }
  }
  return hits;
}

/** Validates that every category's base unit exists and is neutral. */
export function validateUnitData(): string[] {
  const problems: string[] = [];
  for (const category of unitCategories) {
    const base = getUnit(category.id, category.base);
    if (!base) {
      problems.push(`${category.id}: base unit "${category.base}" is missing`);
      continue;
    }
    if (toBaseValue(base, 1) !== 1) {
      problems.push(`${category.id}: base unit "${base.id}" must convert 1 → 1`);
    }
    for (const [key, unitId] of category.defaults.entries()) {
      if (!getUnit(category.id, unitId)) {
        problems.push(`${category.id}: default[${key}] "${unitId}" is missing`);
      }
    }
  }
  return problems;
}
