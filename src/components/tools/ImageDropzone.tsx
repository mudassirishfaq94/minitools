import { useCallback, useRef, useState, type DragEvent } from "react";
import { CircleAlert, ImageUp, Loader2, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/utils/cn";
import {
  ACCEPT_ATTRIBUTE,
  MAX_FILE_BYTES,
  formatFileSize,
  simplifyRatio,
  type LoadedImage,
} from "@/utils/image";

interface ImageDropzoneProps {
  image: LoadedImage | null;
  error: string | null;
  loading: boolean;
  onSelect: (file: File | null | undefined) => void;
  onClear: () => void;
  className?: string;
}

/**
 * Shared upload surface: drag-and-drop, click-to-browse, paste-from-clipboard,
 * validation messaging and a metadata summary once an image is loaded.
 */
export function ImageDropzone({
  image,
  error,
  loading,
  onSelect,
  onClear,
  className,
}: ImageDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setDragging(false);
      onSelect(event.dataTransfer.files?.[0]);
    },
    [onSelect],
  );

  const handlePaste = useCallback(
    (event: React.ClipboardEvent) => {
      const file = Array.from(event.clipboardData.files)[0];
      if (file) onSelect(file);
    },
    [onSelect],
  );

  return (
    <div className={cn("space-y-3", className)}>
      <div
        onDrop={handleDrop}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onPaste={handlePaste}
        className={cn(
          "relative rounded-2xl border-2 border-dashed transition-colors",
          dragging
            ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10"
            : error
              ? "border-rose-300 bg-rose-50/50 dark:border-rose-500/40 dark:bg-rose-500/5"
              : "border-slate-300 bg-slate-50/60 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900/40",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_ATTRIBUTE}
          onChange={(event) => {
            onSelect(event.target.files?.[0]);
            // Allow re-selecting the same file after a clear.
            event.target.value = "";
          }}
          className="sr-only"
          aria-label="Choose an image"
        />

        {image ? (
          <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
            <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[repeating-conic-gradient(#e2e8f0_0_25%,transparent_0_50%)] bg-[length:16px_16px] dark:bg-[repeating-conic-gradient(#334155_0_25%,transparent_0_50%)]">
              <img
                src={image.url}
                alt={image.file.name}
                className="max-h-28 max-w-28 object-contain"
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{image.file.name}</p>
              <dl className="mt-1.5 grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs muted">
                <div className="flex justify-between gap-2">
                  <dt>Dimensions</dt>
                  <dd className="font-mono">
                    {image.width}×{image.height}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>Size</dt>
                  <dd className="font-mono">{formatFileSize(image.file.size)}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>Type</dt>
                  <dd className="font-mono">{image.file.type.replace("image/", "")}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>Ratio</dt>
                  <dd className="font-mono">{simplifyRatio(image.width, image.height)}</dd>
                </div>
              </dl>

              <div className="mt-3 flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
                  <Upload className="h-3.5 w-3.5" />
                  Replace
                </Button>
                <Button variant="ghost" size="sm" onClick={onClear}>
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={loading}
            className="flex w-full flex-col items-center gap-3 px-6 py-10 text-center"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-brand-600 shadow-sm dark:bg-slate-800 dark:text-brand-300">
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <ImageUp className="h-5 w-5" />
              )}
            </span>
            <span>
              <span className="block text-sm font-semibold">
                {loading ? "Decoding image…" : "Drop an image here"}
              </span>
              <span className="mt-1 block text-xs muted">
                or click to browse · paste from clipboard
              </span>
            </span>
            <span className="text-[11px] muted">
              JPEG, PNG, WebP, AVIF, GIF, BMP or SVG · up to {formatFileSize(MAX_FILE_BYTES)}
            </span>
          </button>
        )}
      </div>

      {error ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-xl bg-rose-50 px-3 py-2.5 text-xs font-medium text-rose-700 dark:bg-rose-500/10 dark:text-rose-300"
        >
          <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      ) : null}
    </div>
  );
}

interface ComparePreviewProps {
  originalUrl: string;
  processedUrl: string | null;
  processing?: boolean;
}

/** Side-by-side before/after preview with a checkerboard for transparency. */
export function ComparePreview({
  originalUrl,
  processedUrl,
  processing,
}: ComparePreviewProps) {
  const frame =
    "flex min-h-[12rem] items-center justify-center overflow-hidden rounded-xl " +
    "bg-[repeating-conic-gradient(#e2e8f0_0_25%,transparent_0_50%)] bg-[length:16px_16px] " +
    "dark:bg-[repeating-conic-gradient(#334155_0_25%,transparent_0_50%)]";

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Original
        </span>
        <div className={frame}>
          <img src={originalUrl} alt="Original" className="max-h-64 max-w-full object-contain" />
        </div>
      </Card>

      <Card className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Result
        </span>
        <div className={frame}>
          {processing ? (
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          ) : processedUrl ? (
            <img src={processedUrl} alt="Processed" className="max-h-64 max-w-full object-contain" />
          ) : (
            <p className="px-4 text-center text-sm muted">Adjust the settings to see a result.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
