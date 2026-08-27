import { useMemo, useState } from "react";
import { CalculatorShell, PrimaryResult, ResultBreakdown } from "@/components/tools/CalculatorShell";
import { NumberField, validateNumber } from "@/components/tools/NumberField";
import { Card } from "@/components/ui/Card";
import { Segmented } from "@/components/ui/Segmented";
import { amortisationSchedule, calculateLoan, yearlySummary } from "@/utils/finance";
import { formatMoney, formatPercent } from "@/utils/number";

type TermUnit = "years" | "months";

const DEFAULTS = { amount: "250000", rate: "7.5", term: "20" };

export function LoanCalculator() {
  const [amount, setAmount] = useState(DEFAULTS.amount);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [term, setTerm] = useState(DEFAULTS.term);
  const [unit, setUnit] = useState<TermUnit>("years");

  const amountField = validateNumber(amount, { nonZero: true, nonNegative: true, label: "Amount" });
  const rateField = validateNumber(rate, { min: 0, max: 100, label: "Rate" });
  const termField = validateNumber(term, {
    nonZero: true,
    min: 0,
    max: unit === "years" ? 50 : 600,
    label: "Term",
  });

  const months = termField.value === null ? null : Math.round(
    unit === "years" ? termField.value * 12 : termField.value,
  );

  const result = useMemo(() => {
    if (amountField.value === null || rateField.value === null || !months) return null;
    const loan = calculateLoan(amountField.value, rateField.value, months);
    const schedule = amortisationSchedule(amountField.value, rateField.value, months);
    return { loan, years: yearlySummary(schedule) };
  }, [amountField.value, rateField.value, months]);

  const reset = () => {
    setAmount(DEFAULTS.amount);
    setRate(DEFAULTS.rate);
    setTerm(DEFAULTS.term);
    setUnit("years");
  };

  const principalShare =
    result && result.loan.totalPayment > 0
      ? (result.loan.principal / result.loan.totalPayment) * 100
      : 0;

  return (
    <CalculatorShell
      onReset={reset}
      note="Uses the standard amortising formula EMI = P · r · (1 + r)ⁿ ÷ ((1 + r)ⁿ − 1), where r is the monthly rate and n the number of months. Assumes a fixed rate and equal monthly payments."
      inputs={
        <>
          <NumberField
            label="Loan amount"
            value={amount}
            onChange={setAmount}
            error={amountField.error}
            prefix="$"
            presets={[50000, 100000, 250000, 500000]}
          />
          <NumberField
            label="Annual interest rate"
            value={rate}
            onChange={setRate}
            error={rateField.error}
            suffix="%"
            presets={[3, 5, 7.5, 10]}
          />
          <NumberField
            label="Loan term"
            value={term}
            onChange={setTerm}
            error={termField.error}
            suffix={unit}
            presets={unit === "years" ? [5, 10, 20, 30] : [12, 36, 60, 120]}
          />
          <Segmented
            options={[
              { value: "years", label: "Years" },
              { value: "months", label: "Months" },
            ]}
            value={unit}
            onChange={setUnit}
            size="sm"
            aria-label="Term unit"
          />
        </>
      }
      results={
        <>
          <PrimaryResult
            label="Monthly payment"
            value={result ? formatMoney(result.loan.emi) : ""}
            unit="$"
            isValid={Boolean(result)}
            caption={
              result
                ? `${result.loan.months} payments · $${formatMoney(
                    result.loan.totalInterest,
                  )} total interest`
                : undefined
            }
          />

          {result ? (
            <>
              <ResultBreakdown
                title="Loan summary"
                rows={[
                  {
                    label: "Principal",
                    value: `$${formatMoney(result.loan.principal)}`,
                  },
                  {
                    label: "Total interest",
                    value: `$${formatMoney(result.loan.totalInterest)}`,
                    copy: formatMoney(result.loan.totalInterest),
                  },
                  {
                    label: "Interest as % of principal",
                    value: formatPercent(result.loan.interestPercent),
                  },
                  { label: "Number of payments", value: String(result.loan.months) },
                  {
                    label: "Total repayment",
                    value: `$${formatMoney(result.loan.totalPayment)}`,
                    strong: true,
                    copy: formatMoney(result.loan.totalPayment),
                  },
                ]}
              />

              <Card>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Principal vs interest
                </h3>
                <div className="mt-3 flex h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="bg-brand-500 transition-all duration-500"
                    style={{ width: `${principalShare}%` }}
                  />
                  <div className="flex-1 bg-amber-500 transition-all duration-500" />
                </div>
                <div className="mt-2 flex justify-between text-xs muted">
                  <span>
                    <span className="mr-1 inline-block h-2 w-2 rounded-full bg-brand-500" />
                    Principal {formatPercent(principalShare, 1)}
                  </span>
                  <span>
                    <span className="mr-1 inline-block h-2 w-2 rounded-full bg-amber-500" />
                    Interest {formatPercent(100 - principalShare, 1)}
                  </span>
                </div>
              </Card>

              {result.years.length > 1 ? (
                <Card padded={false} className="overflow-hidden">
                  <h3 className="border-b border-slate-200 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400">
                    Yearly breakdown
                  </h3>
                  <div className="max-h-72 overflow-y-auto scrollbar-thin">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                        <tr>
                          <th className="px-4 py-2 text-left font-semibold">Year</th>
                          <th className="px-3 py-2 text-right font-semibold">Principal</th>
                          <th className="px-3 py-2 text-right font-semibold">Interest</th>
                          <th className="px-4 py-2 text-right font-semibold">Balance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {result.years.map((year) => (
                          <tr key={year.year}>
                            <td className="px-4 py-2 font-medium">{year.year}</td>
                            <td className="px-3 py-2 text-right font-mono tabular-nums">
                              {formatMoney(year.principal, 0)}
                            </td>
                            <td className="px-3 py-2 text-right font-mono tabular-nums">
                              {formatMoney(year.interest, 0)}
                            </td>
                            <td className="px-4 py-2 text-right font-mono tabular-nums">
                              {formatMoney(year.balance, 0)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
