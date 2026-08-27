import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Download, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatTile } from "@/components/tools/StatTile";
import { ComparePreview, ImageDropzone } from "@/components/tools/ImageDropzone";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/utils/cn";
import {
  detectFormatSupport,
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

export function ImageConverter() {
  const { image, error, loading, accept, clear, setError } = useImageUpload();
  const [format, setFormat] = useState<OutputFormat>("image/webp");
  const [quality, setQuality] = useState(90);
  const [background, setBackground] = useState("#FFFFFF");
  const [result, setResult] = useState<ProcessedImage | null>(null);
  const [processing, setProcessing] = useState(false);
  /** null until the capability probe finishes. */
  const [support, setSupport] = useState<Record<string, boolean> | null>(null);

  const debouncedQuality = useDebounce(quality, 180);
  const resultRef = useRef<ProcessedImage | null>(null);
  const runIdRef = useRef(0);

  const info = outputFormats.find((item) => item.mime === format);

  // Probe encoder support once — AVIF and WebP availability varies by browser.
  useEffect(() => {
    let cancelled = false;
    Promise.all(
      outputFormats.map(async (item) => [item.mime, await detectFormatSupport(item.mime)] as const),
    ).then((entries) => {
      if (!cancelled) setSupport(Object.fromEntries(entries));
    });
    return () => {
      cancelled = true;
    };
  }, []);

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
    if (!image) {
      replaceResult(null);
      return;
    }

    const runId = ++runIdRef.current;
    let cancelled = false;

    const run = async () => {
      setProcessing(true);
      try {
        const output = await resizeImage(image.bitmap, {
          width: image.width,
          height: image.height,
          format,
          quality: debouncedQuality / 100,
          background,
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
  }, [image, format, debouncedQuality, background, replaceResult, setError]);

  const sourceType = image?.file.type.replace("image/", "").toUpperCase() ?? "—";
  const delta = image && result ? savingsPercent(image.file.size, result.size) : 0;

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
              <h2 className="text-sm font-semibold">Convert to</h2>

              <div className="grid grid-cols-2 gap-2">
                {outputFormats.map((item) => {
                  const available = support?.[item.mime] !== false;
                  return (
                    <button
                      key={item.mime}
                      type="button"
                      onClick={() => setFormat(item.mime)}
                      disabled={!available}
                      aria-pressed={format === item.mime}
                      title={available ? item.description : "Not supported by this browser"}
                      className={cn(
                        "rounded-xl border px-3 py-2.5 text-left transition-all",
                        "disabled:cursor-not-allowed disabled:opacity-40",
                        format === item.mime
                          ? "border-brand-400 bg-brand-50 dark:border-brand-500/50 dark:bg-brand-500/10"
                          : "border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:bg-slate-800",
                      )}
                    >
                      <span className="block text-sm font-semibold">{item.label}</span>
                      <span className="block text-[11px] muted">
                        {available ? `.${item.extension}` : "unsupported"}
                      </span>
                    </button>
                  );
                })}
              </div>

              {info ? <p className="text-xs muted">{info.description}</p> : null}

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
              ) : (
                <p className="rounded-xl bg-slate-50 px-3 py-2 text-xs muted dark:bg-slate-900/60">
                  PNG is lossless, so there is no quality setting.
                </p>
              )}

              {!info?.supportsTransparency ? (
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Background
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={background}
                      onChange={(event) => setBackground(event.target.value.toUpperCase())}
                      aria-label="Background colour for transparent areas"
                      className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-slate-200 bg-transparent dark:border-slate-700"
                    />
                    <p className="text-xs muted">
                      {info?.label} has no alpha channel — transparent areas are filled with this
                      colour.
                    </p>
                  </div>
                </div>
              ) : null}

              <Button
                onClick={() =>
                  result &&
                  downloadBlob(result.url, renameExtension(image.file.name, info?.extension ?? "png"))
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
                Download {info?.label}
              </Button>
            </Card>

            <div className="space-y-4 lg:col-span-3">
              <ComparePreview
                originalUrl={image.url}
                processedUrl={result?.url ?? null}
                processing={processing}
              />

              <Card>
                <div className="flex items-center justify-center gap-4">
                  <div className="text-center">
                    <p className="text-lg font-semibold">{sourceType}</p>
                    <p className="text-xs muted">{formatFileSize(image.file.size)}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 shrink-0 text-slate-400" />
                  <div className="text-center">
                    <p className="text-lg font-semibold">{info?.label}</p>
                    <p className="text-xs muted">
                      {result ? formatFileSize(result.size) : "—"}
                    </p>
                  </div>
                </div>

                {result ? (
                  <p
                    className={cn(
                      "mt-3 text-center text-sm font-medium",
                      delta >= 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-amber-600 dark:text-amber-400",
                    )}
                  >
                    {delta >= 0 ? "Saved " : "Grew by "}
                    {formatDecimal(Math.abs(delta), 1)}%
                  </p>
                ) : null}
              </Card>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatTile label="Source" value={sourceType} icon="Image" />
                <StatTile label="Target" value={info?.label ?? "—"} icon="Repeat" />
                <StatTile
                  label="Dimensions"
                  value={`${image.width}×${image.height}`}
                  icon="Maximize"
                />
                <StatTile
                  label="Transparency"
                  value={info?.supportsTransparency ? "Kept" : "Flattened"}
                  icon="Droplet"
                />
              </div>
            </div>
          </div>

          <p className="rounded-xl bg-slate-50 px-4 py-3 text-xs muted dark:bg-slate-900/60">
            Conversion runs locally through the Canvas API. Available formats are probed at runtime,
            so anything your browser cannot encode is disabled rather than silently producing a PNG.
            Note that converting an animated GIF keeps only the first frame.
          </p>
        </>
      ) : null}
    </div>
  );
}
