import { useMemo, useState } from "react";
import { CalculatorShell, PrimaryResult, ResultBreakdown } from "@/components/tools/CalculatorShell";
import { NumberField, validateNumber } from "@/components/tools/NumberField";
import { Switch } from "@/components/ui/Field";
import { calculateTip, splitAmount } from "@/utils/finance";
import { formatMoney, formatPercent } from "@/utils/number";

const DEFAULTS = { bill: "85", tip: "18", people: "2" };

export function TipCalculator() {
  const [bill, setBill] = useState(DEFAULTS.bill);
  const [tip, setTip] = useState(DEFAULTS.tip);
  const [people, setPeople] = useState(DEFAULTS.people);
  const [roundUp, setRoundUp] = useState(false);

  const billField = validateNumber(bill, { nonNegative: true, label: "Bill" });
  const tipField = validateNumber(tip, { min: 0, max: 100, label: "Tip" });
  const peopleField = validateNumber(people, {
    integer: true,
    min: 1,
    max: 500,
    label: "People",
  });

  const result = useMemo(() => {
    if (billField.value === null || tipField.value === null) return null;

    const base = calculateTip(billField.value, tipField.value);
    // Rounding up applies to the grand total, then the tip absorbs the difference.
    const total = roundUp ? Math.ceil(base.total) : base.total;
    const tipAmount = total - billField.value;
    const count = peopleField.value ?? 1;

    return {
      tip: tipAmount,
      total,
      perPerson: splitAmount(total, count).shares[0] ?? total,
      tipPerPerson: tipAmount / count,
      effectivePercent: billField.value === 0 ? 0 : (tipAmount / billField.value) * 100,
      count,
    };
  }, [billField.value, tipField.value, peopleField.value, roundUp]);

  const reset = () => {
    setBill(DEFAULTS.bill);
    setTip(DEFAULTS.tip);
    setPeople(DEFAULTS.people);
    setRoundUp(false);
  };

  return (
    <CalculatorShell
      onReset={reset}
      note="Rounding up raises the grand total to the next whole amount; the extra is added to the tip."
      inputs={
        <>
          <NumberField
            label="Bill amount"
            value={bill}
            onChange={setBill}
            error={billField.error}
            prefix="$"
            presets={[25, 50, 85, 120]}
          />
          <NumberField
            label="Tip percentage"
            value={tip}
            onChange={setTip}
            error={tipField.error}
            suffix="%"
            presets={[10, 15, 18, 20, 25]}
          />
          <NumberField
            label="Split between"
            value={people}
            onChange={setPeople}
            error={peopleField.error}
            suffix="people"
            presets={[1, 2, 4, 6]}
          />
          <Switch
            checked={roundUp}
            onChange={setRoundUp}
            label="Round total up"
            description="Rounds the grand total to the next whole number."
          />
        </>
      }
      results={
        <>
          <PrimaryResult
            label="Total to pay"
            value={result ? formatMoney(result.total) : ""}
            unit="$"
            isValid={Boolean(result)}
            caption={
              result
                ? `Tip $${formatMoney(result.tip)} · $${formatMoney(
                    result.perPerson,
                  )} each for ${result.count} ${result.count === 1 ? "person" : "people"}`
                : undefined
            }
          />

          {result ? (
            <ResultBreakdown
              title="Breakdown"
              rows={[
                { label: "Bill", value: `$${formatMoney(billField.value ?? 0)}` },
                {
                  label: `Tip (${formatPercent(result.effectivePercent)})`,
                  value: `$${formatMoney(result.tip)}`,
                  copy: formatMoney(result.tip),
                },
                {
                  label: "Grand total",
                  value: `$${formatMoney(result.total)}`,
                  strong: true,
                  copy: formatMoney(result.total),
                },
                {
                  label: "Tip per person",
                  value: `$${formatMoney(result.tipPerPerson)}`,
                },
                {
                  label: "Total per person",
                  value: `$${formatMoney(result.perPerson)}`,
                  strong: true,
                  copy: formatMoney(result.perPerson),
                },
              ]}
            />
          ) : null}
        </>
      }
    />
  );
}
