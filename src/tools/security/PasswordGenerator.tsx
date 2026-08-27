import { useEffect, useMemo, useState } from "react";
import { RefreshCw, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Switch } from "@/components/ui/Field";
import { ResultPanel } from "@/components/tools/ResultPanel";
import { StatTile } from "@/components/tools/StatTile";
import { Button } from "@/components/ui/Button";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import {
  buildCharset,
  estimateEntropy,
  generatePassword,
  strengthLabel,
  type PasswordOptions,
} from "@/utils/random";
import { cn } from "@/utils/cn";
import { formatNumber } from "@/utils/format";

const toneBar: Record<"danger" | "warning" | "success", string> = {
  danger: "bg-rose-500",
  warning: "bg-amber-500",
  success: "bg-emerald-500",
};

export function PasswordGenerator() {
  const [options, setOptions] = useLocalStorage<PasswordOptions>("toolstack:password", {
    length: 20,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    excludeSimilar: false,
  });
  const [password, setPassword] = useState("");

  const update = <K extends keyof PasswordOptions>(key: K, value: PasswordOptions[K]) =>
    setOptions((current) => ({ ...current, [key]: value }));

  const regenerate = () => setPassword(generatePassword(options));

  useEffect(() => {
    setPassword(generatePassword(options));
    // Regenerate whenever the recipe changes.
  }, [options]);

  const entropy = useMemo(() => estimateEntropy(password), [password]);
  const strength = strengthLabel(entropy.bits);
  const charsetSize = useMemo(() => buildCharset(options).length, [options]);
  const hasGroup = options.uppercase || options.lowercase || options.numbers || options.symbols;

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <Card className="space-y-4 lg:col-span-1">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Length
            </span>
            <span className="text-sm font-semibold tabular-nums">{options.length}</span>
          </div>
          <input
            type="range"
            min={6}
            max={64}
            value={options.length}
            onChange={(event) => update("length", Number(event.target.value))}
            className="w-full accent-brand-600"
            aria-label="Password length"
          />
        </div>

        <div className="space-y-2">
          <Switch
            checked={options.uppercase}
            onChange={(value) => update("uppercase", value)}
            label="Uppercase (A-Z)"
          />
          <Switch
            checked={options.lowercase}
            onChange={(value) => update("lowercase", value)}
            label="Lowercase (a-z)"
          />
          <Switch
            checked={options.numbers}
            onChange={(value) => update("numbers", value)}
            label="Numbers (0-9)"
          />
          <Switch
            checked={options.symbols}
            onChange={(value) => update("symbols", value)}
            label="Symbols (!@#$…)"
          />
          <Switch
            checked={options.excludeSimilar}
            onChange={(value) => update("excludeSimilar", value)}
            label="Avoid similar characters"
            description="Excludes confusing glyphs like i, l, 1, O and 0."
          />
        </div>

        <Button onClick={regenerate} size="lg" className="w-full" disabled={!hasGroup}>
          <RefreshCw className="h-4 w-4" />
          Generate password
        </Button>

        {/* Options persist to localStorage, so an explicit way back to the
            defaults is needed. */}
        <Button
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={() =>
            setOptions({
              length: 20,
              uppercase: true,
              lowercase: true,
              numbers: true,
              symbols: true,
              excludeSimilar: false,
            })
          }
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset options
        </Button>
      </Card>

      <div className="space-y-5 lg:col-span-2">
        <ResultPanel
          label="Your password"
          value={password}
          placeholder="Enable at least one character group…"
        >
          <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950/60">
            <p className="font-mono text-[15px] leading-relaxed break-all sm:text-base">
              {password || <span className="font-sans text-slate-400">No password yet.</span>}
            </p>
          </div>
        </ResultPanel>

        <Card className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium">Strength</span>
            <span
              className={cn(
                "text-sm font-semibold",
                strength.tone === "danger" && "text-rose-600 dark:text-rose-400",
                strength.tone === "warning" && "text-amber-600 dark:text-amber-400",
                strength.tone === "success" && "text-emerald-600 dark:text-emerald-400",
              )}
            >
              {strength.label}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className={cn("h-full rounded-full transition-all duration-500", toneBar[strength.tone])}
              style={{ width: `${Math.min(100, (entropy.bits / 128) * 100)}%` }}
            />
          </div>
          <p className="text-xs muted">
            ~{entropy.bits} bits of entropy from a pool of {formatNumber(charsetSize)} characters.
          </p>
        </Card>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatTile label="Length" value={password.length} icon="Hash" />
          <StatTile label="Entropy" value={`${entropy.bits} bits`} icon="ShieldCheck" />
          <StatTile label="Character pool" value={formatNumber(charsetSize)} icon="Blocks" />
        </div>

        <p className="text-xs muted">
          Passwords are generated with the Web Crypto API and are never stored or transmitted.
        </p>
      </div>
    </div>
  );
}
