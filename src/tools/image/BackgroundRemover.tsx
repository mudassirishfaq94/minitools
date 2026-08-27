import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Download, Loader2, Pipette, WandSparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Segmented } from "@/components/ui/Segmented";
import { StatTile } from "@/components/tools/StatTile";
import { ImageDropzone } from "@/components/tools/ImageDropzone";
import {
  BackgroundPicker,
  defaultBackgroundState,
  toFill,
  type BackgroundState,
} from "@/components/tools/BackgroundPicker";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/utils/cn";
import {
  autoDetectBackground,
  paintBackground,
  removeBackground,
  samplePixel,
  type RGBA,
  type RemovalMode,
} from "@/utils/background";
import {
  downloadBlob,
  fitWithin,
  formatFileSize,
  renameExtension,
  type OutputFormat,
} from "@/utils/image";
import { formatDecimal } from "@/utils/number";

/** Working resolution cap — keeps the live preview responsive. */
const PREVIEW_MAX = 1400;

function toHex({ r, g, b }: RGBA): string {
  const hex = (value: number) => value.toString(16).padStart(2, "0");
  return `#${hex(r)}${hex(g)}${hex(b)}`.toUpperCase();
}

export function BackgroundRemover() {
  const { image, error, loading, accept, clear, setError } = useImageUpload();

  const [keyColor, setKeyColor] = useState<RGBA>({ r: 255, g: 255, b: 255, a: 255 });
  const [tolerance, setTolerance] = useState(12);
  const [softness, setSoftness] = useState(8);
  const [mode, setMode] = useState<RemovalMode>("contiguous");
  const [trim, setTrim] = useState(0);
  const [picking, setPicking] = useState(false);
  const [background, setBackground] = useState<BackgroundState>(defaultBackgroundState);
  const [format, setFormat] = useState<OutputFormat>("image/png");

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [removedRatio, setRemovedRatio] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [outputSize, setOutputSize] = useState<number | null>(null);

  /** Source pixels at working resolution, reused across every adjustment. */
  const sourceRef = useRef<ImageData | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const bgUrlRef = useRef<string | null>(null);
  const runIdRef = useRef(0);

  const debouncedTolerance = useDebounce(tolerance, 160);
  const debouncedSoftness = useDebounce(softness, 160);
  const debouncedTrim = useDebounce(trim, 160);

  const working = useMemo(
    () => (image ? fitWithin(image.width, image.height, PREVIEW_MAX, PREVIEW_MAX) : null),
    [image],
  );

  // Rasterise the upload once at working size and auto-detect the key colour.
  useEffect(() => {
    if (!image || !working) {
      sourceRef.current = null;
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = working.width;
    canvas.height = working.height;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) {
      setError("Canvas is unavailable in this browser.");
      return;
    }

    context.drawImage(image.bitmap, 0, 0, working.width, working.height);
    const data = context.getImageData(0, 0, working.width, working.height);
    sourceRef.current = data;
    setKeyColor(autoDetectBackground(data));
  }, [image, working, setError]);

  const releasePreview = useCallback((url: string | null) => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = url;
    setPreviewUrl(url);
  }, []);

  useEffect(
    () => () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      if (bgUrlRef.current) URL.revokeObjectURL(bgUrlRef.current);
    },
    [],
  );

  /** Renders the cut-out composited onto the chosen background. */
  const render = useCallback(
    async (targetWidth?: number, targetHeight?: number): Promise<Blob | null> => {
      const source = sourceRef.current;
      if (!source || !image) return null;

      const { output } = removeBackground(source, {
        color: keyColor,
        tolerance: debouncedTolerance,
        softness: debouncedSoftness,
        mode,
        trim: debouncedTrim,
      });

      // Cut-out on its own canvas so it can be drawn over the background.
      const cutout = document.createElement("canvas");
      cutout.width = output.width;
      cutout.height = output.height;
      cutout.getContext("2d")?.putImageData(output, 0, 0);

      const width = targetWidth ?? output.width;
      const height = targetHeight ?? output.height;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) return null;

      paintBackground(context, width, height, toFill(background));
      context.imageSmoothingQuality = "high";
      context.drawImage(cutout, 0, 0, width, height);

      // JPEG cannot hold alpha, so force PNG when no background was chosen.
      const effective: OutputFormat =
        background.kind === "transparent" && format === "image/jpeg" ? "image/png" : format;

      return new Promise((resolve) =>
        canvas.toBlob((blob) => resolve(blob), effective, 0.92),
      );
    },
    [
      image,
      keyColor,
      debouncedTolerance,
      debouncedSoftness,
      mode,
      debouncedTrim,
      background,
      format,
    ],
  );

  // Live preview.
  useEffect(() => {
    if (!image || !sourceRef.current) {
      releasePreview(null);
      return;
    }

    const runId = ++runIdRef.current;
    let cancelled = false;

    const run = async () => {
      setProcessing(true);
      try {
        const source = sourceRef.current!;
        const { removedRatio: ratio } = removeBackground(source, {
          color: keyColor,
          tolerance: debouncedTolerance,
          softness: debouncedSoftness,
          mode,
          trim: debouncedTrim,
        });
        const blob = await render();
        if (cancelled || runId !== runIdRef.current) return;
        setRemovedRatio(ratio);
        setOutputSize(blob?.size ?? null);
        releasePreview(blob ? URL.createObjectURL(blob) : null);
      } catch (caught) {
        if (!cancelled) setError((caught as Error).message);
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
    keyColor,
    debouncedTolerance,
    debouncedSoftness,
    mode,
    debouncedTrim,
    background,
    format,
    render,
    releasePreview,
    setError,
  ]);

  /** Eyedropper: map a click on the preview back to source pixels. */
  const pickColor = (event: React.MouseEvent<HTMLImageElement>) => {
    const source = sourceRef.current;
    if (!picking || !source) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * source.width;
    const y = ((event.clientY - rect.top) / rect.height) * source.height;
    setKeyColor(samplePixel(source, x, y));
    setPicking(false);
  };

  const onBackgroundImage = async (file: File) => {
    try {
      const bitmap = await createImageBitmap(file);
      if (bgUrlRef.current) URL.revokeObjectURL(bgUrlRef.current);
      const url = URL.createObjectURL(file);
      bgUrlRef.current = url;
      setBackground((current) => ({ ...current, imageSource: bitmap, imageUrl: url }));
    } catch {
      setError("Could not load that background image.");
    }
  };

  const download = async () => {
    if (!image) return;
    setProcessing(true);
    // Export at the original resolution, not the preview size.
    const blob = await render(image.width, image.height);
    setProcessing(false);
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const extension = blob.type === "image/webp" ? "webp" : blob.type === "image/jpeg" ? "jpg" : "png";
    downloadBlob(url, renameExtension(`${image.file.name.replace(/\.[^.]+$/, "")}-nobg`, extension));
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    if (sourceRef.current) setKeyColor(autoDetectBackground(sourceRef.current));
    setTolerance(12);
    setSoftness(8);
    setMode("contiguous");
    setTrim(0);
    setBackground(defaultBackgroundState);
    setFormat("image/png");
  };

  return (
    <div className="space-y-5">
      <ImageDropzone
        image={image}
        error={error}
        loading={loading}
        onSelect={accept}
        onClear={() => {
          clear();
          releasePreview(null);
        }}
      />

      {image ? (
        <>
          <div className="grid gap-5 lg:grid-cols-5">
            <Card className="space-y-4 lg:col-span-2">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold">Removal</h2>
                <Button variant="ghost" size="sm" onClick={reset} className="h-7 px-2 text-xs">
                  Reset
                </Button>
              </div>

              {/* Key colour */}
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Background colour
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className="h-9 w-12 shrink-0 rounded-lg ring-1 ring-inset ring-black/10"
                    style={{ backgroundColor: toHex(keyColor) }}
                  />
                  <code className="min-w-0 flex-1 truncate font-mono text-sm">
                    {toHex(keyColor)}
                  </code>
                  <Button
                    variant={picking ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setPicking((value) => !value)}
                  >
                    <Pipette className="h-3.5 w-3.5" />
                    {picking ? "Click image" : "Pick"}
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-full px-2 text-xs"
                  onClick={() =>
                    sourceRef.current && setKeyColor(autoDetectBackground(sourceRef.current))
                  }
                >
                  <WandSparkles className="h-3.5 w-3.5" />
                  Auto-detect from corners
                </Button>
              </div>

              <Slider
                label="Tolerance"
                value={tolerance}
                min={0}
                max={60}
                suffix="%"
                hint="How different a pixel can be and still count as background."
                onChange={setTolerance}
              />
              <Slider
                label="Edge softness"
                value={softness}
                min={0}
                max={40}
                suffix="%"
                hint="Fades the cut edge to avoid a jagged outline."
                onChange={setSoftness}
              />
              <Slider
                label="Trim halo"
                value={trim}
                min={0}
                max={4}
                suffix="px"
                hint="Shrinks the subject slightly to cut leftover fringing."
                onChange={setTrim}
              />

              <div className="space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Match
                </span>
                <Segmented
                  options={[
                    { value: "contiguous", label: "Edges only" },
                    { value: "global", label: "Whole image" },
                  ]}
                  value={mode}
                  onChange={setMode}
                  size="sm"
                  aria-label="Removal mode"
                />
                <p className="text-xs muted">
                  {mode === "contiguous"
                    ? "Only clears background connected to the image border, so matching colours inside the subject are kept."
                    : "Clears every matching pixel, including any inside the subject."}
                </p>
              </div>
            </Card>

            <div className="space-y-4 lg:col-span-3">
              <Card className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Result
                  </span>
                  {picking ? (
                    <span className="text-xs font-medium text-brand-600 dark:text-brand-400">
                      Click the image to sample a colour
                    </span>
                  ) : null}
                </div>

                <div
                  className={cn(
                    "flex min-h-[18rem] items-center justify-center overflow-hidden rounded-xl",
                    "bg-[repeating-conic-gradient(#e2e8f0_0_25%,transparent_0_50%)] bg-[length:16px_16px]",
                    "dark:bg-[repeating-conic-gradient(#334155_0_25%,transparent_0_50%)]",
                  )}
                >
                  {processing && !previewUrl ? (
                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                  ) : previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Background removed"
                      onClick={pickColor}
                      className={cn(
                        "max-h-80 max-w-full object-contain",
                        picking && "cursor-crosshair",
                      )}
                    />
                  ) : (
                    <p className="px-4 text-center text-sm muted">Adjust the settings.</p>
                  )}
                </div>
              </Card>

              <Card>
                <BackgroundPicker
                  value={background}
                  onChange={setBackground}
                  onImageSelect={onBackgroundImage}
                />
              </Card>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatTile
                  label="Removed"
                  value={`${formatDecimal(removedRatio * 100, 1)}%`}
                  hint="of all pixels"
                  icon="Eraser"
                />
                <StatTile
                  label="Output"
                  value={outputSize ? formatFileSize(outputSize) : "—"}
                  hint="preview size"
                  icon="Download"
                />
                <StatTile
                  label="Export"
                  value={`${image.width}×${image.height}`}
                  hint="full resolution"
                  icon="Maximize"
                />
                <StatTile
                  label="Alpha"
                  value={background.kind === "transparent" ? "Kept" : "Filled"}
                  icon="Droplet"
                />
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Segmented
                  options={[
                    { value: "image/png", label: "PNG" },
                    { value: "image/webp", label: "WebP" },
                    { value: "image/jpeg", label: "JPEG" },
                  ]}
                  value={format}
                  onChange={(next) => setFormat(next as OutputFormat)}
                  size="sm"
                  className="sm:max-w-xs"
                  aria-label="Export format"
                />
                <Button onClick={download} disabled={processing} size="lg" className="flex-1">
                  {processing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  Download full resolution
                </Button>
              </div>

              {background.kind === "transparent" && format === "image/jpeg" ? (
                <p className="rounded-xl bg-amber-50 px-3 py-2.5 text-xs font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                  JPEG cannot store transparency — the file will be saved as PNG instead. Pick a
                  solid or gradient background to export JPEG.
                </p>
              ) : null}
            </div>
          </div>

          <p className="rounded-xl bg-slate-50 px-4 py-3 text-xs muted dark:bg-slate-900/60">
            This is a <strong>colour-key</strong> remover, not an AI matting model. It runs fully
            offline and works excellently on uniform backgrounds — product shots, logos, scans and
            studio photos. It cannot reliably separate a subject from a busy or detailed background.
            The preview is computed at up to {PREVIEW_MAX}px for speed; downloads are rendered at
            the original resolution.
          </p>
        </>
      ) : null}
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  suffix,
  hint,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  suffix: string;
  hint?: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {label}
        </span>
        <span className="font-mono text-sm font-semibold tabular-nums">
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-label={label}
        className="w-full accent-brand-600"
      />
      {hint ? <p className="text-xs muted">{hint}</p> : null}
    </div>
  );
}
