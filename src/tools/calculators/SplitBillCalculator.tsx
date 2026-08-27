import { useMemo, useState } from "react";
import { Plus, Trash2, Users } from "lucide-react";
import { CalculatorShell, PrimaryResult, ResultBreakdown } from "@/components/tools/CalculatorShell";
import { NumberField, validateNumber } from "@/components/tools/NumberField";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CopyButton } from "@/components/ui/CopyButton";
import { calculateTax, calculateTip, splitAmount } from "@/utils/finance";
import { formatMoney } from "@/utils/number";

interface Person {
  id: string;
  name: string;
  /** Extra amount this person alone is responsible for. */
  extra: string;
}

const DEFAULTS = { bill: "240", tip: "10", tax: "0" };

function createPerson(index: number): Person {
  return { id: `p-${Date.now()}-${index}`, name: `Person ${index}`, extra: "" };
}

export function SplitBillCalculator() {
  const [bill, setBill] = useState(DEFAULTS.bill);
  const [tipPercent, setTipPercent] = useState(DEFAULTS.tip);
  const [taxPercent, setTaxPercent] = useState(DEFAULTS.tax);
  const [people, setPeople] = useState<Person[]>(() => [
    createPerson(1),
    createPerson(2),
    createPerson(3),
  ]);

  const billField = validateNumber(bill, { nonNegative: true, label: "Bill" });
  const tipField = validateNumber(tipPercent, { min: 0, max: 100, label: "Tip" });
  const taxField = validateNumber(taxPercent, { min: 0, max: 100, label: "Tax" });

  const result = useMemo(() => {
    if (billField.value === null || tipField.value === null || taxField.value === null) return null;
    if (people.length === 0) return null;

    const withTax = calculateTax(billField.value, taxField.value, "exclusive");
    const withTip = calculateTip(withTax.gross, tipField.value);
    const grandTotal = withTip.total;

    // Personal extras come off the top, then the rest is split evenly.
    const extras = people.map(
      (person) => validateNumber(person.extra, { nonNegative: true }).value ?? 0,
    );
    const extrasTotal = extras.reduce((sum, value) => sum + value, 0);
    const shared = Math.max(0, grandTotal - extrasTotal);
    const evenShares = splitAmount(shared, people.length).shares;

    const perPerson = people.map((person, index) => ({
      person,
      extra: extras[index],
      share: (evenShares[index] ?? 0) + extras[index],
    }));

    return {
      tax: withTax.tax,
      tip: withTip.tip,
      grandTotal,
      extrasTotal,
      shared,
      perPerson,
      summary: perPerson
        .map((entry) => `${entry.person.name}: $${formatMoney(entry.share)}`)
        .join("\n"),
    };
  }, [billField.value, tipField.value, taxField.value, people]);

  const reset = () => {
    setBill(DEFAULTS.bill);
    setTipPercent(DEFAULTS.tip);
    setTaxPercent(DEFAULTS.tax);
    setPeople([createPerson(1), createPerson(2), createPerson(3)]);
  };

  const updatePerson = (id: string, patch: Partial<Person>) =>
    setPeople((current) =>
      current.map((person) => (person.id === id ? { ...person, ...patch } : person)),
    );

  return (
    <CalculatorShell
      onReset={reset}
      note="Individual extras are deducted first, then the remaining total is split evenly. Rounding remainders are distributed so the shares always add up to the exact total."
      inputs={
        <>
          <NumberField
            label="Bill amount"
            value={bill}
            onChange={setBill}
            error={billField.error}
            prefix="$"
            presets={[100, 240, 500]}
          />
          <NumberField
            label="Tax"
            value={taxPercent}
            onChange={setTaxPercent}
            error={taxField.error}
            suffix="%"
            presets={[0, 5, 8, 10]}
          />
          <NumberField
            label="Tip"
            value={tipPercent}
            onChange={setTipPercent}
            error={tipField.error}
            suffix="%"
            presets={[0, 10, 15, 20]}
          />

          <div className="space-y-2 border-t border-slate-200 pt-4 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                People ({people.length})
              </span>
              <Button
                variant="subtle"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setPeople((current) => [...current, createPerson(current.length + 1)])}
                disabled={people.length >= 25}
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </Button>
            </div>

            <div className="space-y-2">
              {people.map((person) => (
                <div key={person.id} className="flex items-center gap-2">
                  <input
                    value={person.name}
                    onChange={(event) => updatePerson(person.id, { name: event.target.value })}
                    aria-label="Person name"
                    className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-950/60"
                  />
                  <input
                    value={person.extra}
                    onChange={(event) => updatePerson(person.id, { extra: event.target.value })}
                    inputMode="decimal"
                    placeholder="Extra"
                    aria-label={`Extra amount for ${person.name}`}
                    className="w-20 shrink-0 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm tabular-nums outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-950/60"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setPeople((current) => current.filter((item) => item.id !== person.id))
                    }
                    disabled={people.length <= 1}
                    aria-label={`Remove ${person.name}`}
                    className="shrink-0 rounded-lg p-2 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:pointer-events-none disabled:opacity-40 dark:hover:bg-rose-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      }
      results={
        <>
          <PrimaryResult
            label="Grand total"
            value={result ? formatMoney(result.grandTotal) : ""}
            unit="$"
            isValid={Boolean(result)}
            caption={
              result
                ? `Split between ${people.length} ${people.length === 1 ? "person" : "people"}`
                : undefined
            }
          />

          {result ? (
            <>
              <ResultBreakdown
                title="Bill breakdown"
                rows={[
                  { label: "Bill", value: `$${formatMoney(billField.value ?? 0)}` },
                  { label: "Tax", value: `$${formatMoney(result.tax)}` },
                  { label: "Tip", value: `$${formatMoney(result.tip)}` },
                  ...(result.extrasTotal > 0
                    ? [
                        {
                          label: "Individual extras",
                          value: `$${formatMoney(result.extrasTotal)}`,
                        },
                        { label: "Shared evenly", value: `$${formatMoney(result.shared)}` },
                      ]
                    : []),
                  {
                    label: "Grand total",
                    value: `$${formatMoney(result.grandTotal)}`,
                    strong: true,
                    copy: formatMoney(result.grandTotal),
                  },
                ]}
              />

              <Card padded={false} className="overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
                  <h3 className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    <Users className="h-3.5 w-3.5" />
                    Who pays what
                  </h3>
                  <CopyButton value={result.summary} label="Copy all" />
                </div>
                <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                  {result.perPerson.map((entry) => (
                    <li
                      key={entry.person.id}
                      className="flex items-center justify-between gap-3 px-4 py-2.5"
                    >
                      <span className="min-w-0 flex-1 truncate text-sm font-medium">
                        {entry.person.name}
                        {entry.extra > 0 ? (
                          <span className="ml-1.5 text-xs muted">
                            (incl. ${formatMoney(entry.extra)} extra)
                          </span>
                        ) : null}
                      </span>
                      <span className="shrink-0 font-mono text-sm font-semibold tabular-nums">
                        ${formatMoney(entry.share)}
                      </span>
                      <CopyButton
                        iconOnly
                        value={formatMoney(entry.share)}
                        label={`Copy ${entry.person.name} share`}
                        className="h-8 w-8 shrink-0"
                      />
                    </li>
                  ))}
                </ul>
              </Card>
            </>
          ) : null}
        </>
      }
    />
  );
}
