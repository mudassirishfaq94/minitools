import { useCallback, useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { Download, RotateCcw, Share2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { Segmented } from "@/components/ui/Segmented";
import { StatTile } from "@/components/tools/StatTile";
import { NumberField, validateNumber } from "@/components/tools/NumberField";
import { cn } from "@/utils/cn";
import { formatBytes, formatNumber } from "@/utils/format";
import { parseColor } from "@/utils/color";

type ErrorLevel = "L" | "M" | "Q" | "H";

const LEVELS: { value: ErrorLevel; label: string; recovery: string }[] = [
  { value: "L", label: "Low", recovery: "~7%" },
  { value: "M", label: "Medium", recovery: "~15%" },
  { value: "Q", label: "Quartile", recovery: "~25%" },
  { value: "H", label: "High", recovery: "~30%" },
];

const PRESETS = [
  { label: "URL", value: "https://toolstack.dev" },
  { label: "Email", value: "mailto:hello@example.com?subject=Hello" },
  { label: "Phone", value: "tel:+15551234567" },
  { label: "SMS", value: "sms:+15551234567?body=Hi" },
  { label: "Wi-Fi", value: "WIFI:T:WPA;S:MyNetwork;P:MyPassword;;" },
  {
    label: "vCard",
    value:
      "BEGIN:VCARD\nVERSION:3.0\nN:Doe;Jane\nTEL:+15551234567\nEMAIL:jane@example.com\nEND:VCARD",
  },
];

const DEFAULTS = {
  text: "https://toolstack.dev",
  size: "320",
  margin: "2",
  level: "M" as ErrorLevel,
  dark: "#0F172A",
  light: "#FFFFFF",
};

/** QR capacity at each error-correction level (alphanumeric, version 40). */
const MAX_LENGTH = 2953;

export function QrCodeGenerator() {
  const [text, setText] = useState(DEFAULTS.text);
  const [size, setSize] = useState(DEFAULTS.size);
  const [margin, setMargin] = useState(DEFAULTS.margin);
  const [level, setLevel] = useState<ErrorLevel>(DEFAULTS.level);
  const [dark, setDark] = useState(DEFAULTS.dark);
  const [light, setLight] = useState(DEFAULTS.light);

  const [dataUrl, setDataUrl] = useState("");
  const [svg, setSvg] = useState("");
  const [error, setError] = useState<string | null>(null);

  const sizeField = validateNumber(size, { integer: true, min: 64, max: 2048, label: "Size" });
  const marginField = validateNumber(margin, { integer: true, min: 0, max: 16, label: "Margin" });

  const darkColor = parseColor(dark)?.hex ?? DEFAULTS.dark;
  const lightColor = parseColor(light)?.hex ?? DEFAULTS.light;

  const tooLong = text.length > MAX_LENGTH;

  const options = useMemo(
    () => ({
      errorCorrectionLevel: level,
      margin: marginField.value ?? 2,
      width: sizeField.value ?? 320,
      color: { dark: darkColor, light: lightColor },
    }),
    [level, marginField.value, sizeField.value, darkColor, lightColor],
  );

  // Render to PNG data URL and SVG whenever the inputs change.
  useEffect(() => {
    let cancelled = false;

    if (!text || tooLong) {
      setDataUrl("");
      setSvg("");
      setError(tooLong ? `Too much data — QR codes hold at most ${formatNumber(MAX_LENGTH)} characters.` : null);
      return;
    }

    Promise.all([QRCode.toDataURL(text, options), QRCode.toString(text, { ...options, type: "svg" })])
      .then(([png, svgMarkup]) => {
        if (cancelled) return;
        setDataUrl(png);
        setSvg(svgMarkup);
        setError(null);
      })
      .catch((caught: Error) => {
        if (cancelled) return;
        setDataUrl("");
        setSvg("");
        setError(caught.message || "Could not generate a QR code for this input.");
      });

    return () => {
      cancelled = true;
    };
  }, [text, options, tooLong]);

  const download = useCallback(
    (format: "png" | "svg") => {
      const href =
        format === "png"
          ? dataUrl
          : `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
      if (!href) return;

      const link = document.createElement("a");
      link.href = href;
      link.download = `qr-code.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    [dataUrl, svg],
  );

  /** Uses the Web Share API when the browser supports sharing files. */
  const share = useCallback(async () => {
    if (!dataUrl) return;
    try {
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "qr-code.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "QR Code" });
      } else {
        await navigator.share?.({ title: "QR Code", text });
      }
    } catch {
      // The user dismissed the share sheet — nothing to report.
    }
  }, [dataUrl, text]);

  const reset = () => {
    setText(DEFAULTS.text);
    setSize(DEFAULTS.size);
    setMargin(DEFAULTS.margin);
    setLevel(DEFAULTS.level);
    setDark(DEFAULTS.dark);
    setLight(DEFAULTS.light);
  };

  const canShare = typeof navigator !== "undefined" && Boolean(navigator.share);
  const pngBytes = dataUrl ? Math.round((dataUrl.length - 22) * 0.75) : 0;

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-5">
        {/* Controls -------------------------------------------------- */}
        <Card className="space-y-4 lg:col-span-3">
          <div className="flex items-center justify-between gap-2">
            <label
              htmlFor="qr-text"
              className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Content
            </label>
            <div className="flex gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setText("")}
                disabled={!text}
              >
                Clear
              </Button>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={reset}>
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </Button>
            </div>
          </div>

          <textarea
            id="qr-text"
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={4}
            spellCheck={false}
            placeholder="Enter a URL, text, Wi-Fi config or vCard…"
            aria-invalid={tooLong ? true : undefined}
            className={cn(
              "w-full resize-y rounded-xl border bg-white px-3.5 py-3 text-sm shadow-sm transition-colors",
              "placeholder:text-slate-400 focus:ring-4 focus:outline-none dark:bg-slate-950/60",
              tooLong
                ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/10 dark:border-rose-500/60"
                : "border-slate-200 hover:border-slate-300 focus:border-brand-500 focus:ring-brand-500/10 dark:border-slate-800",
            )}
          />

          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => setText(preset.value)}
                className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Error correction
            </span>
            <Segmented
              options={LEVELS.map((item) => ({ value: item.value, label: item.label }))}
              value={level}
              onChange={setLevel}
              size="sm"
              aria-label="Error correction level"
            />
            <p className="text-xs muted">
              Recovers {LEVELS.find((item) => item.value === level)?.recovery} of a damaged code.
              Higher levels make the pattern denser.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField
              label="Size"
              value={size}
              onChange={setSize}
              error={sizeField.error}
              suffix="px"
              presets={[128, 256, 320, 512]}
            />
            <NumberField
              label="Quiet zone"
              value={margin}
              onChange={setMargin}
              error={marginField.error}
              suffix="modules"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <ColorInput label="Foreground" value={dark} onChange={setDark} resolved={darkColor} />
            <ColorInput label="Background" value={light} onChange={setLight} resolved={lightColor} />
          </div>
        </Card>

        {/* Preview --------------------------------------------------- */}
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Preview
              </span>
              <CopyButton value={text} label="Copy content" disabled={!text} />
            </div>

            <div className="mt-3 flex min-h-[16rem] items-center justify-center rounded-xl bg-slate-50 p-4 dark:bg-slate-950/60">
              {error ? (
                <p role="alert" className="text-center text-sm text-rose-600 dark:text-rose-400">
                  {error}
                </p>
              ) : dataUrl ? (
                <img
                  src={dataUrl}
                  alt={`QR code encoding: ${text.slice(0, 80)}`}
                  className="h-auto w-full max-w-[16rem] rounded-lg"
                />
              ) : (
                <p className="text-center text-sm muted">
                  Enter some content to generate a QR code.
                </p>
              )}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => download("png")}
                disabled={!dataUrl}
              >
                <Download className="h-3.5 w-3.5" />
                PNG
              </Button>
              <Button variant="outline" size="sm" onClick={() => download("svg")} disabled={!svg}>
                <Download className="h-3.5 w-3.5" />
                SVG
              </Button>
              {canShare ? (
                <Button
                  variant="subtle"
                  size="sm"
                  onClick={share}
                  disabled={!dataUrl}
                  className="col-span-2"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  Share
                </Button>
              ) : null}
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <StatTile label="Characters" value={formatNumber(text.length)} icon="Hash" />
            <StatTile label="PNG size" value={pngBytes ? formatBytes(pngBytes) : "—"} icon="Gauge" />
          </div>
        </div>
      </div>

      <p className="rounded-xl bg-slate-50 px-4 py-3 text-xs muted dark:bg-slate-900/60">
        QR codes are generated locally in your browser — the content is never sent to a server.
        For reliable scanning keep strong contrast between foreground and background, and leave the
        quiet zone at 2 modules or more.
      </p>
    </div>
  );
}

function ColorInput({
  label,
  value,
  onChange,
  resolved,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  resolved: string;
}) {
  return (
    <div className="space-y-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={resolved}
          onChange={(event) => onChange(event.target.value.toUpperCase())}
          aria-label={`${label} colour picker`}
          className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-slate-200 bg-transparent dark:border-slate-700"
        />
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-label={`${label} hex value`}
          className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-950/60"
        />
      </div>
    </div>
  );
}
