import { useCallback, useMemo, useState } from "react";
import { Download, Loader2, RotateCcw, Shuffle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { Segmented } from "@/components/ui/Segmented";
import { NumberField, validateNumber } from "@/components/tools/NumberField";
import { cn } from "@/utils/cn";
import {
  buildPatternSvg,
  defaultPatternOptions,
  patternCss,
  patternDataUri,
  patternTailwind,
  patterns,
  rasterisePattern,
  type PatternId,
  type PatternOptions,
} from "@/utils/patterns";
import { downloadBlob } from "@/utils/image";
import { secureRandomInt } from "@/utils/random";
import { hslToRgb, rgbToHex } from "@/utils/color";

type ExportTab = "css" | "svg" | "tailwind";

const PALETTES: [string, string][] = [
  ["#6366F1", "#EEF2FF"],
  ["#0F172A", "#F8FAFC"],
  ["#10B981", "#ECFDF5"],
  ["#F59E0B", "#FFFBEB"],
  ["#EC4899", "#FDF2F8"],
  ["#06B6D4", "#ECFEFF"],
  ["#FFFFFF", "#1E293B"],
  ["#94A3B8", "#0F172A"],
];

export function PatternGenerator() {
  const [pattern, setPattern] = useState<PatternId>("dots");
  const [options, setOptions] = useState<PatternOptions>(defaultPatternOptions);
  const [tab, setTab] = useState<ExportTab>("css");
  const [exportWidth, setExportWidth] = useState("1920");
  const [exportHeight, setExportHeight] = useState("1080");
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const set = <K extends keyof PatternOptions>(key: K, value: PatternOptions[K]) =>
    setOptions((current) => ({ ...current, [key]: value }));

  const widthField = validateNumber(exportWidth, {
    integer: true,
    min: 16,
    max: 8000,
    label: "Width",
  });
  const heightField = validateNumber(exportHeight, {
    integer: true,
    min: 16,
    max: 8000,
    label: "Height",
  });

  const svg = useMemo(() => buildPatternSvg(pattern, options), [pattern, options]);
  const dataUri = useMemo(() => patternDataUri(svg), [svg]);
  const css = useMemo(() => patternCss(pattern, options), [pattern, options]);
  const tailwind = useMemo(() => patternTailwind(pattern, options), [pattern, options]);

  const exportValue = tab === "css" ? css : tab === "svg" ? svg : tailwind;

  const randomize = useCallback(() => {
    const [foreground, background] = PALETTES[secureRandomInt(0, PALETTES.length - 1)];
    setPattern(patterns[secureRandomInt(0, patterns.length - 1)].id);
    setOptions({
      foreground,
      background,
      size: secureRandomInt(16, 64),
      weight: secureRandomInt(1, 5),
      opacity: secureRandomInt(6, 10) / 10,
      rotation: secureRandomInt(0, 3) * 45,
    });
  }, []);

  const randomizeColors = useCallback(() => {
    const hue = secureRandomInt(0, 359);
    setOptions((current) => ({
      ...current,
      foreground: rgbToHex(hslToRgb({ h: hue, s: 70, l: 55 })),
      background: rgbToHex(hslToRgb({ h: hue, s: 60, l: 96 })),
    }));
  }, []);

  const download = async () => {
    if (widthField.value === null || heightField.value === null) return;
    setExporting(true);
    setExportError(null);
    try {
      const blob = await rasterisePattern(
        pattern,
        options,
        widthField.value,
        heightField.value,
      );
      const url = URL.createObjectURL(blob);
      downloadBlob(url, `pattern-${pattern}-${widthField.value}x${heightField.value}.png`);
      URL.revokeObjectURL(url);
    } catch (caught) {
      setExportError((caught as Error).message);
    } finally {
      setExporting(false);
    }
  };

  const downloadSvg = () => {
    const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    downloadBlob(url, `pattern-${pattern}.svg`);
  };

  const reset = () => {
    setPattern("dots");
    setOptions(defaultPatternOptions);
    setExportWidth("1920");
    setExportHeight("1080");
    setExportError(null);
  };

  return (
    <div className="space-y-5">
      {/* Live preview ------------------------------------------------ */}
      <Card padded={false} className="overflow-hidden">
        <div
          className="flex h-56 items-center justify-center sm:h-72"
          style={{
            backgroundColor: options.background,
            backgroundImage: dataUri,
            backgroundSize: `${options.size}px ${options.size}px`,
          }}
        >
          <span
            className="rounded-xl bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur"
          >
            Live preview
          </span>
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-5">
        {/* Controls -------------------------------------------------- */}
        <Card className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold">Pattern</h2>
            <div className="flex gap-1.5">
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={randomize}>
                <Shuffle className="h-3.5 w-3.5" />
                Surprise me
              </Button>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={reset}>
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-3">
            {patterns.map((item) => {
              const thumb = buildPatternSvg(item.id, {
                ...options,
                size: 24,
                weight: Math.min(options.weight, 3),
              });
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setPattern(item.id)}
                  aria-pressed={pattern === item.id}
                  title={item.description}
                  className={cn(
                    "overflow-hidden rounded-xl border transition-all",
                    pattern === item.id
                      ? "border-brand-400 ring-2 ring-brand-500/30"
                      : "border-slate-200 hover:border-slate-300 dark:border-slate-800",
                  )}
                >
                  <span
                    className="block h-10 w-full"
                    style={{
                      backgroundColor: options.background,
                      backgroundImage: patternDataUri(thumb),
                      backgroundSize: "24px 24px",
                    }}
                  />
                  <span className="block truncate px-1 py-1 text-[10px] font-medium">
                    {item.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Colours */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Colours
              </span>
              <button
                type="button"
                onClick={randomizeColors}
                className="rounded-lg px-2 py-1 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Random pair
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <ColorRow
                label="Shape"
                value={options.foreground}
                onChange={(value) => set("foreground", value)}
              />
              <ColorRow
                label="Background"
                value={options.background}
                onChange={(value) => set("background", value)}
              />
            </div>

            <div className="grid grid-cols-4 gap-2">
              {PALETTES.map(([fg, bg]) => (
                <button
                  key={`${fg}-${bg}`}
                  type="button"
                  onClick={() => setOptions((current) => ({ ...current, foreground: fg, background: bg }))}
                  aria-label={`Use ${fg} on ${bg}`}
                  className="h-8 overflow-hidden rounded-lg ring-1 ring-inset ring-black/10 transition-transform hover:scale-105"
                  style={{ backgroundColor: bg }}
                >
                  <span
                    className="mx-auto block h-3 w-3 rounded-full"
                    style={{ backgroundColor: fg }}
                  />
                </button>
              ))}
            </div>
          </div>

          <Slider
            label="Tile size"
            value={options.size}
            min={8}
            max={120}
            suffix="px"
            onChange={(value) => set("size", value)}
          />
          <Slider
            label="Thickness"
            value={options.weight}
            min={1}
            max={12}
            suffix="px"
            onChange={(value) => set("weight", value)}
          />
          <Slider
            label="Opacity"
            value={Math.round(options.opacity * 100)}
            min={5}
            max={100}
            suffix="%"
            onChange={(value) => set("opacity", value / 100)}
          />
          <Slider
            label="Rotation"
            value={options.rotation}
            min={0}
            max={359}
            suffix="°"
            onChange={(value) => set("rotation", value)}
          />
        </Card>

        {/* Export ----------------------------------------------------- */}
        <div className="space-y-4 lg:col-span-3">
          <Card className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-sm font-semibold">Copy the code</h3>
              <Segmented
                options={[
                  { value: "css", label: "CSS" },
                  { value: "svg", label: "SVG" },
                  { value: "tailwind", label: "Tailwind" },
                ]}
                value={tab}
                onChange={setTab}
                size="sm"
                className="sm:max-w-xs"
                aria-label="Export format"
              />
            </div>

            <div className="relative">
              <pre className="max-h-56 overflow-auto rounded-xl bg-slate-950 p-4 font-mono text-[12px] leading-relaxed text-slate-200 scrollbar-thin">
                {exportValue}
              </pre>
              <div className="absolute top-2 right-2">
                <CopyButton value={exportValue} />
              </div>
            </div>

            <p className="text-xs muted">
              {tab === "css"
                ? "Paste directly into any rule. The pattern is an inline SVG data URI — no image request."
                : tab === "svg"
                  ? "A standalone tiling SVG you can save or inline in markup."
                  : "Arbitrary-value Tailwind utilities for the same pattern."}
            </p>
          </Card>

          <Card className="space-y-3">
            <h3 className="text-sm font-semibold">Download as image</h3>

            <div className="grid grid-cols-2 gap-3">
              <NumberField
                label="Width"
                value={exportWidth}
                onChange={setExportWidth}
                error={widthField.error}
                suffix="px"
                presets={[1080, 1920, 2560]}
              />
              <NumberField
                label="Height"
                value={exportHeight}
                onChange={setExportHeight}
                error={heightField.error}
                suffix="px"
                presets={[1080, 1350, 1440]}
              />
            </div>

            {exportError ? (
              <p role="alert" className="text-xs font-medium text-rose-600 dark:text-rose-400">
                {exportError}
              </p>
            ) : null}

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                onClick={download}
                disabled={exporting || !widthField.value || !heightField.value}
                className="flex-1"
              >
                {exporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Download PNG
              </Button>
              <Button variant="outline" onClick={downloadSvg} className="flex-1">
                <Download className="h-4 w-4" />
                Download SVG
              </Button>
            </div>
          </Card>

          <p className="rounded-xl bg-slate-50 px-4 py-3 text-xs muted dark:bg-slate-900/60">
            Patterns are pure SVG generated in your browser. As a data URI they add no network
            request and scale crisply at any resolution, which makes them far lighter than a
            repeating raster tile.
          </p>
        </div>
      </div>
    </div>
  );
}

function ColorRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1">
      <span className="text-[11px] font-medium muted">{label}</span>
      <div className="flex items-center gap-1.5">
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value.toUpperCase())}
          aria-label={`${label} colour`}
          className="h-9 w-10 shrink-0 cursor-pointer rounded-lg border border-slate-200 bg-transparent dark:border-slate-700"
        />
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-label={`${label} value`}
          className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2 py-2 font-mono text-xs outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-950/60"
        />
      </div>
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  suffix: string;
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
    </div>
  );
}
