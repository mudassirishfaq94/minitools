import { useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Field";
import { ResultPanel } from "@/components/tools/ResultPanel";
import { CopyButton } from "@/components/ui/CopyButton";
import { hslToRgb, parseColor, readableTextColor, rgbToHex } from "@/utils/color";
import { cn } from "@/utils/cn";

const DEFAULT_COLOR = "#6366F1";

export function ColorConverter() {
  const [input, setInput] = useState(DEFAULT_COLOR);

  const color = useMemo(() => parseColor(input), [input]);
  const hex = color?.hex ?? "#000000";

  const shades = useMemo(() => {
    if (!color) return [];
    return [90, 75, 60, 45, 30, 15].map((lightness) => ({
      lightness,
      hex: rgbToHex(hslToRgb({ h: color.hsl.h, s: color.hsl.s, l: lightness })),
    }));
  }, [color]);

  return (
    <div className="grid gap-5 lg:grid-cols-5">
      <Card className="space-y-4 lg:col-span-2">
        <Input
          label="Color value"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="#6366F1, rgb(99 102 241) or hsl(239 84% 67%)"
          className="font-mono text-[13px]"
          error={input.trim() && !color ? "Unrecognised color format." : undefined}
          action={
            <div className="flex items-center gap-1.5">
              <input
                type="color"
                value={hex}
                onChange={(event) => setInput(event.target.value)}
                aria-label="Pick a color"
                className="h-7 w-10 cursor-pointer rounded border border-slate-200 bg-transparent dark:border-slate-700"
              />
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setInput(DEFAULT_COLOR)}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </Button>
            </div>
          }
        />

        <div
          className={cn(
            "flex h-32 items-end justify-between rounded-xl p-4 transition-colors",
            !color && "bg-slate-100 dark:bg-slate-800",
          )}
          style={color ? { backgroundColor: hex, color: readableTextColor(color.rgb) } : undefined}
        >
          <span className="font-mono text-sm font-semibold">{hex}</span>
          <span className="font-mono text-xs opacity-80">
            {color ? `${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}` : "—"}
          </span>
        </div>

        {shades.length > 0 ? (
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Shades & tints
            </span>
            {/* Three columns on phones: six would squeeze the hex label
                past the cell width and overflow the card. */}
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {shades.map((shade) => (
                <div key={shade.lightness} className="min-w-0 space-y-1">
                  <div
                    className="h-10 w-full rounded-lg ring-1 ring-inset ring-black/5"
                    style={{ backgroundColor: shade.hex }}
                  />
                  <CopyButton
                    value={shade.hex}
                    label={shade.hex.replace("#", "")}
                    className="w-full justify-center overflow-hidden px-1 text-[10px]"
                  />
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </Card>

      <div className="space-y-4 lg:col-span-3">
        <ResultPanel label="HEX" value={hex} />
        <ResultPanel
          label="RGB"
          value={color ? `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})` : ""}
        />
        <ResultPanel
          label="HSL"
          value={color ? `hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)` : ""}
        />
        <ResultPanel label="CSS custom property" value={color ? `--color: ${hex};` : ""} />

        <p className="text-xs muted">
          Paste a value in any of these formats: <code className="font-mono">#6366F1</code>,{" "}
          <code className="font-mono">#66f</code>, <code className="font-mono">rgb(99 102 241)</code>{" "}
          or <code className="font-mono">hsl(239 84% 67%)</code>.
        </p>
      </div>
    </div>
  );
}
