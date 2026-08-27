import { useMemo, useState } from "react";
import { CalculatorShell, PrimaryResult, ResultBreakdown } from "@/components/tools/CalculatorShell";
import { NumberField, validateNumber } from "@/components/tools/NumberField";
import { Segmented } from "@/components/ui/Segmented";
import { calculateTax, type TaxMode } from "@/utils/finance";
import { formatMoney, formatPercent } from "@/utils/number";

const DEFAULTS = { amount: "1000", rate: "18" };

export function GstCalculator() {
  const [amount, setAmount] = useState(DEFAULTS.amount);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [mode, setMode] = useState<TaxMode>("exclusive");

  const amountField = validateNumber(amount, { nonNegative: true, label: "Amount" });
  const rateField = validateNumber(rate, { min: 0, max: 100, label: "Tax rate" });

  const result = useMemo(() => {
    if (amountField.value === null || rateField.value === null) return null;
    return calculateTax(amountField.value, rateField.value, mode);
  }, [amountField.value, rateField.value, mode]);

  const reset = () => {
    setAmount(DEFAULTS.amount);
    setRate(DEFAULTS.rate);
    setMode("exclusive");
  };

  // Split for jurisdictions that divide GST into central/state halves.
  const half = result ? result.tax / 2 : 0;

  return (
    <CalculatorShell
      onReset={reset}
      note="Add tax treats your amount as the pre-tax (net) price. Remove tax treats it as the final price and works backwards: net = gross ÷ (1 + rate)."
      inputs={
        <>
          <div className="space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Mode
            </span>
            <Segmented
              options={[
                { value: "exclusive", label: "Add tax" },
                { value: "inclusive", label: "Remove tax" },
              ]}
              value={mode}
              onChange={setMode}
              size="sm"
              aria-label="Tax mode"
            />
          </div>

          <NumberField
            label={mode === "exclusive" ? "Amount (before tax)" : "Amount (including tax)"}
            value={amount}
            onChange={setAmount}
            error={amountField.error}
            prefix="$"
            presets={[100, 500, 1000, 5000]}
          />

          <NumberField
            label="Tax rate"
            value={rate}
            onChange={setRate}
            error={rateField.error}
            suffix="%"
            presets={[5, 12, 18, 20, 28]}
            hint="Common GST/VAT rates."
          />
        </>
      }
      results={
        <>
          <PrimaryResult
            label={mode === "exclusive" ? "Total including tax" : "Net amount before tax"}
            value={result ? formatMoney(mode === "exclusive" ? result.gross : result.net) : ""}
            unit="$"
            isValid={Boolean(result)}
            caption={
              result
                ? `Tax at ${formatPercent(rateField.value ?? 0)} = $${formatMoney(result.tax)}`
                : undefined
            }
          />

          {result ? (
            <ResultBreakdown
              title="Breakdown"
              rows={[
                {
                  label: "Net (before tax)",
                  value: `$${formatMoney(result.net)}`,
                  copy: formatMoney(result.net),
                },
                {
                  label: `Tax (${formatPercent(rateField.value ?? 0)})`,
                  value: `$${formatMoney(result.tax)}`,
                  copy: formatMoney(result.tax),
                },
                { label: "CGST / half share", value: `$${formatMoney(half)}` },
                { label: "SGST / half share", value: `$${formatMoney(half)}` },
                {
                  label: "Gross (including tax)",
                  value: `$${formatMoney(result.gross)}`,
                  strong: true,
                  copy: formatMoney(result.gross),
                },
              ]}
            />
          ) : null}
        </>
      }
    />
  );
}
