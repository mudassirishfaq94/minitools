import { useMemo, useState } from "react";
import { CalculatorShell, PrimaryResult, ResultBreakdown } from "@/components/tools/CalculatorShell";
import { NumberField, validateNumber } from "@/components/tools/NumberField";
import { Card } from "@/components/ui/Card";
import { CopyButton } from "@/components/ui/CopyButton";
import { amortisationSchedule, calculateLoan } from "@/utils/finance";
import { formatMoney, formatPercent } from "@/utils/number";

const DEFAULTS = { amount: "100000", rate: "10", months: "12" };

/**
 * EMI calculator: same engine as the Loan calculator, but focused on the
 * month-by-month instalment schedule rather than yearly totals.
 */
export function EmiCalculator() {
  const [amount, setAmount] = useState(DEFAULTS.amount);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [months, setMonths] = useState(DEFAULTS.months);

  const amountField = validateNumber(amount, { nonZero: true, nonNegative: true, label: "Amount" });
  const rateField = validateNumber(rate, { min: 0, max: 100, label: "Rate" });
  const monthsField = validateNumber(months, {
    integer: true,
    nonZero: true,
    min: 1,
    max: 600,
    label: "Tenure",
  });

  const result = useMemo(() => {
    if (amountField.value === null || rateField.value === null || monthsField.value === null) {
      return null;
    }
    const loan = calculateLoan(amountField.value, rateField.value, monthsField.value);
    const schedule = amortisationSchedule(amountField.value, rateField.value, monthsField.value);
    return { loan, schedule };
  }, [amountField.value, rateField.value, monthsField.value]);

  const reset = () => {
    setAmount(DEFAULTS.amount);
    setRate(DEFAULTS.rate);
    setMonths(DEFAULTS.months);
  };

  const scheduleText = result
    ? result.schedule
        .map(
          (row) =>
            `${row.period}\t${formatMoney(row.payment)}\t${formatMoney(
              row.principal,
            )}\t${formatMoney(row.interest)}\t${formatMoney(row.balance)}`,
        )
        .join("\n")
    : "";

  return (
    <CalculatorShell
      onReset={reset}
      note="EMI = P · r · (1 + r)ⁿ ÷ ((1 + r)ⁿ − 1). Early instalments are mostly interest; the principal portion grows each month. The final row absorbs any rounding so the balance closes at exactly zero."
      inputs={
        <>
          <NumberField
            label="Principal amount"
            value={amount}
            onChange={setAmount}
            error={amountField.error}
            prefix="$"
            presets={[50000, 100000, 500000]}
          />
          <NumberField
            label="Annual interest rate"
            value={rate}
            onChange={setRate}
            error={rateField.error}
            suffix="%"
            presets={[8, 10, 12, 15]}
          />
          <NumberField
            label="Tenure"
            value={months}
            onChange={setMonths}
            error={monthsField.error}
            suffix="months"
            presets={[12, 24, 36, 60]}
          />
        </>
      }
      results={
        <>
          <PrimaryResult
            label="Monthly EMI"
            value={result ? formatMoney(result.loan.emi) : ""}
            unit="$"
            isValid={Boolean(result)}
            caption={
              result
                ? `Over ${result.loan.months} months · ${formatPercent(
                    result.loan.monthlyRate * 100,
                    4,
                  )} monthly rate`
                : undefined
            }
          />

          {result ? (
            <>
              <ResultBreakdown
                title="Totals"
                rows={[
                  { label: "Principal", value: `$${formatMoney(result.loan.principal)}` },
                  {
                    label: "Total interest",
                    value: `$${formatMoney(result.loan.totalInterest)}`,
                    copy: formatMoney(result.loan.totalInterest),
                  },
                  {
                    label: "Total payable",
                    value: `$${formatMoney(result.loan.totalPayment)}`,
                    strong: true,
                    copy: formatMoney(result.loan.totalPayment),
                  },
                ]}
              />

              <Card padded={false} className="overflow-hidden">
                <div className="flex items-center justify-between gap-2 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Amortisation schedule
                  </h3>
                  <CopyButton value={scheduleText} label="Copy table" />
                </div>

                <div className="max-h-80 overflow-auto scrollbar-thin">
                  <table className="w-full min-w-[30rem] text-sm">
                    <thead className="sticky top-0 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                      <tr>
                        <th className="px-4 py-2 text-left font-semibold">#</th>
                        <th className="px-3 py-2 text-right font-semibold">EMI</th>
                        <th className="px-3 py-2 text-right font-semibold">Principal</th>
                        <th className="px-3 py-2 text-right font-semibold">Interest</th>
                        <th className="px-4 py-2 text-right font-semibold">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {result.schedule.map((row) => (
                        <tr key={row.period}>
                          <td className="px-4 py-2 font-medium">{row.period}</td>
                          <td className="px-3 py-2 text-right font-mono tabular-nums">
                            {formatMoney(row.payment)}
                          </td>
                          <td className="px-3 py-2 text-right font-mono tabular-nums text-brand-600 dark:text-brand-400">
                            {formatMoney(row.principal)}
                          </td>
                          <td className="px-3 py-2 text-right font-mono tabular-nums text-amber-600 dark:text-amber-400">
                            {formatMoney(row.interest)}
                          </td>
                          <td className="px-4 py-2 text-right font-mono tabular-nums">
                            {formatMoney(row.balance)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          ) : null}
        </>
      }
    />
  );
}
