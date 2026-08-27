import { useMemo, useState } from "react";
import { CalculatorShell, PrimaryResult, ResultBreakdown } from "@/components/tools/CalculatorShell";
import { NumberField, validateNumber } from "@/components/tools/NumberField";
import { Card } from "@/components/ui/Card";
import { Segmented } from "@/components/ui/Segmented";
import { calculateBmi, feetInchesToMeters, poundsToKilograms } from "@/utils/finance";
import { cn } from "@/utils/cn";
import { clampNumber, formatDecimal } from "@/utils/number";

type UnitSystem = "metric" | "imperial";

const DEFAULTS = { kg: "70", cm: "175", lb: "154", ft: "5", inch: "9" };

const BANDS = [
  { label: "Underweight", max: 18.5, color: "bg-sky-500" },
  { label: "Normal", max: 25, color: "bg-emerald-500" },
  { label: "Overweight", max: 30, color: "bg-amber-500" },
  { label: "Obese", max: 40, color: "bg-rose-500" },
];

export function BmiCalculator() {
  const [system, setSystem] = useState<UnitSystem>("metric");
  const [kg, setKg] = useState(DEFAULTS.kg);
  const [cm, setCm] = useState(DEFAULTS.cm);
  const [lb, setLb] = useState(DEFAULTS.lb);
  const [ft, setFt] = useState(DEFAULTS.ft);
  const [inch, setInch] = useState(DEFAULTS.inch);

  const kgField = validateNumber(kg, { nonZero: true, min: 1, max: 700, label: "Weight" });
  const cmField = validateNumber(cm, { nonZero: true, min: 30, max: 300, label: "Height" });
  const lbField = validateNumber(lb, { nonZero: true, min: 2, max: 1500, label: "Weight" });
  const ftField = validateNumber(ft, { min: 1, max: 9, label: "Feet" });
  const inchField = validateNumber(inch, { min: 0, max: 11.99, label: "Inches" });

  const result = useMemo(() => {
    if (system === "metric") {
      if (kgField.value === null || cmField.value === null) return null;
      return calculateBmi(kgField.value, cmField.value / 100);
    }
    if (lbField.value === null || ftField.value === null) return null;
    const meters = feetInchesToMeters(ftField.value, inchField.value ?? 0);
    if (meters <= 0) return null;
    return calculateBmi(poundsToKilograms(lbField.value), meters);
  }, [system, kgField.value, cmField.value, lbField.value, ftField.value, inchField.value]);

  const reset = () => {
    setKg(DEFAULTS.kg);
    setCm(DEFAULTS.cm);
    setLb(DEFAULTS.lb);
    setFt(DEFAULTS.ft);
    setInch(DEFAULTS.inch);
  };

  // Position on a 15–40 BMI scale.
  const markerPercent = result?.bmi
    ? clampNumber(((result.bmi - 15) / 25) * 100, 0, 100)
    : 0;

  const toImperial = (kilograms: number) => kilograms / 0.45359237;

  return (
    <CalculatorShell
      onReset={reset}
      note="BMI = weight (kg) ÷ height (m)². It is a population-level screening measure and does not distinguish muscle from fat, so it can misclassify athletes, children and older adults. It is not medical advice."
      inputs={
        <>
          <Segmented
            options={[
              { value: "metric", label: "Metric" },
              { value: "imperial", label: "Imperial" },
            ]}
            value={system}
            onChange={setSystem}
            size="sm"
            aria-label="Unit system"
          />

          {system === "metric" ? (
            <>
              <NumberField
                label="Weight"
                value={kg}
                onChange={setKg}
                error={kgField.error}
                suffix="kg"
                presets={[55, 70, 85, 100]}
              />
              <NumberField
                label="Height"
                value={cm}
                onChange={setCm}
                error={cmField.error}
                suffix="cm"
                presets={[160, 170, 175, 185]}
              />
            </>
          ) : (
            <>
              <NumberField
                label="Weight"
                value={lb}
                onChange={setLb}
                error={lbField.error}
                suffix="lb"
                presets={[120, 154, 190, 220]}
              />
              <div className="grid grid-cols-2 gap-3">
                <NumberField
                  label="Height (ft)"
                  value={ft}
                  onChange={setFt}
                  error={ftField.error}
                  suffix="ft"
                />
                <NumberField
                  label="Height (in)"
                  value={inch}
                  onChange={setInch}
                  error={inchField.error}
                  suffix="in"
                />
              </div>
            </>
          )}
        </>
      }
      results={
        <>
          <PrimaryResult
            label="Your BMI"
            value={result ? formatDecimal(result.bmi, 1) : ""}
            tone={result?.tone === "danger" ? "danger" : result?.tone === "warning" ? "warning" : "success"}
            isValid={Boolean(result)}
            copyValue={result ? `BMI ${formatDecimal(result.bmi, 1)} (${result.category})` : ""}
            caption={result ? <span className="font-medium">{result.category}</span> : undefined}
          />

          {result ? (
            <>
              <Card>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Where you sit
                </h3>

                <div className="relative mt-4">
                  <div className="flex h-3 overflow-hidden rounded-full">
                    {BANDS.map((band) => (
                      <div
                        key={band.label}
                        className={cn(band.color, "h-full")}
                        style={{
                          width: `${
                            ((band.max - (BANDS[BANDS.indexOf(band) - 1]?.max ?? 15)) / 25) * 100
                          }%`,
                        }}
                      />
                    ))}
                  </div>
                  <div
                    className="absolute -top-1 h-5 w-1 -translate-x-1/2 rounded-full bg-slate-900 ring-2 ring-white dark:bg-white dark:ring-slate-900"
                    style={{ left: `${markerPercent}%` }}
                    aria-hidden="true"
                  />
                </div>

                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
                  {BANDS.map((band) => (
                    <span key={band.label} className="inline-flex items-center gap-1.5 muted">
                      <span className={cn("h-2 w-2 rounded-full", band.color)} />
                      {band.label}
                    </span>
                  ))}
                </div>
              </Card>

              <ResultBreakdown
                title="Details"
                rows={[
                  { label: "BMI", value: formatDecimal(result.bmi, 1), strong: true },
                  { label: "Category", value: result.category },
                  {
                    label: "Healthy weight range",
                    value:
                      system === "metric"
                        ? `${result.healthyRange[0]} – ${result.healthyRange[1]} kg`
                        : `${formatDecimal(toImperial(result.healthyRange[0]), 1)} – ${formatDecimal(
                            toImperial(result.healthyRange[1]),
                            1,
                          )} lb`,
                  },
                  {
                    label:
                      result.difference === 0
                        ? "Status"
                        : result.difference > 0
                          ? "Above healthy range by"
                          : "Below healthy range by",
                    value:
                      result.difference === 0
                        ? "Within healthy range"
                        : system === "metric"
                          ? `${formatDecimal(Math.abs(result.difference), 1)} kg`
                          : `${formatDecimal(toImperial(Math.abs(result.difference)), 1)} lb`,
                  },
                ]}
              />
            </>
          ) : null}
        </>
      }
    />
  );
}
