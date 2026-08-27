import type { Unit, UnitCategory, UnitCategoryId } from "@/types";

/**
 * Unit definitions for the conversion system.
 *
 * Rules:
 *  - Every category pivots through exactly one `base` unit.
 *  - Linear units declare `factor` = how many base units they represent.
 *  - Non-linear units (temperature) declare explicit `toBase` / `fromBase`.
 *
 * This file holds data only — the maths lives in `src/utils/units.ts`
 * and the UI is built on top of both.
 */

// ------------------------------------------------------------------ length
const lengthUnits: Unit[] = [
  { id: "meter", name: "Meter", plural: "Meters", symbol: "m", factor: 1, aliases: ["metre"] },
  {
    id: "kilometer",
    name: "Kilometer",
    plural: "Kilometers",
    symbol: "km",
    factor: 1000,
    aliases: ["kilometre", "klick"],
  },
  {
    id: "centimeter",
    name: "Centimeter",
    plural: "Centimeters",
    symbol: "cm",
    factor: 0.01,
    aliases: ["centimetre"],
  },
  {
    id: "millimeter",
    name: "Millimeter",
    plural: "Millimeters",
    symbol: "mm",
    factor: 0.001,
    aliases: ["millimetre"],
  },
  { id: "mile", name: "Mile", plural: "Miles", symbol: "mi", factor: 1609.344 },
  { id: "yard", name: "Yard", plural: "Yards", symbol: "yd", factor: 0.9144 },
  { id: "foot", name: "Foot", plural: "Feet", symbol: "ft", factor: 0.3048, aliases: ["feet"] },
  { id: "inch", name: "Inch", plural: "Inches", symbol: "in", factor: 0.0254, aliases: ["inches"] },
];

// ------------------------------------------------------------------ weight
const weightUnits: Unit[] = [
  { id: "kilogram", name: "Kilogram", plural: "Kilograms", symbol: "kg", factor: 1, aliases: ["kilo"] },
  { id: "gram", name: "Gram", plural: "Grams", symbol: "g", factor: 0.001 },
  { id: "milligram", name: "Milligram", plural: "Milligrams", symbol: "mg", factor: 0.000001 },
  {
    id: "pound",
    name: "Pound",
    plural: "Pounds",
    symbol: "lb",
    factor: 0.45359237,
    aliases: ["lbs"],
  },
  { id: "ounce", name: "Ounce", plural: "Ounces", symbol: "oz", factor: 0.028349523125 },
  {
    id: "ton",
    name: "Tonne",
    plural: "Tonnes",
    symbol: "t",
    factor: 1000,
    aliases: ["ton", "metric ton"],
  },
];

// ------------------------------------------------------------- temperature
const temperatureUnits: Unit[] = [
  {
    id: "celsius",
    name: "Celsius",
    plural: "Degrees Celsius",
    symbol: "°C",
    toBase: (value) => value,
    fromBase: (value) => value,
    aliases: ["centigrade", "c"],
  },
  {
    id: "fahrenheit",
    name: "Fahrenheit",
    plural: "Degrees Fahrenheit",
    symbol: "°F",
    toBase: (value) => ((value - 32) * 5) / 9,
    fromBase: (value) => (value * 9) / 5 + 32,
    aliases: ["f"],
  },
  {
    id: "kelvin",
    name: "Kelvin",
    plural: "Kelvin",
    symbol: "K",
    toBase: (value) => value - 273.15,
    fromBase: (value) => value + 273.15,
    aliases: ["k"],
  },
];

// -------------------------------------------------------------------- area
const areaUnits: Unit[] = [
  {
    id: "square-meter",
    name: "Square meter",
    plural: "Square meters",
    symbol: "m²",
    factor: 1,
    aliases: ["sqm", "square metre", "m2"],
  },
  {
    id: "square-kilometer",
    name: "Square kilometer",
    plural: "Square kilometers",
    symbol: "km²",
    factor: 1_000_000,
    aliases: ["sqkm", "km2"],
  },
  {
    id: "square-mile",
    name: "Square mile",
    plural: "Square miles",
    symbol: "mi²",
    factor: 2_589_988.110336,
    aliases: ["sqmi", "mi2"],
  },
  { id: "acre", name: "Acre", plural: "Acres", symbol: "ac", factor: 4046.8564224 },
  { id: "hectare", name: "Hectare", plural: "Hectares", symbol: "ha", factor: 10_000 },
  {
    id: "square-foot",
    name: "Square foot",
    plural: "Square feet",
    symbol: "ft²",
    factor: 0.09290304,
    aliases: ["sqft", "ft2"],
  },
  {
    id: "square-inch",
    name: "Square inch",
    plural: "Square inches",
    symbol: "in²",
    factor: 0.00064516,
    aliases: ["sqin", "in2"],
  },
];

// ------------------------------------------------------------------ volume
const volumeUnits: Unit[] = [
  { id: "liter", name: "Liter", plural: "Liters", symbol: "L", factor: 1, aliases: ["litre"] },
  {
    id: "milliliter",
    name: "Milliliter",
    plural: "Milliliters",
    symbol: "mL",
    factor: 0.001,
    aliases: ["millilitre", "cc"],
  },
  {
    id: "cubic-meter",
    name: "Cubic meter",
    plural: "Cubic meters",
    symbol: "m³",
    factor: 1000,
    aliases: ["cubic metre", "m3"],
  },
  {
    id: "gallon",
    name: "Gallon (US)",
    plural: "Gallons (US)",
    symbol: "gal",
    factor: 3.785411784,
    aliases: ["us gallon"],
  },
  { id: "quart", name: "Quart (US)", plural: "Quarts (US)", symbol: "qt", factor: 0.946352946 },
  { id: "pint", name: "Pint (US)", plural: "Pints (US)", symbol: "pt", factor: 0.473176473 },
  { id: "cup", name: "Cup (US)", plural: "Cups (US)", symbol: "cup", factor: 0.2365882365 },
];

// ------------------------------------------------------------------- speed
const speedUnits: Unit[] = [
  {
    id: "meters-per-second",
    name: "Meters per second",
    plural: "Meters per second",
    symbol: "m/s",
    factor: 1,
    aliases: ["mps", "m/s"],
  },
  {
    id: "kilometers-per-hour",
    name: "Kilometers per hour",
    plural: "Kilometers per hour",
    symbol: "km/h",
    factor: 1 / 3.6,
    aliases: ["kph", "kmh", "km/h"],
  },
  {
    id: "miles-per-hour",
    name: "Miles per hour",
    plural: "Miles per hour",
    symbol: "mph",
    factor: 0.44704,
    aliases: ["mph"],
  },
  {
    id: "knot",
    name: "Knot",
    plural: "Knots",
    symbol: "kn",
    factor: 0.5144444444444445,
    aliases: ["nautical mile per hour", "kt"],
  },
];

// -------------------------------------------------------------------- time
const timeUnits: Unit[] = [
  { id: "second", name: "Second", plural: "Seconds", symbol: "s", factor: 1, aliases: ["sec"] },
  { id: "minute", name: "Minute", plural: "Minutes", symbol: "min", factor: 60 },
  { id: "hour", name: "Hour", plural: "Hours", symbol: "h", factor: 3600, aliases: ["hr"] },
  { id: "day", name: "Day", plural: "Days", symbol: "d", factor: 86_400 },
  { id: "week", name: "Week", plural: "Weeks", symbol: "wk", factor: 604_800 },
  {
    id: "month",
    name: "Month",
    plural: "Months",
    symbol: "mo",
    // Average Gregorian month: 30.436875 days.
    factor: 2_629_746,
  },
  {
    id: "year",
    name: "Year",
    plural: "Years",
    symbol: "yr",
    // Average Gregorian year: 365.2425 days.
    factor: 31_556_952,
  },
];

// ------------------------------------------------------------ data storage
const KIB = 1024;
const dataUnits: Unit[] = [
  { id: "bit", name: "Bit", plural: "Bits", symbol: "b", factor: 1 / 8 },
  { id: "byte", name: "Byte", plural: "Bytes", symbol: "B", factor: 1 },
  {
    id: "kilobyte",
    name: "Kilobyte",
    plural: "Kilobytes",
    symbol: "KB",
    factor: KIB,
    aliases: ["kib", "kibibyte"],
  },
  {
    id: "megabyte",
    name: "Megabyte",
    plural: "Megabytes",
    symbol: "MB",
    factor: KIB ** 2,
    aliases: ["mib", "mebibyte"],
  },
  {
    id: "gigabyte",
    name: "Gigabyte",
    plural: "Gigabytes",
    symbol: "GB",
    factor: KIB ** 3,
    aliases: ["gib", "gibibyte"],
  },
  {
    id: "terabyte",
    name: "Terabyte",
    plural: "Terabytes",
    symbol: "TB",
    factor: KIB ** 4,
    aliases: ["tib", "tebibyte"],
  },
  {
    id: "petabyte",
    name: "Petabyte",
    plural: "Petabytes",
    symbol: "PB",
    factor: KIB ** 5,
    aliases: ["pib", "pebibyte"],
  },
];

export const unitCategories: UnitCategory[] = [
  {
    id: "length",
    name: "Length",
    description: "Metric and imperial distances, from millimeters to miles.",
    icon: "Ruler",
    base: "meter",
    units: lengthUnits,
    defaults: ["meter", "foot"],
    precision: 8,
  },
  {
    id: "weight",
    name: "Weight",
    description: "Mass units covering everyday cooking through to shipping.",
    icon: "Scale",
    base: "kilogram",
    units: weightUnits,
    defaults: ["kilogram", "pound"],
    precision: 8,
  },
  {
    id: "temperature",
    name: "Temperature",
    description: "Celsius, Fahrenheit and Kelvin with exact offset formulas.",
    icon: "Thermometer",
    base: "celsius",
    units: temperatureUnits,
    defaults: ["celsius", "fahrenheit"],
    precision: 6,
    note: "Temperature uses offset formulas rather than simple ratios.",
  },
  {
    id: "area",
    name: "Area",
    description: "Floor plans, land parcels and map-scale surfaces.",
    icon: "Square",
    base: "square-meter",
    units: areaUnits,
    defaults: ["square-meter", "square-foot"],
    precision: 8,
  },
  {
    id: "volume",
    name: "Volume",
    description: "Liquid and cubic capacity, metric and US customary.",
    icon: "Beaker",
    base: "liter",
    units: volumeUnits,
    defaults: ["liter", "gallon"],
    precision: 8,
    note: "Gallons, quarts, pints and cups use US customary measures.",
  },
  {
    id: "speed",
    name: "Speed",
    description: "Ground, air and nautical speeds.",
    icon: "Gauge",
    base: "meters-per-second",
    units: speedUnits,
    defaults: ["kilometers-per-hour", "miles-per-hour"],
    precision: 8,
  },
  {
    id: "time",
    name: "Time",
    description: "Durations from seconds up to years.",
    icon: "Clock",
    base: "second",
    units: timeUnits,
    defaults: ["hour", "minute"],
    precision: 8,
    note: "Months and years use average Gregorian lengths (30.436875 and 365.2425 days).",
  },
  {
    id: "data",
    name: "Data Storage",
    description: "Digital sizes from single bits to petabytes.",
    icon: "Database",
    base: "byte",
    units: dataUnits,
    defaults: ["megabyte", "gigabyte"],
    precision: 10,
    note: "Uses binary multiples: 1 KB = 1024 bytes.",
  },
];

export const unitCategoryMap = new Map<UnitCategoryId, UnitCategory>(
  unitCategories.map((category) => [category.id, category]),
);

export const unitCategoryIds: UnitCategoryId[] = unitCategories.map((category) => category.id);
