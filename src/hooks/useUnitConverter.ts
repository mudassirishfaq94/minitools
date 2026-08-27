import { useCallback, useMemo, useState } from "react";
import {
  convert,
  convertToAll,
  conversionRatio,
  describeConversion,
  formatUnitValue,
  getUnit,
  getUnitCategory,
  unitOptions,
  validateUnitInput,
} from "@/utils/units";
import type { ConversionResult, Unit, UnitCategory, UnitCategoryId } from "@/types";

interface UseUnitConverterOptions {
  initialValue?: string;
  initialFrom?: string;
  initialTo?: string;
}

interface UnitConverterState {
  category: UnitCategory | undefined;
  /** Raw input string, kept as text so partial entries like "-" stay editable. */
  input: string;
  setInput: (value: string) => void;
  /** Parsed numeric input, or null while the input is not a valid number. */
  value: number | null;
  /** Hard validation error, or null. */
  error: string | null;
  /** Soft validation warning, or null. */
  warning: string | null;
  /** True while the input is blank. */
  isEmpty: boolean;
  from: string;
  to: string;
  setFrom: (unitId: string) => void;
  setTo: (unitId: string) => void;
  swap: () => void;
  reset: () => void;
  clear: () => void;
  fromUnit: Unit | undefined;
  toUnit: Unit | undefined;
  options: { value: string; label: string }[];
  /** Converted number, or null when the input is incomplete/invalid. */
  result: number | null;
  /** Display-ready converted value. */
  formatted: string;
  /** Result plus the target unit symbol, ready to copy. */
  formattedWithSymbol: string;
  /** Same value expressed in every unit of the category. */
  all: ConversionResult[];
  /** "value × 1000" style explanation of the active conversion. */
  formula: string;
  /** "1 m = 3.28084 ft" style hint. */
  ratioLabel: string;
  isValid: boolean;
}

/**
 * Headless converter state built on top of `@/utils/units`.
 * Every converter tool shares this hook, so the maths, validation and
 * formatting exist in exactly one place.
 */
export function useUnitConverter(
  categoryId: UnitCategoryId | string,
  { initialValue = "1", initialFrom, initialTo }: UseUnitConverterOptions = {},
): UnitConverterState {
  const category = getUnitCategory(categoryId);
  const [defaultFrom, defaultTo] = category?.defaults ?? ["", ""];

  const [input, setInput] = useState(initialValue);
  const [from, setFrom] = useState(initialFrom ?? defaultFrom);
  const [to, setTo] = useState(initialTo ?? defaultTo);

  const validation = useMemo(
    () => validateUnitInput(input, categoryId, from),
    [input, categoryId, from],
  );
  const value = validation.value;

  const swap = useCallback(() => {
    setFrom(to);
    setTo(from);
  }, [from, to]);

  const reset = useCallback(() => {
    setInput(initialValue);
    setFrom(initialFrom ?? defaultFrom);
    setTo(initialTo ?? defaultTo);
  }, [initialValue, initialFrom, initialTo, defaultFrom, defaultTo]);

  const clear = useCallback(() => setInput(""), []);

  const result = useMemo(
    () => (value === null || !category ? null : convert(value, from, to, category.id)),
    [value, from, to, category],
  );

  const all = useMemo(
    () => (value === null || !category ? [] : convertToAll(value, from, category.id)),
    [value, from, category],
  );

  const ratioLabel = useMemo(() => {
    if (!category) return "";
    const fromUnit = getUnit(category.id, from);
    const toUnit = getUnit(category.id, to);
    const ratio = conversionRatio(from, to, category.id);
    if (!fromUnit || !toUnit || ratio === null) return "";
    return `1 ${fromUnit.symbol} = ${formatUnitValue(ratio, category.precision)} ${toUnit.symbol}`;
  }, [category, from, to]);

  const toUnit = category ? getUnit(category.id, to) : undefined;
  const formatted = result === null ? "" : formatUnitValue(result, category?.precision);

  return {
    category,
    input,
    setInput,
    value,
    error: validation.error,
    warning: validation.warning,
    isEmpty: validation.empty,
    from,
    to,
    setFrom,
    setTo,
    swap,
    reset,
    clear,
    fromUnit: category ? getUnit(category.id, from) : undefined,
    toUnit,
    options: category ? unitOptions(category.id) : [],
    result,
    formatted,
    formattedWithSymbol: formatted && toUnit ? `${formatted} ${toUnit.symbol}` : formatted,
    all,
    formula: category ? describeConversion(from, to, category.id) : "",
    ratioLabel,
    isValid: value !== null && result !== null,
  };
}
