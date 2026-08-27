/**
 * Colour-key background removal and background compositing.
 *
 * This is a chroma-key style remover: it isolates a subject by making pixels
 * that match a chosen background colour transparent. It runs entirely on the
 * CPU in the browser with no model download and no network access.
 *
 * It works very well for uniform backgrounds — product shots, logos, scans,
 * screenshots, studio photography. It is NOT a machine-learning matting model,
 * so it cannot separate a subject from a busy or cluttered background.
 */

export interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

/**
 * Perceptually weighted RGB distance, normalised to 0–100.
 * Green is weighted highest because human vision is most sensitive to it,
 * which makes the tolerance slider behave predictably across hues.
 */
export function colorDistance(
  r1: number,
  g1: number,
  b1: number,
  r2: number,
  g2: number,
  b2: number,
): number {
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  const raw = Math.sqrt(0.299 * dr * dr + 0.587 * dg * dg + 0.114 * db * db);
  // Max possible weighted distance is 255.
  return (raw / 255) * 100;
}

/** Samples the four corners and picks the most representative background colour. */
export function autoDetectBackground(data: ImageData): RGBA {
  const { width, height } = data;
  const pixels = data.data;
  const patch = Math.max(2, Math.round(Math.min(width, height) * 0.03));

  const samples: RGBA[] = [];
  const corners: [number, number][] = [
    [0, 0],
    [width - patch, 0],
    [0, height - patch],
    [width - patch, height - patch],
  ];

  for (const [startX, startY] of corners) {
    let r = 0;
    let g = 0;
    let b = 0;
    let a = 0;
    let count = 0;
    for (let y = startY; y < Math.min(startY + patch, height); y++) {
      for (let x = startX; x < Math.min(startX + patch, width); x++) {
        const index = (y * width + x) * 4;
        r += pixels[index];
        g += pixels[index + 1];
        b += pixels[index + 2];
        a += pixels[index + 3];
        count++;
      }
    }
    if (count > 0) {
      samples.push({
        r: Math.round(r / count),
        g: Math.round(g / count),
        b: Math.round(b / count),
        a: Math.round(a / count),
      });
    }
  }

  if (samples.length === 0) return { r: 255, g: 255, b: 255, a: 255 };

  // Choose the corner colour that is closest to the other corners — the most
  // "agreed upon" background, which avoids picking a corner covered by the subject.
  let best = samples[0];
  let bestScore = Number.POSITIVE_INFINITY;
  for (const candidate of samples) {
    const score = samples.reduce(
      (sum, other) =>
        sum + colorDistance(candidate.r, candidate.g, candidate.b, other.r, other.g, other.b),
      0,
    );
    if (score < bestScore) {
      bestScore = score;
      best = candidate;
    }
  }
  return best;
}

/** Reads a single pixel, used by the eyedropper. */
export function samplePixel(data: ImageData, x: number, y: number): RGBA {
  const clampedX = Math.max(0, Math.min(data.width - 1, Math.round(x)));
  const clampedY = Math.max(0, Math.min(data.height - 1, Math.round(y)));
  const index = (clampedY * data.width + clampedX) * 4;
  return {
    r: data.data[index],
    g: data.data[index + 1],
    b: data.data[index + 2],
    a: data.data[index + 3],
  };
}

export type RemovalMode = "global" | "contiguous";

export interface RemoveOptions {
  /** Colour treated as background. */
  color: RGBA;
  /** 0–100. Pixels closer than this become fully transparent. */
  tolerance: number;
  /** 0–50. Width of the partial-transparency ramp beyond the tolerance. */
  softness: number;
  /**
   * `global` clears every matching pixel anywhere in the image.
   * `contiguous` only clears regions connected to the image edge, which
   * preserves matching colours inside the subject.
   */
  mode: RemovalMode;
  /** Erodes the remaining subject by N pixels to cut background halos. */
  trim: number;
}

export interface RemovalResult {
  output: ImageData;
  /** Fraction of pixels made fully transparent, 0–1. */
  removedRatio: number;
}

/**
 * Produces a cut-out by keying out `color`.
 *
 * Pixels within `tolerance` become fully transparent; those between
 * `tolerance` and `tolerance + softness` get a proportional alpha, which
 * gives anti-aliased edges rather than a hard jagged cut.
 */
export function removeBackground(source: ImageData, options: RemoveOptions): RemovalResult {
  const { color, tolerance, softness, mode, trim } = options;
  const { width, height } = source;
  const input = source.data;

  const output = new ImageData(new Uint8ClampedArray(input), width, height);
  const pixels = output.data;
  const total = width * height;

  /** Alpha multiplier per pixel, 0 = removed, 255 = kept. */
  const mask = new Uint8ClampedArray(total).fill(255);

  const alphaFor = (index: number): number => {
    const distance = colorDistance(
      input[index * 4],
      input[index * 4 + 1],
      input[index * 4 + 2],
      color.r,
      color.g,
      color.b,
    );
    if (distance <= tolerance) return 0;
    if (softness > 0 && distance <= tolerance + softness) {
      return Math.round(((distance - tolerance) / softness) * 255);
    }
    return 255;
  };

  if (mode === "global") {
    for (let index = 0; index < total; index++) {
      mask[index] = alphaFor(index);
    }
  } else {
    // Flood fill inward from every edge pixel that matches the key colour.
    const visited = new Uint8Array(total);
    const queue = new Int32Array(total);
    let head = 0;
    let tail = 0;

    const push = (index: number) => {
      if (visited[index]) return;
      visited[index] = 1;
      queue[tail++] = index;
    };

    for (let x = 0; x < width; x++) {
      push(x);
      push((height - 1) * width + x);
    }
    for (let y = 0; y < height; y++) {
      push(y * width);
      push(y * width + width - 1);
    }

    // Edge seeds that do not match must not spread.
    for (let i = 0; i < tail; i++) {
      if (alphaFor(queue[i]) === 255) visited[queue[i]] = 2;
    }

    while (head < tail) {
      const index = queue[head++];
      if (visited[index] === 2) continue;

      const alpha = alphaFor(index);
      if (alpha === 255) {
        visited[index] = 2;
        continue;
      }
      mask[index] = alpha;

      const x = index % width;
      const y = (index / width) | 0;
      if (x > 0) push(index - 1);
      if (x < width - 1) push(index + 1);
      if (y > 0) push(index - width);
      if (y < height - 1) push(index + width);
    }
  }

  // Erode the kept region to remove fringes of leftover background colour.
  if (trim > 0) {
    for (let pass = 0; pass < trim; pass++) {
      const previous = Uint8ClampedArray.from(mask);
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const index = y * width + x;
          if (previous[index] === 0) continue;
          const left = x > 0 ? previous[index - 1] : 0;
          const right = x < width - 1 ? previous[index + 1] : 0;
          const up = y > 0 ? previous[index - width] : 0;
          const down = y < height - 1 ? previous[index + width] : 0;
          if (left === 0 || right === 0 || up === 0 || down === 0) mask[index] = 0;
        }
      }
    }
  }

  let removed = 0;
  for (let index = 0; index < total; index++) {
    const alpha = mask[index];
    if (alpha === 0) removed++;
    // Combine with any alpha the source already had.
    pixels[index * 4 + 3] = Math.round((input[index * 4 + 3] * alpha) / 255);
  }

  return { output, removedRatio: total === 0 ? 0 : removed / total };
}

/* ------------------------------------------------------------ backgrounds */

export type GradientKind = "linear" | "radial";

export type BackgroundFill =
  | { type: "transparent" }
  | { type: "solid"; color: string }
  | { type: "gradient"; kind: GradientKind; angle: number; stops: string[] }
  | { type: "image"; source: CanvasImageSource; fit: "cover" | "contain" | "stretch" };

export const solidPresets = [
  "#FFFFFF",
  "#000000",
  "#F1F5F9",
  "#0F172A",
  "#6366F1",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#EC4899",
  "#06B6D4",
  "#84CC16",
  "#8B5CF6",
];

export interface GradientPreset {
  name: string;
  kind: GradientKind;
  angle: number;
  stops: string[];
}

export const gradientPresets: GradientPreset[] = [
  { name: "Indigo", kind: "linear", angle: 135, stops: ["#6366F1", "#A855F7"] },
  { name: "Sunset", kind: "linear", angle: 135, stops: ["#F97316", "#EC4899"] },
  { name: "Ocean", kind: "linear", angle: 135, stops: ["#0EA5E9", "#22D3EE"] },
  { name: "Forest", kind: "linear", angle: 135, stops: ["#059669", "#84CC16"] },
  { name: "Peach", kind: "linear", angle: 135, stops: ["#FDE68A", "#FCA5A5"] },
  { name: "Midnight", kind: "linear", angle: 160, stops: ["#0F172A", "#334155"] },
  { name: "Candy", kind: "linear", angle: 135, stops: ["#F472B6", "#818CF8", "#38BDF8"] },
  { name: "Spotlight", kind: "radial", angle: 0, stops: ["#FFFFFF", "#CBD5E1"] },
  { name: "Halo", kind: "radial", angle: 0, stops: ["#A5B4FC", "#312E81"] },
];

/** CSS string for previewing a fill outside of canvas. */
export function fillToCss(fill: BackgroundFill): string {
  switch (fill.type) {
    case "solid":
      return fill.color;
    case "gradient":
      return fill.kind === "radial"
        ? `radial-gradient(circle at 50% 50%, ${fill.stops.join(", ")})`
        : `linear-gradient(${fill.angle}deg, ${fill.stops.join(", ")})`;
    default:
      return "transparent";
  }
}

/** Paints a fill across the full canvas area. */
export function paintBackground(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  fill: BackgroundFill,
) {
  if (fill.type === "transparent") return;

  if (fill.type === "solid") {
    context.fillStyle = fill.color;
    context.fillRect(0, 0, width, height);
    return;
  }

  if (fill.type === "gradient") {
    let gradient: CanvasGradient;
    if (fill.kind === "radial") {
      const radius = Math.max(width, height) / 2;
      gradient = context.createRadialGradient(
        width / 2,
        height / 2,
        0,
        width / 2,
        height / 2,
        radius,
      );
    } else {
      // Convert a CSS-style angle into start/end points across the canvas.
      const radians = ((fill.angle - 90) * Math.PI) / 180;
      const halfDiagonal = Math.abs(width * Math.cos(radians)) / 2 + Math.abs(height * Math.sin(radians)) / 2;
      const cx = width / 2;
      const cy = height / 2;
      gradient = context.createLinearGradient(
        cx - Math.cos(radians) * halfDiagonal,
        cy - Math.sin(radians) * halfDiagonal,
        cx + Math.cos(radians) * halfDiagonal,
        cy + Math.sin(radians) * halfDiagonal,
      );
    }

    const stops = fill.stops.length > 1 ? fill.stops : [...fill.stops, ...fill.stops];
    stops.forEach((stop, index) => {
      gradient.addColorStop(index / (stops.length - 1), stop);
    });
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);
    return;
  }

  // Image fill.
  const source = fill.source;
  const sourceWidth = "width" in source ? Number(source.width) : width;
  const sourceHeight = "height" in source ? Number(source.height) : height;

  if (fill.fit === "stretch") {
    context.drawImage(source, 0, 0, width, height);
    return;
  }

  const scale =
    fill.fit === "cover"
      ? Math.max(width / sourceWidth, height / sourceHeight)
      : Math.min(width / sourceWidth, height / sourceHeight);
  const drawWidth = sourceWidth * scale;
  const drawHeight = sourceHeight * scale;
  context.drawImage(
    source,
    (width - drawWidth) / 2,
    (height - drawHeight) / 2,
    drawWidth,
    drawHeight,
  );
}
