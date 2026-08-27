import { useCallback, useEffect, useRef, useState } from "react";
import { Download, Link2, Link2Off, Loader2 } from "lucide-react";
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
  MAX_PIXELS,
  downloadBlob,
  fitWithin,
  formatFileSize,
  outputFormats,
  renameExtension,
  resizeImage,
  simplifyRatio,
  type OutputFormat,
  type ProcessedImage,
} from "@/utils/image";
import { formatNumber } from "@/utils/format";

type Mode = "pixels" | "percent" | "preset";

const PRESETS = [
  { label: "Thumbnail", width: 150, height: 150 },
  { label: "Avatar", width: 400, height: 400 },
  { label: "HD 1280", width: 1280, height: 720 },
  { label: "Full HD", width: 1920, height: 1080 },
  { label: "Instagram", width: 1080, height: 1080 },
  { label: "OG image", width: 1200, height: 630 },
];

export function ImageResizer() {
  const { image, error, loading, accept, clear, setError } = useImageUpload();
  const [mode, setMode] = useState<Mode>("pixels");
  const [width, setWidth] = useState("800");
  const [height, setHeight] = useState("600");
  const [percent, setPercent] = useState("50");
  const [locked, setLocked] = useState(true);
  const [format, setFormat] = useState<OutputFormat>("image/jpeg");
  const [quality, setQuality] = useState(90);

  const [result, setResult] = useState<ProcessedImage | null>(null);
  const [processing, setProcessing] = useState(false);

  const resultRef = useRef<ProcessedImage | null>(null);
  const runIdRef = useRef(0);
  const ratioRef = useRef(1);

  const widthField = validateNumber(width, {
    integer: true,
    min: 1,
    max: 20_000,
    label: "Width",
  });
  const heightField = validateNumber(height, {
    integer: true,
    min: 1,
    max: 20_000,
    label: "Height",
  });
  const percentField = validateNumber(percent, { min: 1, max: 500, label: "Scale" });

  // Seed the fields from the image once it loads.
  useEffect(() => {
    if (!image) return;
    ratioRef.current = image.width / image.height;
    const fitted = fitWithin(image.width, image.height, 1600, 1600);
    setWidth(String(fitted.width));
    setHeight(String(fitted.height));
  }, [image]);

  const onWidthChange = (value: string) => {
    setWidth(value);
    if (!locked) return;
    const parsed = validateNumber(value, { integer: true, min: 1 });
    if (parsed.value !== null) {
      setHeight(String(Math.max(1, Math.round(parsed.value / ratioRef.current))));
    }
  };

  const onHeightChange = (value: string) => {
    setHeight(value);
    if (!locked) return;
    const parsed = validateNumber(value, { integer: true, min: 1 });
    if (parsed.value !== null) {
      setWidth(String(Math.max(1, Math.round(parsed.value * ratioRef.current))));
    }
  };

  const applyPreset = (preset: (typeof PRESETS)[number]) => {
    if (!image) return;
    // Fit inside the preset box rather than distorting the image.
    const fitted = locked
      ? fitWithin(image.width, image.height, preset.width, preset.height)
      : { width: preset.width, height: preset.height };
    setWidth(String(fitted.width));
    setHeight(String(fitted.height));
  };

  // Resolve the target dimensions for the active mode.
  const target = (() => {
    if (!image) return null;
    if (mode === "percent") {
      if (percentField.value === null) return null;
      const scale = percentField.value / 100;
      return {
        width: Math.max(1, Math.round(image.width * scale)),
        height: Math.max(1, Math.round(image.height * scale)),
      };
    }
    if (widthField.value === null || heightField.value === null) return null;
    return { width: widthField.value, height: heightField.value };
  })();

  const debouncedTarget = useDebounce(target ? `${target.width}x${target.height}` : "", 250);
  const debouncedQuality = useDebounce(quality, 180);

  const tooManyPixels = target ? target.width * target.height > MAX_PIXELS : false;

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

  useEffect(() => {
    if (!image || !target || tooManyPixels) {
      replaceResult(null);
      return;
    }

    const runId = ++runIdRef.current;
    let cancelled = false;

    const run = async () => {
      setProcessing(true);
      try {
        const output = await resizeImage(image.bitmap, {
          width: target.width,
          height: target.height,
          format,
          quality: debouncedQuality / 100,
        });
        if (cancelled || runId !== runIdRef.current) {
          URL.revokeObjectURL(output.url);
          return;
        }
        replaceResult(output);
        setError(null);
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
    // `debouncedTarget` gates the effect; `target` itself is read fresh.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image, debouncedTarget, format, debouncedQuality, tooManyPixels, replaceResult, setError]);

  const reset = () => {
    if (!image) return;
    const fitted = fitWithin(image.width, image.height, 1600, 1600);
    setMode("pixels");
    setWidth(String(fitted.width));
    setHeight(String(fitted.height));
    setPercent("50");
    setLocked(true);
    setFormat("image/jpeg");
    setQuality(90);
  };

  const info = outputFormats.find((item) => item.mime === format);

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
                <h2 className="text-sm font-semibold">Dimensions</h2>
                <Button variant="ghost" size="sm" onClick={reset} className="h-7 px-2 text-xs">
                  Reset
                </Button>
              </div>

              <Segmented
                options={[
                  { value: "pixels", label: "Pixels" },
                  { value: "percent", label: "Percent" },
                  { value: "preset", label: "Presets" },
                ]}
                value={mode}
                onChange={setMode}
                size="sm"
                aria-label="Resize mode"
              />

              {mode === "percent" ? (
                <NumberField
                  label="Scale"
                  value={percent}
                  onChange={setPercent}
                  error={percentField.error}
                  suffix="%"
                  presets={[25, 50, 75, 200]}
                />
              ) : mode === "preset" ? (
                <div className="grid grid-cols-2 gap-2">
                  {PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => applyPreset(preset)}
                      className="rounded-xl border border-slate-200 px-3 py-2 text-left transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
                    >
                      <span className="block text-sm font-medium">{preset.label}</span>
                      <span className="block text-[11px] muted">
                        {preset.width}×{preset.height}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-3">
                    <NumberField
                      label="Width"
                      value={width}
                      onChange={onWidthChange}
                      error={widthField.error}
                      suffix="px"
                    />
                    <NumberField
                      label="Height"
                      value={height}
                      onChange={onHeightChange}
                      error={heightField.error}
                      suffix="px"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setLocked((value) => !value)}
                    aria-pressed={locked}
                    className={cn(
                      "flex w-full items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-all",
                      locked
                        ? "border-brand-400 bg-brand-50 text-brand-700 dark:border-brand-500/50 dark:bg-brand-500/10 dark:text-brand-200"
                        : "border-slate-200 text-slate-500 hover:border-slate-300 dark:border-slate-800",
                    )}
                  >
                    {locked ? <Link2 className="h-3.5 w-3.5" /> : <Link2Off className="h-3.5 w-3.5" />}
                    {locked ? "Aspect ratio locked" : "Aspect ratio unlocked"}
                  </button>
                </div>
              )}

              <div className="space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Format
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {outputFormats.slice(0, 3).map((item) => (
                    <button
                      key={item.mime}
                      type="button"
                      onClick={() => setFormat(item.mime)}
                      aria-pressed={format === item.mime}
                      className={cn(
                        "rounded-xl border py-2 text-sm font-semibold transition-all",
                        format === item.mime
                          ? "border-brand-400 bg-brand-50 text-brand-700 dark:border-brand-500/50 dark:bg-brand-500/10 dark:text-brand-200"
                          : "border-slate-200 hover:border-slate-300 dark:border-slate-800",
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {info?.lossy ? (
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
                    aria-label="Output quality"
                    className="w-full accent-brand-600"
                  />
                </div>
              ) : null}

              {tooManyPixels ? (
                <p
                  role="alert"
                  className="rounded-xl bg-rose-50 px-3 py-2.5 text-xs font-medium text-rose-700 dark:bg-rose-500/10 dark:text-rose-300"
                >
                  {formatNumber(target!.width)}×{formatNumber(target!.height)} exceeds the{" "}
                  {MAX_PIXELS / 1_000_000} megapixel limit. Choose smaller dimensions.
                </p>
              ) : null}

              <Button
                onClick={() =>
                  result &&
                  downloadBlob(
                    result.url,
                    renameExtension(
                      `${image.file.name.replace(/\.[^.]+$/, "")}-${result.width}x${result.height}`,
                      info?.extension ?? "jpg",
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
                Download resized
              </Button>
            </Card>

            <div className="space-y-4 lg:col-span-3">
              <ComparePreview
                originalUrl={image.url}
                processedUrl={result?.url ?? null}
                processing={processing}
              />

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatTile
                  label="Original"
                  value={`${image.width}×${image.height}`}
                  hint={formatFileSize(image.file.size)}
                  icon="Image"
                />
                <StatTile
                  label="New size"
                  value={result ? `${result.width}×${result.height}` : "—"}
                  hint={result ? formatFileSize(result.size) : undefined}
                  icon="Maximize"
                />
                <StatTile
                  label="Scale"
                  value={
                    result ? `${Math.round((result.width / image.width) * 100)}%` : "—"
                  }
                  icon="Gauge"
                />
                <StatTile
                  label="Ratio"
                  value={result ? simplifyRatio(result.width, result.height) : "—"}
                  hint={simplifyRatio(image.width, image.height)}
                  icon="Crop"
                />
              </div>
            </div>
          </div>

          <p className="rounded-xl bg-slate-50 px-4 py-3 text-xs muted dark:bg-slate-900/60">
            Large reductions are performed in successive halving steps rather than one draw. A
            single-pass downscale uses a cheap sampling filter that produces visible aliasing when
            shrinking by more than about 2×; stepped scaling keeps edges clean. All processing is
            local to your browser.
          </p>
        </>
      ) : null}
    </div>
  );
}
