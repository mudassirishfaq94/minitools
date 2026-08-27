import { useEffect, useState } from "react";
import { CircleAlert, Eraser, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Field";
import { Select } from "@/components/ui/Field";
import { Switch } from "@/components/ui/Field";
import { ResultPanel } from "@/components/tools/ResultPanel";
import { StatTile } from "@/components/tools/StatTile";
import { digestHex } from "@/utils/random";
import { formatNumber } from "@/utils/format";

const algorithms = [
  { value: "SHA-1", label: "SHA-1 (160 bit)" },
  { value: "SHA-256", label: "SHA-256 (256 bit)" },
  { value: "SHA-384", label: "SHA-384 (384 bit)" },
  { value: "SHA-512", label: "SHA-512 (512 bit)" },
];

const SAMPLE = "Toolstack";

export function HashGenerator() {
  const [text, setText] = useState(SAMPLE);
  const [algorithm, setAlgorithm] = useState("SHA-256");
  const [uppercase, setUppercase] = useState(false);

  const reset = () => {
    setText(SAMPLE);
    setAlgorithm("SHA-256");
    setUppercase(false);
  };
  const [hash, setHash] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!text) {
      setHash("");
      setError(null);
      return;
    }

    if (typeof crypto === "undefined" || !crypto.subtle) {
      setError("Web Crypto is unavailable. Please use a secure (https) context.");
      setHash("");
      return;
    }

    digestHex(algorithm, text)
      .then((value) => {
        if (cancelled) return;
        setHash(value);
        setError(null);
      })
      .catch(() => {
        if (cancelled) return;
        setError("Hashing failed for this input.");
        setHash("");
      });

    return () => {
      cancelled = true;
    };
  }, [text, algorithm]);

  const output = uppercase ? hash.toUpperCase() : hash;

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card className="space-y-4">
        <Textarea
          label="Text to hash"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Type or paste text…"
          rows={8}
          className="font-sans text-[15px]"
          action={
            <div className="flex gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setText("")}
                disabled={!text}
              >
                <Eraser className="h-3.5 w-3.5" />
                Clear
              </Button>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={reset}>
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </Button>
            </div>
          }
        />
        <Select
          label="Algorithm"
          options={algorithms}
          value={algorithm}
          onChange={(event) => setAlgorithm(event.target.value)}
        />
        <Switch
          checked={uppercase}
          onChange={setUppercase}
          label="Uppercase output"
          description="Render the digest in upper case hexadecimal."
        />
      </Card>

      <div className="space-y-5">
        {error ? (
          <div className="flex items-start gap-2 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        <ResultPanel label={`${algorithm} digest`} value={output} placeholder="Enter text to hash…">
          <div className="min-h-[6rem] rounded-xl bg-slate-50 p-4 dark:bg-slate-950/60">
            <p className="font-mono text-[13px] leading-relaxed break-all">
              {output || <span className="font-sans text-slate-400">No digest yet.</span>}
            </p>
          </div>
        </ResultPanel>

        <div className="grid grid-cols-2 gap-3">
          <StatTile
            label="Digest length"
            value={formatNumber(output.length)}
            hint="hex characters"
            icon="Hash"
          />
          <StatTile
            label="Input bytes"
            value={formatNumber(new TextEncoder().encode(text).length)}
            icon="Type"
          />
        </div>

        <p className="text-xs muted">
          Hashes are computed locally with <code className="font-mono">crypto.subtle.digest()</code>.
          Nothing is uploaded — but remember that these are plain hashes, not password hashes.
        </p>
      </div>
    </div>
  );
}
