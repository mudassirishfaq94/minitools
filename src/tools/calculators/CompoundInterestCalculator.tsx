import { useMemo, useState } from "react";
import { CalculatorShell, PrimaryResult, ResultBreakdown } from "@/components/tools/CalculatorShell";
import { NumberField, validateNumber } from "@/components/tools/NumberField";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Field";
import {
  calculateCompoundInterest,
  calculateSimpleInterest,
  compoundFrequencies,
  type CompoundFrequency,
} from "@/utils/finance";
import { formatMoney, formatPercent } from "@/utils/number";

const DEFAULTS = { principal: "10000", rate: "8", years: "10", contribution: "" };

export function CompoundInterestCalculator() {
  const [principal, setPrincipal] = useState(DEFAULTS.principal);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [years, setYears] = useState(DEFAULTS.years);
  const [contribution, setContribution] = useState(DEFAULTS.contribution);
  const [frequency, setFrequency] = useState<CompoundFrequency>(12);

  const principalField = validateNumber(principal, { nonNegative: true, label: "Principal" });
  const rateField = validateNumber(rate, { min: 0, max: 100, label: "Rate" });
  const yearsField = validateNumber(years, { nonZero: true, min: 0, max: 100, label: "Duration" });
  const contributionField = validateNumber(contribution, {
    nonNegative: true,
    label: "Contribution",
  });

  const result = useMemo(() => {
    if (principalField.value === null || rateField.value === null || yearsField.value === null) {
      return null;
    }
    const compound = calculateCompoundInterest(
      principalField.value,
      rateField.value,
      yearsField.value,
      frequency,
      contributionField.value ?? 0,
    );
    const simple = calculateSimpleInterest(
      principalField.value,
      rateField.value,
      yearsField.value,
    );
    return { compound, simple, advantage: compound.interest - simple.interest };
  }, [
    principalField.value,
    rateField.value,
    yearsField.value,
    frequency,
    contributionField.value,
  ]);

  const reset = () => {
    setPrincipal(DEFAULTS.principal);
    setRate(DEFAULTS.rate);
    setYears(DEFAULTS.years);
    setContribution(DEFAULTS.contribution);
    setFrequency(12);
  };

  const frequencyLabel =
    compoundFrequencies.find((item) => item.value === frequency)?.label ?? "";
  const maxBalance = result
    ? Math.max(...result.compound.breakdown.map((item) => item.balance), 1)
    : 1;

  return (
    <CalculatorShell
      onReset={reset}
      note="A = P(1 + r/n)^(nt). Regular contributions are added at the end of each compounding period, using the future value of an ordinary annuity."
      inputs={
        <>
          <NumberField
            label="Initial principal"
            value={principal}
            onChange={setPrincipal}
            error={principalField.error}
            prefix="$"
            presets={[1000, 5000, 10000, 50000]}
          />
          <NumberField
            label="Annual interest rate"
            value={rate}
            onChange={setRate}
            error={rateField.error}
            suffix="%"
            presets={[4, 6, 8, 12]}
          />
          <NumberField
            label="Duration"
            value={years}
            onChange={setYears}
            error={yearsField.error}
            suffix="years"
            presets={[5, 10, 20, 30]}
          />
          <Select
            label="Compounding frequency"
            value={String(frequency)}
            onChange={(event) => setFrequency(Number(event.target.value) as CompoundFrequency)}
            options={compoundFrequencies.map((item) => ({
              value: String(item.value),
              label: item.label,
            }))}
          />
          <NumberField
            label="Regular contribution (optional)"
            value={contribution}
            onChange={setContribution}
            error={contributionField.error}
            prefix="$"
            hint={`Added every period (${frequencyLabel.toLowerCase()}).`}
          />
        </>
      }
      results={
        <>
          <PrimaryResult
            label="Future value"
            value={result ? formatMoney(result.compound.amount) : ""}
            unit="$"
            tone="success"
            isValid={Boolean(result)}
            caption={
              result
                ? `$${formatMoney(result.compound.interest)} interest earned on $${formatMoney(
                    result.compound.principal,
                  )} invested`
                : undefined
            }
          />

          {result ? (
            <>
              <ResultBreakdown
                title="Summary"
                rows={[
                  {
                    label: "Total invested",
                    value: `$${formatMoney(result.compound.principal)}`,
                  },
                  {
                    label: "Interest earned",
                    value: `$${formatMoney(result.compound.interest)}`,
                    copy: formatMoney(result.compound.interest),
                  },
                  {
                    label: "Effective annual rate",
                    value: formatPercent(result.compound.effectiveRate, 3),
                  },
                  {
                    label: "Simple interest (for comparison)",
                    value: `$${formatMoney(result.simple.interest)}`,
                  },
                  {
                    label: "Compounding advantage",
                    value: `$${formatMoney(result.advantage)}`,
                  },
                  {
                    label: "Final balance",
                    value: `$${formatMoney(result.compound.amount)}`,
                    strong: true,
                    copy: formatMoney(result.compound.amount),
                  },
                ]}
              />

              {result.compound.breakdown.length > 0 ? (
                <Card padded={false} className="overflow-hidden">
                  <h3 className="border-b border-slate-200 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400">
                    Growth by year
                  </h3>
                  <div className="max-h-72 space-y-2 overflow-y-auto p-4 scrollbar-thin">
                    {result.compound.breakdown.map((item) => (
                      <div key={item.year} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="muted">Year {item.year}</span>
                          <span className="font-mono font-medium tabular-nums">
                            ${formatMoney(item.balance, 0)}
                          </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-emerald-500 transition-all duration-500"
                            style={{ width: `${(item.balance / maxBalance) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ) : null}
            </>
          ) : null}
        </>
      }
    />
  );
}
