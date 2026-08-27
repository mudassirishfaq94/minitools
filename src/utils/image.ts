/**
 * Client-side image processing.
 *
 * Everything here uses `createImageBitmap`, `OffscreenCanvas` (when available)
 * and `canvas.toBlob`, so images are decoded, resized and re-encoded entirely
 * in the browser. No image data ever leaves the device.
 */

export type OutputFormat = "image/jpeg" | "image/png" | "image/webp" | "image/avif";

export interface FormatInfo {
  mime: OutputFormat;
  label: string;
  extension: string;
  /** Encoder honours a quality parameter. */
  lossy: boolean;
  supportsTransparency: boolean;
  description: string;
}

export const outputFormats: FormatInfo[] = [
  {
    mime: "image/jpeg",
    label: "JPEG",
    extension: "jpg",
    lossy: true,
    supportsTransparency: false,
    description: "Best for photographs. No transparency.",
  },
  {
    mime: "image/png",
    label: "PNG",
    extension: "png",
    lossy: false,
    supportsTransparency: true,
    description: "Lossless with transparency. Larger files.",
  },
  {
    mime: "image/webp",
    label: "WebP",
    extension: "webp",
    lossy: true,
    supportsTransparency: true,
    description: "Smaller than JPEG at similar quality.",
  },
  {
    mime: "image/avif",
    label: "AVIF",
    extension: "avif",
    lossy: true,
    supportsTransparency: true,
    description: "Smallest files, slower to encode.",
  },
];

/** MIME types accepted for upload. */
export const acceptedInputTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
  "image/bmp",
  "image/svg+xml",
];

export const ACCEPT_ATTRIBUTE = acceptedInputTypes.join(",");

/** Hard ceiling so a huge file cannot lock up the tab. */
export const MAX_FILE_BYTES = 30 * 1024 * 1024;

/** Canvas has per-browser pixel limits; stay well inside them. */
export const MAX_PIXELS = 40_000_000;

export interface LoadedImage {
  bitmap: ImageBitmap;
  width: number;
  height: number;
  /** Original file the bitmap came from. */
  file: File;
  /** Object URL for preview. Caller must revoke it. */
  url: string;
}

export interface ValidationError {
  code: "type" | "size" | "pixels" | "decode" | "empty";
  message: string;
}

/** Checks a file before any decoding work happens. */
export function validateImageFile(file: File): ValidationError | null {
  if (file.size === 0) {
    return { code: "empty", message: "That file is empty." };
  }
  if (!file.type.startsWith("image/")) {
    return {
      code: "type",
      message: `“${file.name}” is not an image. Supported: JPEG, PNG, WebP, AVIF, GIF, BMP and SVG.`,
    };
  }
  if (!acceptedInputTypes.includes(file.type)) {
    return {
      code: "type",
      message: `${file.type} is not supported. Try JPEG, PNG, WebP, AVIF, GIF or BMP.`,
    };
  }
  if (file.size > MAX_FILE_BYTES) {
    return {
      code: "size",
      message: `That file is ${formatFileSize(file.size)} — the limit is ${formatFileSize(
        MAX_FILE_BYTES,
      )}.`,
    };
  }
  return null;
}

/**
 * Fallback decoder for formats `createImageBitmap` refuses.
 * Chromium cannot decode SVG blobs directly, so route them through an
 * <img> element, which rasterises using the document's renderer.
 */
async function decodeViaImageElement(file: File): Promise<ImageBitmap> {
  const url = URL.createObjectURL(file);
  try {
    const element = new Image();
    element.decoding = "async";
    // SVGs without intrinsic dimensions need an explicit raster size.
    await new Promise<void>((resolve, reject) => {
      element.onload = () => resolve();
      element.onerror = () => reject(new Error("decode"));
      element.src = url;
    });

    const width = element.naturalWidth || 1024;
    const height = element.naturalHeight || 1024;
    return await createImageBitmap(element, { resizeWidth: width, resizeHeight: height });
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Decodes a file into an ImageBitmap plus a preview URL. */
export async function loadImage(file: File): Promise<LoadedImage> {
  const bitmap = await createImageBitmap(file)
    .catch(() => decodeViaImageElement(file))
    .catch(() => {
      throw new Error(
        "Could not decode that image. The file may be corrupt or use an unsupported encoding.",
      );
    });

  if (bitmap.width * bitmap.height > MAX_PIXELS) {
    bitmap.close();
    throw new Error(
      `Image is too large to process (${bitmap.width}×${bitmap.height}). The limit is ${(
        MAX_PIXELS / 1_000_000
      ).toFixed(0)} megapixels.`,
    );
  }

  return {
    bitmap,
    width: bitmap.width,
    height: bitmap.height,
    file,
    url: URL.createObjectURL(file),
  };
}

/** Prefers OffscreenCanvas so the main thread does less layout work. */
function createCanvas(width: number, height: number) {
  if (typeof OffscreenCanvas !== "undefined") {
    return new OffscreenCanvas(width, height);
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function canvasToBlob(
  canvas: OffscreenCanvas | HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob> {
  if ("convertToBlob" in canvas) {
    return canvas.convertToBlob({ type, quality });
  }
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Encoding failed."))),
      type,
      quality,
    );
  });
}

export interface ResizeOptions {
  width: number;
  height: number;
  format: OutputFormat;
  /** 0–1. Ignored by lossless encoders. */
  quality?: number;
  /** Flattened behind this colour when the target has no alpha channel. */
  background?: string;
  /** Downscale in halving steps for noticeably smoother results. */
  smooth?: boolean;
}

export interface ProcessedImage {
  blob: Blob;
  url: string;
  width: number;
  height: number;
  size: number;
  format: OutputFormat;
}

/**
 * Draws a bitmap at the requested size and encodes it.
 *
 * Large downscales are performed in successive halving steps: browsers use a
 * cheap sampling filter for single-pass draws, which produces visible aliasing
 * when shrinking by more than ~2×.
 */
export async function resizeImage(
  bitmap: ImageBitmap,
  options: ResizeOptions,
): Promise<ProcessedImage> {
  const width = Math.max(1, Math.round(options.width));
  const height = Math.max(1, Math.round(options.height));
  const { format, quality = 0.85, background = "#FFFFFF", smooth = true } = options;

  let sourceWidth = bitmap.width;
  let sourceHeight = bitmap.height;
  let source: ImageBitmap | OffscreenCanvas | HTMLCanvasElement = bitmap;

  if (smooth) {
    // Halve repeatedly until one more halving would overshoot the target.
    while (sourceWidth / 2 >= width && sourceHeight / 2 >= height && sourceWidth > 2) {
      const stepWidth = Math.max(width, Math.floor(sourceWidth / 2));
      const stepHeight = Math.max(height, Math.floor(sourceHeight / 2));
      const stepCanvas = createCanvas(stepWidth, stepHeight);
      const stepContext = stepCanvas.getContext("2d") as CanvasRenderingContext2D | null;
      if (!stepContext) break;

      stepContext.imageSmoothingEnabled = true;
      stepContext.imageSmoothingQuality = "high";
      stepContext.drawImage(source as CanvasImageSource, 0, 0, stepWidth, stepHeight);

      source = stepCanvas;
      sourceWidth = stepWidth;
      sourceHeight = stepHeight;
    }
  }

  const canvas = createCanvas(width, height);
  const context = canvas.getContext("2d") as CanvasRenderingContext2D | null;
  if (!context) throw new Error("Canvas is unavailable in this browser.");

  const info = outputFormats.find((item) => item.mime === format);
  if (!info?.supportsTransparency) {
    // JPEG has no alpha channel — fill first so transparency does not go black.
    context.fillStyle = background;
    context.fillRect(0, 0, width, height);
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(source as CanvasImageSource, 0, 0, width, height);

  const blob = await canvasToBlob(canvas, format, quality);

  // Browsers silently fall back to PNG when an encoder is missing.
  if (blob.type !== format) {
    throw new Error(
      `This browser cannot encode ${info?.label ?? format}. Try WebP, JPEG or PNG instead.`,
    );
  }

  return {
    blob,
    url: URL.createObjectURL(blob),
    width,
    height,
    size: blob.size,
    format,
  };
}

/** Runtime check for encoder support — AVIF and WebP vary by browser. */
export async function detectFormatSupport(format: OutputFormat): Promise<boolean> {
  try {
    const canvas = createCanvas(2, 2);
    const context = canvas.getContext("2d") as CanvasRenderingContext2D | null;
    if (!context) return false;
    context.fillRect(0, 0, 2, 2);
    const blob = await canvasToBlob(canvas, format, 0.8);
    return blob.type === format;
  } catch {
    return false;
  }
}

/**
 * Finds the highest quality that keeps the file under `targetBytes`.
 * Binary search over the quality range — typically 7 encodes.
 */
export async function compressToTarget(
  bitmap: ImageBitmap,
  targetBytes: number,
  format: OutputFormat,
  dimensions: { width: number; height: number },
  onProgress?: (attempt: number) => void,
): Promise<{ result: ProcessedImage; quality: number; attempts: number } | null> {
  let low = 0.05;
  let high = 0.98;
  let best: ProcessedImage | null = null;
  let bestQuality = low;
  let attempts = 0;

  for (let step = 0; step < 7; step++) {
    const quality = (low + high) / 2;
    attempts++;
    onProgress?.(attempts);

    const candidate = await resizeImage(bitmap, { ...dimensions, format, quality });

    if (candidate.size <= targetBytes) {
      // Good enough — try pushing quality higher.
      if (best) URL.revokeObjectURL(best.url);
      best = candidate;
      bestQuality = quality;
      low = quality;
    } else {
      URL.revokeObjectURL(candidate.url);
      high = quality;
    }
  }

  return best ? { result: best, quality: bestQuality, attempts } : null;
}

/* ------------------------------------------------------------- geometry */

/** Scales dimensions to fit inside a box while preserving aspect ratio. */
export function fitWithin(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number,
): { width: number; height: number } {
  const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
  };
}

export function aspectRatio(width: number, height: number): number {
  return height === 0 ? 1 : width / height;
}

/** Reduces a ratio to its simplest whole-number form, e.g. 16:9. */
export function simplifyRatio(width: number, height: number): string {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(Math.round(width), Math.round(height));
  if (!divisor) return "—";
  const w = Math.round(width) / divisor;
  const h = Math.round(height) / divisor;
  // Very long ratios are not meaningful to a reader.
  return w > 50 || h > 50 ? `${(width / height).toFixed(2)}:1` : `${w}:${h}`;
}

/* -------------------------------------------------------------- helpers */

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unit]}`;
}

/** Swaps a filename's extension, preserving the original stem. */
export function renameExtension(filename: string, extension: string): string {
  const stem = filename.replace(/\.[^./\\]+$/, "") || "image";
  return `${stem}.${extension}`;
}

/** Triggers a browser download for a blob URL. */
export function downloadBlob(url: string, filename: string) {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/** Percentage saved, negative when the output grew. */
export function savingsPercent(original: number, processed: number): number {
  if (original === 0) return 0;
  return ((original - processed) / original) * 100;
}
