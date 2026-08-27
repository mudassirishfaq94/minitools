import { useRef } from "react";
import { ImageUp, Trash2 } from "lucide-react";
import { Segmented } from "@/components/ui/Segmented";
import { cn } from "@/utils/cn";
import {
  fillToCss,
  gradientPresets,
  solidPresets,
  type BackgroundFill,
  type GradientKind,
} from "@/utils/background";

export type BackgroundKind = "transparent" | "solid" | "gradient" | "image";

export interface BackgroundState {
  kind: BackgroundKind;
  solid: string;
  gradientKind: GradientKind;
  gradientAngle: number;
  gradientStops: string[];
  /** Custom background image, when `kind` is "image". */
  imageSource: CanvasImageSource | null;
  imageUrl: string | null;
  imageFit: "cover" | "contain" | "stretch";
}

export const defaultBackgroundState: BackgroundState = {
  kind: "transparent",
  solid: "#FFFFFF",
  gradientKind: "linear",
  gradientAngle: 135,
  gradientStops: ["#6366F1", "#A855F7"],
  imageSource: null,
  imageUrl: null,
  imageFit: "cover",
};

/** Converts the picker state into the fill the canvas engine consumes. */
export function toFill(state: BackgroundState): BackgroundFill {
  switch (state.kind) {
    case "solid":
      return { type: "solid", color: state.solid };
    case "gradient":
      return {
        type: "gradient",
        kind: state.gradientKind,
        angle: state.gradientAngle,
        stops: state.gradientStops,
      };
    case "image":
      return state.imageSource
        ? { type: "image", source: state.imageSource, fit: state.imageFit }
        : { type: "transparent" };
    default:
      return { type: "transparent" };
  }
}

/** CSS preview string for the current state. */
export function toCssPreview(state: BackgroundState): string {
  return fillToCss(toFill(state));
}

interface BackgroundPickerProps {
  value: BackgroundState;
  onChange: (next: BackgroundState) => void;
  /** Called with the file chosen for a custom image background. */
  onImageSelect: (file: File) => void;
  /** Hide the transparent option for tools that always need a fill. */
  allowTransparent?: boolean;
  className?: string;
}

/**
 * Reusable background chooser: transparent, solid colour, gradient or a
 * custom uploaded image. Shared by the Background Remover and any future
 * tool that composites onto a background.
 */
export function BackgroundPicker({
  value,
  onChange,
  onImageSelect,
  allowTransparent = true,
  className,
}: BackgroundPickerProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const set = (patch: Partial<BackgroundState>) => onChange({ ...value, ...patch });

  const kinds = [
    ...(allowTransparent ? [{ value: "transparent" as const, label: "None" }] : []),
    { value: "solid" as const, label: "Solid" },
    { value: "gradient" as const, label: "Gradient" },
    { value: "image" as const, label: "Image" },
  ];

  return (
    <div className={cn("space-y-3", className)}>
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Background
      </span>

      <Segmented
        options={kinds}
        value={value.kind}
        onChange={(kind) => set({ kind })}
        size="sm"
        aria-label="Background type"
      />

      {/* Solid ---------------------------------------------------- */}
      {value.kind === "solid" ? (
        <div className="space-y-2">
          <div className="grid grid-cols-6 gap-2">
            {solidPresets.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => set({ solid: color })}
                aria-label={`Use ${color}`}
                aria-pressed={value.solid.toUpperCase() === color}
                className={cn(
                  "h-8 rounded-lg ring-1 ring-inset ring-black/10 transition-transform hover:scale-105",
                  value.solid.toUpperCase() === color &&
                    "ring-2 ring-brand-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-900",
                )}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="color"
              value={value.solid}
              onChange={(event) => set({ solid: event.target.value.toUpperCase() })}
              aria-label="Custom background colour"
              className="h-9 w-12 shrink-0 cursor-pointer rounded-lg border border-slate-200 bg-transparent dark:border-slate-700"
            />
            <input
              value={value.solid}
              onChange={(event) => set({ solid: event.target.value })}
              aria-label="Background colour value"
              className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-950/60"
            />
          </div>
        </div>
      ) : null}

      {/* Gradient ------------------------------------------------- */}
      {value.kind === "gradient" ? (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {gradientPresets.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() =>
                  set({
                    gradientKind: preset.kind,
                    gradientAngle: preset.angle,
                    gradientStops: preset.stops,
                  })
                }
                title={preset.name}
                className="h-10 rounded-lg ring-1 ring-inset ring-black/10 transition-transform hover:scale-105"
                style={{
                  background:
                    preset.kind === "radial"
                      ? `radial-gradient(circle, ${preset.stops.join(", ")})`
                      : `linear-gradient(${preset.angle}deg, ${preset.stops.join(", ")})`,
                }}
              />
            ))}
          </div>

          <Segmented
            options={[
              { value: "linear", label: "Linear" },
              { value: "radial", label: "Radial" },
            ]}
            value={value.gradientKind}
            onChange={(gradientKind) => set({ gradientKind })}
            size="sm"
            aria-label="Gradient type"
          />

          <div className="flex items-center gap-2">
            {value.gradientStops.map((stop, index) => (
              <input
                key={index}
                type="color"
                value={stop}
                onChange={(event) => {
                  const stops = [...value.gradientStops];
                  stops[index] = event.target.value.toUpperCase();
                  set({ gradientStops: stops });
                }}
                aria-label={`Gradient colour ${index + 1}`}
                className="h-9 w-full cursor-pointer rounded-lg border border-slate-200 bg-transparent dark:border-slate-700"
              />
            ))}
            <button
              type="button"
              onClick={() =>
                set({
                  gradientStops:
                    value.gradientStops.length >= 4
                      ? value.gradientStops.slice(0, 2)
                      : [...value.gradientStops, "#FFFFFF"],
                })
              }
              className="shrink-0 rounded-lg bg-slate-100 px-2.5 py-2 text-xs font-medium transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
            >
              {value.gradientStops.length >= 4 ? "Reset" : "+ Stop"}
            </button>
          </div>

          {value.gradientKind === "linear" ? (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium muted">Angle</span>
                <span className="font-mono tabular-nums">{value.gradientAngle}°</span>
              </div>
              <input
                type="range"
                min={0}
                max={360}
                value={value.gradientAngle}
                onChange={(event) => set({ gradientAngle: Number(event.target.value) })}
                aria-label="Gradient angle"
                className="w-full accent-brand-600"
              />
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Image ---------------------------------------------------- */}
      {value.kind === "image" ? (
        <div className="space-y-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="sr-only"
            aria-label="Choose a background image"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onImageSelect(file);
              event.target.value = "";
            }}
          />

          {value.imageUrl ? (
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-2 dark:border-slate-800">
              <img
                src={value.imageUrl}
                alt="Background"
                className="h-14 w-14 shrink-0 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <Segmented
                  options={[
                    { value: "cover", label: "Cover" },
                    { value: "contain", label: "Contain" },
                    { value: "stretch", label: "Stretch" },
                  ]}
                  value={value.imageFit}
                  onChange={(imageFit) => set({ imageFit })}
                  size="sm"
                  aria-label="Background image fit"
                />
              </div>
              <button
                type="button"
                onClick={() => set({ imageSource: null, imageUrl: null })}
                aria-label="Remove background image"
                className="shrink-0 rounded-lg p-2 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-slate-300 px-4 py-6 text-center transition-colors hover:border-slate-400 dark:border-slate-700"
            >
              <ImageUp className="h-5 w-5 text-slate-400" />
              <span className="text-xs font-medium">Choose a background image</span>
            </button>
          )}
        </div>
      ) : null}

      {/* Preview -------------------------------------------------- */}
      <div
        className={cn(
          "h-10 rounded-lg ring-1 ring-inset ring-black/10",
          value.kind === "transparent" &&
            "bg-[repeating-conic-gradient(#e2e8f0_0_25%,transparent_0_50%)] bg-[length:12px_12px] dark:bg-[repeating-conic-gradient(#334155_0_25%,transparent_0_50%)]",
        )}
        style={
          value.kind === "image" && value.imageUrl
            ? { backgroundImage: `url(${value.imageUrl})`, backgroundSize: "cover" }
            : value.kind !== "transparent"
              ? { background: toCssPreview(value) }
              : undefined
        }
        aria-hidden="true"
      />
    </div>
  );
}
