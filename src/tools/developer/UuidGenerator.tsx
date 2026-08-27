import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input, Switch } from "@/components/ui/Field";
import { ResultPanel } from "@/components/tools/ResultPanel";
import { StatTile } from "@/components/tools/StatTile";
import { Button } from "@/components/ui/Button";
import { uuidV4 } from "@/utils/random";
import { formatNumber } from "@/utils/format";

export function UuidGenerator() {
  const [count, setCount] = useState(5);
  const [uppercase, setUppercase] = useState(false);
  const [hyphens, setHyphens] = useState(true);
  const [uuids, setUuids] = useState<string[]>([]);

  const generate = useCallback(() => {
    const total = Math.max(1, Math.min(100, Math.round(count) || 1));
    setUuids(
      Array.from({ length: total }, () => {
        const value = uuidV4();
        const withoutHyphens = hyphens ? value : value.replace(/-/g, "");
        return uppercase ? withoutHyphens.toUpperCase() : withoutHyphens;
      }),
    );
  }, [count, uppercase, hyphens]);

  useEffect(() => {
    generate();
  }, [generate]);

  const all = useMemo(() => uuids.join("\n"), [uuids]);

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <Card className="space-y-4 lg:col-span-1">
        <Input
          label="Quantity"
          type="number"
          min={1}
          max={100}
          value={count}
          onChange={(event) => setCount(Number(event.target.value))}
        />
        <Switch
          checked={hyphens}
          onChange={setHyphens}
          label="Include hyphens"
          description="Standard 8-4-4-4-12 grouping."
        />
        <Switch
          checked={uppercase}
          onChange={setUppercase}
          label="Uppercase"
          description="Render the hexadecimal digits in upper case."
        />
        <Button onClick={generate} size="lg" className="w-full">
          <RefreshCw className="h-4 w-4" />
          Generate
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={() => {
            setCount(5);
            setUppercase(false);
            setHyphens(true);
          }}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset options
        </Button>
      </Card>

      <div className="space-y-5 lg:col-span-2">
        <ResultPanel label="Generated UUIDs (v4)" value={all}>
          <div className="max-h-80 space-y-1.5 overflow-y-auto pr-1 scrollbar-thin">
            {uuids.map((uuid, index) => (
              <p
                key={`${uuid}-${index}`}
                className="rounded-lg bg-slate-50 px-3 py-2 font-mono text-[13px] break-all dark:bg-slate-950/60"
              >
                {uuid}
              </p>
            ))}
          </div>
        </ResultPanel>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatTile label="Generated" value={formatNumber(uuids.length)} icon="Dices" />
          <StatTile label="Version" value="v4" icon="Tags" />
          <StatTile
            label="Entropy"
            value="122 bits"
            hint="random per UUID"
            icon="ShieldCheck"
          />
        </div>
        <p className="text-xs muted">
          Generated with <code className="font-mono">crypto.randomUUID()</code> — cryptographically
          secure and never leaves your device.
        </p>
      </div>
    </div>
  );
}
