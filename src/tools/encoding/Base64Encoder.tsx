import { useMemo, useState } from "react";
import { ArrowUpDown, Eraser, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Field";
import { Segmented } from "@/components/ui/Segmented";
import { ResultPanel } from "@/components/tools/ResultPanel";
import { StatTile } from "@/components/tools/StatTile";
import { OptionToggle } from "@/components/tools/TextToolShell";
import { Button } from "@/components/ui/Button";
import { base64Decode, base64Encode } from "@/utils/codec";
import { formatBytes } from "@/utils/format";

type Mode = "encode" | "decode";

const SAMPLES: Record<Mode, string> = {
  encode: "Toolstack runs entirely in your browser 🚀",
  decode: "VG9vbHN0YWNrIHJ1bnMgZW50aXJlbHkgaW4geW91ciBicm93c2VyIPCfmoA=",
};

interface Base64ToolProps {
  /** Starting mode — lets the catalog expose Encoder and Decoder separately. */
  defaultMode?: Mode;
}

export function Base64Encoder({ defaultMode = "encode" }: Base64ToolProps) {
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [urlSafe, setUrlSafe] = useState(false);
  const [input, setInput] = useState(SAMPLES[defaultMode]);

  const { output, error } = useMemo(
    () => (mode === "encode" ? base64Encode(input, urlSafe) : base64Decode(input)),
    [input, mode, urlSafe],
  );

  const swap = () => {
    if (error || !output) return;
    const next: Mode = mode === "encode" ? "decode" : "encode";
    setMode(next);
    setInput(output);
  };

  const reset = () => {
    setMode(defaultMode);
    setUrlSafe(false);
    setInput(SAMPLES[defaultMode]);
  };

  const inputBytes = new TextEncoder().encode(input).length;
  const outputBytes = new TextEncoder().encode(output).length;

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

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="space-y-3">
          <Textarea
            label={mode === "encode" ? "Plain text" : "Base64"}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={mode === "encode" ? "Type text to encode…" : "Paste Base64 to decode…"}
            rows={10}
            error={error ?? undefined}
          />
          {mode === "encode" ? (
            <OptionToggle
              checked={urlSafe}
              onChange={setUrlSafe}
              label="URL-safe alphabet"
              description="Uses - and _ instead of + and /, and drops padding."
            />
          ) : null}
        </Card>

        <ResultPanel
          label={mode === "encode" ? "Base64" : "Plain text"}
          value={output}
          error={error}
          placeholder="Output appears here…"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Input size" value={formatBytes(inputBytes)} icon="Download" />
        <StatTile label="Output size" value={formatBytes(outputBytes)} icon="ArrowUpRight" />
        <StatTile
          label="Overhead"
          value={
            inputBytes && outputBytes ? `${Math.round((outputBytes / inputBytes) * 100)}%` : "—"
          }
          hint="output / input"
          icon="Gauge"
        />
        <StatTile label="Mode" value={mode === "encode" ? "Encode" : "Decode"} icon="ArrowUpDown" />
      </div>

      <p className="rounded-xl bg-slate-50 px-4 py-3 text-xs muted dark:bg-slate-900/60">
        Base64 grows data by roughly 33%. Decoding accepts both the standard (<code>+/</code>) and
        URL-safe (<code>-_</code>) alphabets, and missing padding is restored automatically.
      </p>
    </div>
  );
}

/** Decoder entry point — same engine, decode-first. */
export function Base64Decoder() {
  return <Base64Encoder defaultMode="decode" />;
}
