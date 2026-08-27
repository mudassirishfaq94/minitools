import { useMemo, useState } from "react";
import { ArrowUpDown, Eraser, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Field";
import { Segmented } from "@/components/ui/Segmented";
import { ResultPanel } from "@/components/tools/ResultPanel";
import { StatTile } from "@/components/tools/StatTile";
import { Button } from "@/components/ui/Button";
import { inspectUrl, urlDecode, urlEncode, type UrlScope } from "@/utils/codec";
import { formatNumber } from "@/utils/format";

type Mode = "encode" | "decode";

const SAMPLES: Record<Mode, string> = {
  encode: "https://toolstack.dev/search?q=mini tools & page=2",
  decode: "https%3A%2F%2Ftoolstack.dev%2Fsearch%3Fq%3Dmini%20tools%20%26%20page%3D2",
};

interface UrlToolProps {
  defaultMode?: Mode;
}

export function UrlEncoder({ defaultMode = "encode" }: UrlToolProps) {
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [scope, setScope] = useState<UrlScope>("component");
  const [input, setInput] = useState(SAMPLES[defaultMode]);

  const { output, error } = useMemo(
    () => (mode === "encode" ? urlEncode(input, scope) : urlDecode(input)),
    [input, mode, scope],
  );

  // Inspect whichever side currently holds a readable URL.
  const parts = useMemo(
    () => inspectUrl(mode === "encode" ? input : output || input),
    [mode, input, output],
  );

  const swap = () => {
    if (error || !output) return;
    const next: Mode = mode === "encode" ? "decode" : "encode";
    setMode(next);
    setInput(output);
  };

  const reset = () => {
    setMode(defaultMode);
    setScope("component");
    setInput(SAMPLES[defaultMode]);
  };

  const escapes = output ? (output.match(/%[0-9A-Fa-f]{2}/g) ?? []).length : 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Segmented
          options={[
            { value: "encode", label: "Encode" },
            { value: "decode", label: "Decode" },
          ]}
          value={mode}
          onChange={setMode}
          className="sm:max-w-xs"
          aria-label="Mode"
        />
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={swap} disabled={!output || !!error}>
            <ArrowUpDown className="h-3.5 w-3.5" />
            Swap
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setInput("")} disabled={!input}>
            <Eraser className="h-3.5 w-3.5" />
            Clear
          </Button>
          <Button variant="ghost" size="sm" onClick={reset}>
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>
        </div>
      </div>

      {mode === "encode" ? (
        <Segmented
          options={[
            { value: "component", label: "Component — encodes & ? / :" },
            { value: "full", label: "Full URL — keeps structure" },
          ]}
          value={scope}
          onChange={setScope}
          size="sm"
          aria-label="Encoding scope"
        />
      ) : null}

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <Textarea
            label={mode === "encode" ? "Text or URL" : "Encoded URL"}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            rows={8}
            error={error ?? undefined}
          />
        </Card>

        <ResultPanel
          label={mode === "encode" ? "Encoded result" : "Decoded result"}
          value={output}
          error={error}
          placeholder="Output appears here…"
        />
      </div>

      {parts ? (
        <Card padded={false} className="overflow-hidden">
          <h3 className="border-b border-slate-200 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400">
            URL breakdown
          </h3>
          <ul className="divide-y divide-slate-100 text-sm dark:divide-slate-800">
            <li className="flex justify-between gap-3 px-4 py-2">
              <span className="muted">Protocol</span>
              <span className="font-mono">{parts.protocol}</span>
            </li>
            <li className="flex justify-between gap-3 px-4 py-2">
              <span className="muted">Host</span>
              <span className="truncate font-mono">{parts.host}</span>
            </li>
            <li className="flex justify-between gap-3 px-4 py-2">
              <span className="muted">Path</span>
              <span className="truncate font-mono">{parts.pathname}</span>
            </li>
            {parts.params.map(([key, value]) => (
              <li key={key} className="flex justify-between gap-3 px-4 py-2">
                <span className="truncate muted">?{key}</span>
                <span className="truncate font-mono">{value}</span>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatTile label="Input length" value={formatNumber(input.length)} icon="Type" />
        <StatTile label="Output length" value={formatNumber(output.length)} icon="Hash" />
        <StatTile
          label="Percent escapes"
          value={formatNumber(escapes)}
          hint="%XX sequences"
          icon="Link"
        />
      </div>

      <p className="rounded-xl bg-slate-50 px-4 py-3 text-xs muted dark:bg-slate-900/60">
        <strong>Component</strong> encoding escapes <code>&amp; ? / : =</code> and is what you want
        for a single query value. <strong>Full URL</strong> leaves those separators intact so a
        complete address stays usable. Decoding also converts <code>+</code> to a space, matching
        form submissions.
      </p>
    </div>
  );
}

/** Decoder entry point — same engine, decode-first. */
export function UrlDecoder() {
  return <UrlEncoder defaultMode="decode" />;
}
