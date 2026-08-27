import { useCallback, useEffect, useState } from "react";
import { Delete } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { CopyButton } from "@/components/ui/CopyButton";
import { cn } from "@/utils/cn";
import { formatDecimal, roundTo } from "@/utils/number";

type Operator = "+" | "-" | "×" | "÷";

const OPERATORS: Record<Operator, (a: number, b: number) => number> = {
  "+": (a, b) => a + b,
  "-": (a, b) => a - b,
  "×": (a, b) => a * b,
  "÷": (a, b) => a / b,
};

interface HistoryEntry {
  expression: string;
  result: string;
}

export function BasicCalculator() {
  const [display, setDisplay] = useState("0");
  const [accumulator, setAccumulator] = useState<number | null>(null);
  const [operator, setOperator] = useState<Operator | null>(null);
  /** True right after an operator, so the next digit starts a fresh operand. */
  const [awaitingOperand, setAwaitingOperand] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  const clearAll = useCallback(() => {
    setDisplay("0");
    setAccumulator(null);
    setOperator(null);
    setAwaitingOperand(false);
    setError(null);
  }, []);

  const inputDigit = useCallback(
    (digit: string) => {
      setError(null);
      setDisplay((current) => {
        if (awaitingOperand || current === "0") return digit;
        if (current.replace(/[-.]/g, "").length >= 15) return current;
        return current + digit;
      });
      setAwaitingOperand(false);
    },
    [awaitingOperand],
  );

  const inputDecimal = useCallback(() => {
    setError(null);
    setDisplay((current) => {
      if (awaitingOperand) return "0.";
      return current.includes(".") ? current : `${current}.`;
    });
    setAwaitingOperand(false);
  }, [awaitingOperand]);

  const backspace = useCallback(() => {
    setError(null);
    setDisplay((current) => {
      if (awaitingOperand) return current;
      const next = current.slice(0, -1);
      return next === "" || next === "-" ? "0" : next;
    });
  }, [awaitingOperand]);

  const toggleSign = useCallback(() => {
    setDisplay((current) =>
      current.startsWith("-") ? current.slice(1) : current === "0" ? current : `-${current}`,
    );
  }, []);

  const applyPercent = useCallback(() => {
    setDisplay((current) => {
      const value = Number(current) / 100;
      return String(roundTo(value, 12));
    });
  }, []);

  /** Applies any pending operator, or stores the first operand. */
  const performOperation = useCallback(
    (nextOperator: Operator | null) => {
      const current = Number(display);
      if (!Number.isFinite(current)) return;

      if (accumulator === null || operator === null) {
        setAccumulator(current);
      } else if (!awaitingOperand) {
        if (operator === "÷" && current === 0) {
          setError("Cannot divide by zero.");
          setDisplay("0");
          setAccumulator(null);
          setOperator(null);
          setAwaitingOperand(false);
          return;
        }

        const computed = OPERATORS[operator](accumulator, current);
        const rounded = roundTo(computed, 12);
        const expression = `${formatDecimal(accumulator, 12)} ${operator} ${formatDecimal(current, 12)}`;

        setAccumulator(rounded);
        setDisplay(String(rounded));
        setHistory((entries) =>
          [{ expression, result: formatDecimal(rounded, 12) }, ...entries].slice(0, 8),
        );
      }

      setOperator(nextOperator);
      setAwaitingOperand(true);
      if (nextOperator === null) setAccumulator(null);
    },
    [display, accumulator, operator, awaitingOperand],
  );

  // Full keyboard support.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;

      const { key } = event;
      if (/^\d$/.test(key)) {
        event.preventDefault();
        inputDigit(key);
      } else if (key === "." || key === ",") {
        event.preventDefault();
        inputDecimal();
      } else if (key === "+" || key === "-") {
        event.preventDefault();
        performOperation(key);
      } else if (key === "*" || key === "x") {
        event.preventDefault();
        performOperation("×");
      } else if (key === "/") {
        event.preventDefault();
        performOperation("÷");
      } else if (key === "Enter" || key === "=") {
        event.preventDefault();
        performOperation(null);
      } else if (key === "Backspace") {
        event.preventDefault();
        backspace();
      } else if (key === "Escape") {
        event.preventDefault();
        clearAll();
      } else if (key === "%") {
        event.preventDefault();
        applyPercent();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [inputDigit, inputDecimal, performOperation, backspace, clearAll, applyPercent]);

  const keypad: {
    label: string;
    onClick: () => void;
    variant?: "operator" | "function" | "equals";
    wide?: boolean;
  }[] = [
    { label: "AC", onClick: clearAll, variant: "function" },
    { label: "±", onClick: toggleSign, variant: "function" },
    { label: "%", onClick: applyPercent, variant: "function" },
    { label: "÷", onClick: () => performOperation("÷"), variant: "operator" },
    { label: "7", onClick: () => inputDigit("7") },
    { label: "8", onClick: () => inputDigit("8") },
    { label: "9", onClick: () => inputDigit("9") },
    { label: "×", onClick: () => performOperation("×"), variant: "operator" },
    { label: "4", onClick: () => inputDigit("4") },
    { label: "5", onClick: () => inputDigit("5") },
    { label: "6", onClick: () => inputDigit("6") },
    { label: "-", onClick: () => performOperation("-"), variant: "operator" },
    { label: "1", onClick: () => inputDigit("1") },
    { label: "2", onClick: () => inputDigit("2") },
    { label: "3", onClick: () => inputDigit("3") },
    { label: "+", onClick: () => performOperation("+"), variant: "operator" },
    { label: "0", onClick: () => inputDigit("0"), wide: true },
    { label: ".", onClick: inputDecimal },
    { label: "=", onClick: () => performOperation(null), variant: "equals" },
  ];

  return (
    <div className="grid gap-5 lg:grid-cols-5">
      <div className="space-y-4 lg:col-span-3">
        <Card>
          {/* Display */}
          <div className="rounded-xl bg-slate-50 p-4 text-right dark:bg-slate-950/60">
            <div className="flex min-h-[1.25rem] items-center justify-end gap-2 text-xs muted">
              {accumulator !== null && operator ? (
                <span className="font-mono">
                  {formatDecimal(accumulator, 12)} {operator}
                </span>
              ) : null}
            </div>
            <p
              className="mt-1 truncate text-4xl font-semibold tracking-tight tabular-nums sm:text-5xl"
              aria-live="polite"
            >
              {display}
            </p>
            {error ? (
              <p role="alert" className="mt-2 text-xs font-medium text-rose-600 dark:text-rose-400">
                {error}
              </p>
            ) : null}
          </div>

          <div className="mt-3 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={backspace}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Delete className="h-3.5 w-3.5" />
              Backspace
            </button>
            <CopyButton value={display} label="Copy result" />
          </div>

          {/* Keypad */}
          <div className="mt-4 grid grid-cols-4 gap-2">
            {keypad.map((key) => (
              <button
                key={key.label}
                type="button"
                onClick={key.onClick}
                className={cn(
                  "h-14 rounded-xl text-lg font-medium transition-all active:scale-95",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
                  key.wide && "col-span-2",
                  key.variant === "operator" &&
                    "bg-brand-50 text-brand-700 hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-300 dark:hover:bg-brand-500/20",
                  key.variant === "equals" &&
                    "bg-brand-600 text-white shadow-lg shadow-brand-600/20 hover:bg-brand-700",
                  key.variant === "function" &&
                    "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700",
                  !key.variant &&
                    "bg-white text-slate-900 ring-1 ring-slate-200 ring-inset hover:bg-slate-50 dark:bg-slate-900 dark:text-white dark:ring-slate-800 dark:hover:bg-slate-800",
                )}
              >
                {key.label}
              </button>
            ))}
          </div>
        </Card>
      </div>

      <div className="space-y-4 lg:col-span-2">
        <Card padded={false} className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              History
            </h3>
            {history.length > 0 ? (
              <button
                type="button"
                onClick={() => setHistory([])}
                className="text-xs font-medium text-slate-500 transition-colors hover:text-rose-600"
              >
                Clear
              </button>
            ) : null}
          </div>

          {history.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm muted">No calculations yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {history.map((entry, index) => (
                <li key={`${entry.expression}-${index}`} className="px-4 py-2.5">
                  <p className="truncate font-mono text-xs muted">{entry.expression}</p>
                  <p className="truncate font-mono text-sm font-semibold tabular-nums">
                    = {entry.result}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Keyboard shortcuts
          </h3>
          <dl className="mt-3 space-y-1.5 text-xs">
            {[
              ["0–9 . ", "Enter numbers"],
              ["+ − * /", "Operators"],
              ["Enter or =", "Calculate"],
              ["Backspace", "Delete last digit"],
              ["Esc", "Clear all"],
              ["%", "Percent"],
            ].map(([keys, description]) => (
              <div key={keys} className="flex items-center justify-between gap-3">
                <dt className="font-mono text-slate-500 dark:text-slate-400">{keys}</dt>
                <dd className="muted">{description}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </div>
    </div>
  );
}
