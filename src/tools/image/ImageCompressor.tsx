import { useCallback, useEffect, useRef, useState } from "react";
import { Download, Loader2, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Segmented } from "@/components/ui/Segmented";
import { StatTile } from "@/components/tools/StatTile";
import { NumberField, validateNumber } from "@/components/tools/NumberField";
import { ComparePreview, ImageDropzone } from "@/components/tools/ImageDropzone";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/utils/cn";
import {
  compressToTarget,
  downloadBlob,
  formatFileSize,
  outputFormats,
  renameExtension,
  resizeImage,
  savingsPercent,
  type OutputFormat,
  type ProcessedImage,
} from "@/utils/image";
import { formatDecimal } from "@/utils/number";

type Mode = "quality" | "target";

const COMPRESSIBLE: OutputFormat[] = ["image/jpeg", "image/webp", "image/avif"];

export function ImageCompressor() {
  const { image, error, loading, accept, clear, setError } = useImageUpload();
  const [mode, setMode] = useState<Mode>("quality");
  const [quality, setQuality] = useState(75);
  const [targetKb, setTargetKb] = useState("200");
  const [format, setFormat] = useState<OutputFormat>("image/jpeg");

  const [result, setResult] = useState<ProcessedImage | null>(null);
  const [processing, setProcessing] = useState(false);
  const [usedQuality, setUsedQuality] = useState<number | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  const debouncedQuality = useDebounce(quality, 180);
  const debouncedTarget = useDebounce(targetKb, 400);
  const resultRef = useRef<ProcessedImage | null>(null);
  /** Guards against out-of-order async completions. */
  const runIdRef = useRef(0);

  const targetField = validateNumber(targetKb, {
    min: 1,
    max: 20_000,
    label: "Target size",
  });

  const replaceResult = useCallback((next: ProcessedImage | null) => {
    if (resultRef.current) URL.revokeObjectURL(resultRef.current.url);
    resultRef.current = next;
    setResult(next);
  }, []);

  useEffect(
    () => () => {
      if (resultRef.current) URL.revokeObjectURL(resultRef.current.url);
    },
    [],
  );

  // Recompress whenever the image or settings change.
  useEffect(() => {
    if (!image) {
      replaceResult(null);
      return;
    }

    const runId = ++runIdRef.current;
    let cancelled = false;

    const run = async () => {
      setProcessing(true);
      setWarning(null);
      try {
        const dimensions = { width: image.width, height: image.height };

        if (mode === "target") {
          if (targetField.value === null) return;
          const targetBytes = targetField.value * 1024;
          const found = await compressToTarget(image.bitmap, targetBytes, format, dimensions);

          if (cancelled || runId !== runIdRef.current) return;

          if (!found) {
            replaceResult(null);
            setWarning(
              `Could not reach ${formatFileSize(targetBytes)} at these dimensions, even at the lowest quality. Try resizing the image first or choosing WebP.`,
            );
            setUsedQuality(null);
            return;
          }
          replaceResult(found.result);
          setUsedQuality(Math.round(found.quality * 100));
        } else {
          const output = await resizeImage(image.bitmap, {
            ...dimensions,
            format,
            quality: debouncedQuality / 100,
          });
          if (cancelled || runId !== runIdRef.current) {
            URL.revokeObjectURL(output.url);
            return;
          }
          replaceResult(output);
          setUsedQuality(debouncedQuality);
        }
      } catch (caught) {
        if (!cancelled) {
          setError((caught as Error).message);
          replaceResult(null);
        }
      } finally {
        if (!cancelled && runId === runIdRef.current) setProcessing(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [
    image,
    mode,
    format,
    debouncedQuality,
    debouncedTarget,
    targetField.value,
    replaceResult,
    setError,
  ]);

  const reset = () => {
    setMode("quality");
    setQuality(75);
    setTargetKb("200");
    setFormat("image/jpeg");
    setWarning(null);
  };

  const saved = image && result ? savingsPercent(image.file.size, result.size) : 0;
  const grew = saved < 0;

  return (
    <div className="space-y-5">
      <ImageDropzone
        image={image}
        error={error}
        loading={loading}
        onSelect={accept}
        onClear={() => {
          clear();
          replaceResult(null);
        }}
      />

      {image ? (
        <>
          <div className="grid gap-5 lg:grid-cols-5">
            <Card className="space-y-4 lg:col-span-2">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold">Compression</h2>
                <Button variant="ghost" size="sm" onClick={reset} className="h-7 px-2 text-xs">
                  Reset
                </Button>
              </div>

              <Segmented
                options={[
                  { value: "quality", label: "By quality" },
                  { value: "target", label: "By file size" },
                ]}
                value={mode}
                onChange={setMode}
                size="sm"
                aria-label="Compression mode"
              />

              {mode === "quality" ? (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Quality
                    </span>
                    <span className="font-mono text-sm font-semibold tabular-nums">{quality}%</span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={100}
                    value={quality}
                    onChange={(event) => setQuality(Number(event.target.value))}
                    aria-label="Compression quality"
                    className="w-full accent-brand-600"
                  />
                  <p className="text-xs muted">
                    75–85% is usually indistinguishable from the original for photos.
                  </p>
                </div>
              ) : (
                <NumberField
                  label="Target file size"
                  value={targetKb}
                  onChange={setTargetKb}
                  error={targetField.error}
                  suffix="KB"
                  presets={[50, 100, 200, 500]}
                  hint="Searches for the highest quality that fits."
                />
              )}

              <div className="space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Output format
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {outputFormats
                    .filter((item) => COMPRESSIBLE.includes(item.mime))
                    .map((item) => (
                      <button
                        key={item.mime}
                        type="button"
                        onClick={() => setFormat(item.mime)}
                        aria-pressed={format === item.mime}
                        className={cn(
                          "rounded-xl border py-2 text-sm font-semibold transition-all",
                          format === item.mime
                            ? "border-brand-400 bg-brand-50 text-brand-700 dark:border-brand-500/50 dark:bg-brand-500/10 dark:text-brand-200"
                            : "border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:bg-slate-800",
                        )}
                      >
                        {item.label}
                      </button>
                    ))}
                </div>
                <p className="text-xs muted">
                  {outputFormats.find((item) => item.mime === format)?.description}
                </p>
              </div>

              {warning ? (
                <p
                  role="alert"
                  className="rounded-xl bg-amber-50 px-3 py-2.5 text-xs font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
                >
                  {warning}
                </p>
              ) : null}

              <Button
                onClick={() =>
                  result &&
                  downloadBlob(
                    result.url,
                    renameExtension(
                      image.file.name,
                      outputFormats.find((item) => item.mime === format)?.extension ?? "jpg",
                    ),
                  )
                }
                disabled={!result || processing}
                size="lg"
                className="w-full"
              >
                {processing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                {processing ? "Compressing…" : "Download compressed"}
              </Button>
            </Card>

            <div className="space-y-4 lg:col-span-3">
              <ComparePreview
                originalUrl={image.url}
                processedUrl={result?.url ?? null}
                processing={processing}
              />

              {result ? (
                <Card
                  className={cn(
                    grew ? "border-amber-200 dark:border-amber-500/30" : "border-emerald-200 dark:border-emerald-500/30",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                        grew
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
                          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
                      )}
                    >
                      <TrendingDown className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-lg font-semibold">
                        {grew ? "File grew by " : "Saved "}
                        {formatDecimal(Math.abs(saved), 1)}%
                      </p>
                      <p className="text-sm muted">
                        {formatFileSize(image.file.size)} → {formatFileSize(result.size)}
                      </p>
                    </div>
                  </div>

                  {grew ? (
                    <p className="mt-3 text-xs muted">
                      The output is larger than the original — the source is likely already well
                      compressed. Lower the quality or keep the original file.
                    </p>
                  ) : null}
                </Card>
              ) : null}

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatTile label="Original" value={formatFileSize(image.file.size)} icon="Image" />
                <StatTile
                  label="Compressed"
                  value={result ? formatFileSize(result.size) : "—"}
                  icon="Download"
                />
                <StatTile
                  label="Quality used"
                  value={usedQuality !== null ? `${usedQuality}%` : "—"}
                  icon="Gauge"
                />
                <StatTile
                  label="Dimensions"
                  value={`${image.width}×${image.height}`}
                  hint="unchanged"
                  icon="Maximize"
                />
              </div>
            </div>
          </div>

          <p className="rounded-xl bg-slate-50 px-4 py-3 text-xs muted dark:bg-slate-900/60">
            Compression happens entirely in your browser using the Canvas API — the image is never
            uploaded. “By file size” runs a binary search over the quality range (about seven
            encodes) to find the best quality that still fits your target.
          </p>
        </>
      ) : null}
    </div>
  );
}
