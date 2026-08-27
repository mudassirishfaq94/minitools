import { UnitConverter } from "@/components/tools/UnitConverter";

/**
 * Converter tools.
 *
 * Each one is a thin binding to the shared `UnitConverter` UI, which in turn
 * uses the `useUnitConverter` hook and the pure engine in `@/utils/units`.
 * Adding a converter means adding unit data — never new conversion logic.
 */

export function LengthConverter() {
  return <UnitConverter category="length" presets={[1, 10, 100, 1000]} />;
}

export function WeightConverter() {
  return <UnitConverter category="weight" presets={[1, 5, 10, 100]} />;
}

export function TemperatureConverter() {
  return <UnitConverter category="temperature" presets={[-40, 0, 37, 100]} />;
}

export function AreaConverter() {
  return <UnitConverter category="area" presets={[1, 100, 1000, 10000]} />;
}

export function VolumeConverter() {
  return <UnitConverter category="volume" presets={[1, 2, 10, 50]} />;
}

export function SpeedConverter() {
  return <UnitConverter category="speed" presets={[10, 50, 100, 300]} />;
}

export function TimeConverter() {
  return <UnitConverter category="time" presets={[1, 24, 60, 3600]} />;
}

export function DataStorageConverter() {
  return <UnitConverter category="data" presets={[1, 8, 512, 1024]} />;
}
