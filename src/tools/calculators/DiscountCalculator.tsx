import { useMemo, useState } from "react";
import { CalculatorShell, PrimaryResult, ResultBreakdown } from "@/components/tools/CalculatorShell";
import { NumberField, validateNumber } from "@/components/tools/NumberField";
import { calculateDiscount } from "@/utils/finance";
import { formatMoney, formatPercent } from "@/utils/number";

const DEFAULTS = { price: "2000", discount: "25", extra: "" };

export function DiscountCalculator() {
  const [price, setPrice] = useState(DEFAULTS.price);
  const [discount, setDiscount] = useState(DEFAULTS.discount);
  const [extra, setExtra] = useState(DEFAULTS.extra);

  const priceField = validateNumber(price, { nonNegative: true, label: "Price" });
  const discountField = validateNumber(discount, { min: 0, max: 100, label: "Discount" });
  const extraField = validateNumber(extra, { min: 0, max: 100, label: "Extra discount" });

  const result = useMemo(() => {
    if (priceField.value === null || discountField.value === null) return null;

    const first = calculateDiscount(priceField.value, discountField.value);
    // A second discount always applies to the already-reduced price.
    const second =
      extraField.value && extraField.value > 0
        ? calculateDiscount(first.final, extraField.value)
        : null;

    const final = second ? second.final : first.final;
    const totalSaved = priceField.value - final;

    return {
      first,
      second,
      final,
      totalSaved,
      effectivePercent: priceField.value === 0 ? 0 : (totalSaved / priceField.value) * 100,
    };
  }, [priceField.value, discountField.value, extraField.value]);

  const reset = () => {
    setPrice(DEFAULTS.price);
    setDiscount(DEFAULTS.discount);
    setExtra(DEFAULTS.extra);
  };

  return (
    <CalculatorShell
      onReset={reset}
      note="A second discount is applied to the already-reduced price, not added to the first — so 25% then 10% is an effective 32.5%, not 35%."
      inputs={
        <>
          <NumberField
            label="Original price"
            value={price}
            onChange={setPrice}
            error={priceField.error}
            prefix="$"
            presets={[500, 1000, 2000, 5000]}
          />
          <NumberField
            label="Discount"
            value={discount}
            onChange={setDiscount}
            error={discountField.error}
            suffix="%"
            presets={[10, 20, 25, 50, 70]}
          />
          <NumberField
            label="Extra discount (optional)"
            value={extra}
            onChange={setExtra}
            error={extraField.error}
            suffix="%"
            hint="Stacked on top of the first discount."
          />
        </>
      }
      results={
        <>
          <PrimaryResult
            label="You pay"
            value={result ? formatMoney(result.final) : ""}
            unit="$"
            tone="success"
            isValid={Boolean(result)}
            caption={
              result
                ? `You save $${formatMoney(result.totalSaved)} (${formatPercent(
                    result.effectivePercent,
                  )} off)`
                : undefined
            }
          />

          {result ? (
            <ResultBreakdown
              title="Breakdown"
              rows={[
                {
                  label: "Original price",
                  value: `$${formatMoney(priceField.value ?? 0)}`,
                },
                {
                  label: `Discount (${formatPercent(discountField.value ?? 0)})`,
                  value: `− $${formatMoney(result.first.saved)}`,
                },
                ...(result.second
                  ? [
                      {
                        label: "Price after first discount",
                        value: `$${formatMoney(result.first.final)}`,
                      },
                      {
                        label: `Extra discount (${formatPercent(extraField.value ?? 0)})`,
                        value: `− $${formatMoney(result.second.saved)}`,
                      },
                    ]
                  : []),
                {
                  label: "Total saved",
                  value: `$${formatMoney(result.totalSaved)}`,
                  copy: formatMoney(result.totalSaved),
                },
                {
                  label: "Final price",
                  value: `$${formatMoney(result.final)}`,
                  strong: true,
                  copy: formatMoney(result.final),
                },
              ]}
            />
          ) : null}
        </>
      }
    />
  );
}
