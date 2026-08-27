import type { IconName } from "@/types";

export type UnitCategoryId =
  | "length"
  | "weight"
  | "temperature"
  | "area"
  | "volume"
  | "speed"
  | "time"
  | "data";

/**
 * A single unit inside a measurement category.
 *
 * Linear units only need `factor` (how many base units one of them represents).
 * Non-linear units (temperature) provide explicit `toBase` / `fromBase` formulas.
 */
export interface Unit {
  id: string;
  /** Singular display name, e.g. "kilometer". */
  name: string;
  /** Plural display name, e.g. "kilometers". */
  plural: string;
  /** Short symbol, e.g. "km". */
  symbol: string;
  /** Multiplier relative to the category base unit (linear conversions). */
  factor?: number;
  /** Custom conversion into the base unit (overrides `factor`). */
  toBase?: (value: number) => number;
  /** Custom conversion out of the base unit (overrides `factor`). */
  fromBase?: (value: number) => number;
  /** Alternative spellings / abbreviations used by search. */
  aliases?: string[];
}

export interface UnitCategory {
  id: UnitCategoryId;
  name: string;
  description: string;
  icon: IconName;
  /** Id of the unit every conversion pivots through. */
  base: string;
  units: Unit[];
  /** Sensible [from, to] pair for a fresh converter UI. */
  defaults: [string, string];
  /** Significant digits used when formatting results. */
  precision: number;
  /** Optional clarification shown next to the converter (e.g. US vs binary units). */
  note?: string;
}

export interface ConversionResult {
  unit: Unit;
  value: number;
  formatted: string;
}

export interface ConversionInput {
  value: number;
  category: UnitCategoryId;
  from: string;
  to: string;
}
