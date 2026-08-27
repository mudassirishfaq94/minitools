import { useCallback, useMemo, useState } from "react";
import { Check, RotateCcw, Shuffle, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { Segmented } from "@/components/ui/Segmented";
import { StatTile } from "@/components/tools/StatTile";
import {
  buildHarmony,
  buildScale,
  checkContrast,
  colorFormats,
  harmonies,
  hslToRgb,
  parseColor,
  readableTextColor,
  rgbToHex,
  type HarmonyId,
} from "@/utils/color";
import { secureRandomInt } from "@/utils/random";
import { cn } from "@/utils/cn";
import { formatDecimal } from "@/utils/number";

const DEFAULT_COLOR = "#6366F1";

export function ColorPicker() {
  const [input, setInput] = useState(DEFAULT_COLOR);
  const [harmony, setHarmony] = useState<HarmonyId>("analogous");
  const [against, setAgainst] = useState("#FFFFFF");
  const [saved, setSaved] = useState<string[]>([]);

  const color = useMemo(() => parseColor(input), [input]);
  const compare = useMemo(() => parseColor(against), [against]);

  const hex = color?.hex ?? DEFAULT_COLOR;
  const formats = color ? colorFormats(color) : null;
  const palette = color ? buildHarmony(color.hsl, harmony) : [];
  const scale = color ? buildScale(color.hsl) : [];
  const contrast = color && compare ? checkContrast(color.rgb, compare.rgb) : null;

  const randomize = useCallback(() => {
    const random = rgbToHex(
      hslToRgb({
        h: secureRandomInt(0, 359),
        s: secureRandomInt(45, 95),
        l: secureRandomInt(35, 65),
      }),
    );
    setInput(random);
  }, []);

  const reset = () => {
    setInput(DEFAULT_COLOR);
    setHarmony("analogous");
    setAgainst("#FFFFFF");
  };

  const toggleSaved = (value: string) =>
    setSaved((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value].slice(-24),
    );

  // Update the HSL channels while keeping the other two fixed.
  const updateChannel = (channel: "h" | "s" | "l", value: number) => {
    if (!color) return;
    setInput(rgbToHex(hslToRgb({ ...color.hsl, [channel]: value })));
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-5">
        {/* Picker ---------------------------------------------------- */}
        <Card className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold">Pick a colour</h2>
            <div className="flex gap-1.5">
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={randomize}>
                <Shuffle className="h-3.5 w-3.5" />
                Random
              </Button>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={reset}>
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </Button>
            </div>
          </div>

          <div
            className="flex h-36 items-end justify-between rounded-xl p-4 transition-colors"
            style={
              color
                ? { backgroundColor: hex, color: readableTextColor(color.rgb) }
                : { background: "var(--color-slate-200)" }
            }
          >
            <span className="font-mono text-lg font-semibold">{hex}</span>
            <button
              type="button"
              onClick={() => toggleSaved(hex)}
              aria-label={saved.includes(hex) ? "Remove from palette" : "Save to palette"}
              className="rounded-lg bg-black/15 px-2.5 py-1 text-xs font-medium backdrop-blur transition-colors hover:bg-black/25"
            >
              {saved.includes(hex) ? "Saved" : "Save"}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="color"
              value={hex}
              onChange={(event) => setInput(event.target.value.toUpperCase())}
              aria-label="Colour picker"
              className="h-11 w-14 shrink-0 cursor-pointer rounded-lg border border-slate-200 bg-transparent dark:border-slate-700"
            />
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              aria-label="Colour value"
              aria-invalid={input.trim() && !color ? true : undefined}
              placeholder="#6366F1, rgb(…) or hsl(…)"
              className={cn(
                "min-w-0 flex-1 rounded-lg border bg-white px-3 py-2.5 font-mono text-sm outline-none transition-colors dark:bg-slate-950/60",
                input.trim() && !color
                  ? "border-rose-400 dark:border-rose-500/60"
                  : "border-slate-200 focus:border-brand-500 dark:border-slate-800",
              )}
            />
          </div>

          {input.trim() && !color ? (
            <p role="alert" className="text-xs font-medium text-rose-600 dark:text-rose-400">
              Unrecognised colour. Try a HEX, rgb() or hsl() value.
            </p>
          ) : null}

          {color ? (
            <div className="space-y-3 pt-1">
              <ChannelSlider
                label="Hue"
                value={color.hsl.h}
                max={360}
                suffix="°"
                onChange={(value) => updateChannel("h", value)}
                trackStyle={{
                  background:
                    "linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)",
                }}
              />
              <ChannelSlider
                label="Saturation"
                value={color.hsl.s}
                max={100}
                suffix="%"
                onChange={(value) => updateChannel("s", value)}
                trackStyle={{
                  background: `linear-gradient(to right, ${rgbToHex(
                    hslToRgb({ ...color.hsl, s: 0 }),
                  )}, ${rgbToHex(hslToRgb({ ...color.hsl, s: 100 }))})`,
                }}
              />
              <ChannelSlider
                label="Lightness"
                value={color.hsl.l}
                max={100}
                suffix="%"
                onChange={(value) => updateChannel("l", value)}
                trackStyle={{
                  background: `linear-gradient(to right, #000, ${rgbToHex(
                    hslToRgb({ ...color.hsl, l: 50 }),
                  )}, #fff)`,
                }}
              />
            </div>
          ) : null}
        </Card>

        {/* Formats and contrast -------------------------------------- */}
        <div className="space-y-4 lg:col-span-3">
          {formats ? (
            <Card padded={false} className="overflow-hidden">
              <h3 className="border-b border-slate-200 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400">
                Formats
              </h3>
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {[
                  ["HEX", formats.hex],
                  ["RGB", formats.rgb],
                  ["HSL", formats.hsl],
                  ["RGB (space)", formats.rgbSpace],
                  ["HSL (space)", formats.hslSpace],
                  ["CSS variable", formats.cssVar],
                ].map(([label, value]) => (
                  <li key={label} className="flex items-center gap-3 px-4 py-2">
                    <span className="w-28 shrink-0 text-xs muted">{label}</span>
                    <code className="min-w-0 flex-1 truncate font-mono text-sm">{value}</code>
                    <CopyButton iconOnly value={value} label={`Copy ${label}`} className="h-8 w-8" />
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}

          {contrast && compare ? (
            <Card className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold">Contrast check</h3>
                <input
                  type="color"
                  value={compare.hex}
                  onChange={(event) => setAgainst(event.target.value.toUpperCase())}
                  aria-label="Background colour to compare against"
                  className="h-8 w-12 cursor-pointer rounded border border-slate-200 bg-transparent dark:border-slate-700"
                />
              </div>

              <div
                className="rounded-xl p-4 text-center"
                style={{ backgroundColor: compare.hex, color: hex }}
              >
                <p className="text-lg font-semibold">Sample text</p>
                <p className="text-sm">The quick brown fox jumps over the lazy dog.</p>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-sm muted">Ratio</span>
                <span className="font-mono text-lg font-semibold tabular-nums">
                  {formatDecimal(contrast.ratio, 2)}:1
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <ContrastBadge label="AA normal" pass={contrast.aaNormal} />
                <ContrastBadge label="AA large" pass={contrast.aaLarge} />
                <ContrastBadge label="AAA normal" pass={contrast.aaaNormal} />
                <ContrastBadge label="AAA large" pass={contrast.aaaLarge} />
              </div>
            </Card>
          ) : null}

          {color ? (
            <div className="grid grid-cols-3 gap-3">
              <StatTile label="Hue" value={`${color.hsl.h}°`} icon="Palette" />
              <StatTile label="Saturation" value={`${color.hsl.s}%`} icon="Droplet" />
              <StatTile label="Lightness" value={`${color.hsl.l}%`} icon="Sun" />
            </div>
          ) : null}
        </div>
      </div>

      {/* Harmony --------------------------------------------------- */}
      {palette.length > 0 ? (
        <Card className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-sm font-semibold">Colour harmony</h3>
            <CopyButton value={palette.join(", ")} label="Copy palette" />
          </div>

          <Segmented
            options={harmonies.map((item) => ({ value: item.id, label: item.name }))}
            value={harmony}
            onChange={setHarmony}
            size="sm"
            aria-label="Harmony type"
          />
          <p className="text-xs muted">
            {harmonies.find((item) => item.id === harmony)?.description}
          </p>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {palette.map((swatch, index) => (
              <Swatch
                key={`${swatch}-${index}`}
                hex={swatch}
                saved={saved.includes(swatch)}
                onSave={() => toggleSaved(swatch)}
                onSelect={() => setInput(swatch)}
              />
            ))}
          </div>
        </Card>
      ) : null}

      {/* Scale ----------------------------------------------------- */}
      {scale.length > 0 ? (
        <Card className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">Tint & shade scale</h3>
            <CopyButton
              value={scale.map((item) => `--${item.step}: ${item.hex};`).join("\n")}
              label="Copy as CSS"
            />
          </div>

          <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
            {scale.map((item) => (
              <button
                key={item.step}
                type="button"
                onClick={() => setInput(item.hex)}
                className="group space-y-1"
                title={`${item.step}: ${item.hex}`}
              >
                <span
                  className="block h-12 w-full rounded-lg ring-1 ring-inset ring-black/5 transition-transform group-hover:scale-105"
                  style={{ backgroundColor: item.hex }}
                />
                <span className="block text-[10px] font-medium muted">{item.step}</span>
              </button>
            ))}
          </div>
        </Card>
      ) : null}

      {/* Saved ----------------------------------------------------- */}
      {saved.length > 0 ? (
        <Card className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">Saved palette ({saved.length})</h3>
            <div className="flex gap-1.5">
              <CopyButton value={saved.join(", ")} label="Copy all" />
              <Button variant="ghost" size="sm" onClick={() => setSaved([])}>
                Clear
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-8">
            {saved.map((swatch) => (
              <Swatch
                key={swatch}
                hex={swatch}
                saved
                onSave={() => toggleSaved(swatch)}
                onSelect={() => setInput(swatch)}
              />
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}

function Swatch({
  hex,
  saved,
  onSave,
  onSelect,
}: {
  hex: string;
  saved: boolean;
  onSave: () => void;
  onSelect: () => void;
}) {
  // The save control is a sibling rather than a child of the swatch button:
  // nesting interactive elements is invalid HTML and breaks screen readers.
  return (
    <div className="space-y-1">
      <div className="relative">
        <button
          type="button"
          onClick={onSelect}
          className="block h-16 w-full rounded-xl ring-1 ring-inset ring-black/5 transition-transform hover:scale-[1.03]"
          style={{ backgroundColor: hex }}
          aria-label={`Use ${hex}`}
          title={`Use ${hex}`}
        />
        <button
          type="button"
          onClick={onSave}
          aria-label={saved ? `Remove ${hex} from palette` : `Save ${hex} to palette`}
          className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur transition-colors hover:bg-black/45"
        >
          {saved ? <X className="h-3 w-3" /> : <Check className="h-3 w-3" />}
        </button>
      </div>
      <div className="flex items-center gap-1">
        <code className="min-w-0 flex-1 truncate font-mono text-[10px] muted">{hex}</code>
        <CopyButton iconOnly value={hex} label={`Copy ${hex}`} className="h-6 w-6" />
      </div>
    </div>
  );
}

function ContrastBadge({ label, pass }: { label: string; pass: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium",
        pass
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
          : "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
      )}
    >
      {pass ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
      {label}
    </div>
  );
}

function ChannelSlider({
  label,
  value,
  max,
  suffix,
  onChange,
  trackStyle,
}: {
  label: string;
  value: number;
  max: number;
  suffix: string;
  onChange: (value: number) => void;
  trackStyle?: React.CSSProperties;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium muted">{label}</span>
        <span className="font-mono tabular-nums">
          {value}
          {suffix}
        </span>
      </div>
      <div className="relative">
        <div className="h-2 w-full rounded-full" style={trackStyle} />
        <input
          type="range"
          min={0}
          max={max}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          aria-label={label}
          className="absolute inset-0 h-2 w-full cursor-pointer opacity-0"
        />
        <span
          className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-white shadow ring-1 ring-slate-300"
          style={{ left: `${(value / max) * 100}%` }}
        />
      </div>
    </div>
  );
}
