/**
 * SVG pattern generation.
 *
 * Each pattern is emitted as a self-contained tiling SVG, which can be used
 * as a CSS `background-image` data URI or rasterised to PNG on a canvas.
 * Everything is generated as plain strings — no dependencies, no network.
 */

export type PatternId =
  | "dots"
  | "grid"
  | "lines"
  | "diagonal"
  | "crosshatch"
  | "checkers"
  | "triangles"
  | "zigzag"
  | "waves"
  | "plus"
  | "circles"
  | "bricks"
  | "hexagons"
  | "confetti";

export interface PatternInfo {
  id: PatternId;
  name: string;
  description: string;
}

export const patterns: PatternInfo[] = [
  { id: "dots", name: "Dots", description: "Evenly spaced filled circles." },
  { id: "grid", name: "Grid", description: "Classic squared graph paper." },
  { id: "lines", name: "Lines", description: "Horizontal rules." },
  { id: "diagonal", name: "Diagonal", description: "45° stripes." },
  { id: "crosshatch", name: "Crosshatch", description: "Intersecting diagonals." },
  { id: "checkers", name: "Checkers", description: "Two-tone chequerboard." },
  { id: "triangles", name: "Triangles", description: "Alternating triangle tiling." },
  { id: "zigzag", name: "Zigzag", description: "Sharp chevron rows." },
  { id: "waves", name: "Waves", description: "Soft repeating curves." },
  { id: "plus", name: "Plus", description: "Small cross marks." },
  { id: "circles", name: "Circles", description: "Outlined rings." },
  { id: "bricks", name: "Bricks", description: "Offset brick courses." },
  { id: "hexagons", name: "Hexagons", description: "Honeycomb lattice." },
  { id: "confetti", name: "Confetti", description: "Scattered specks." },
];

export interface PatternOptions {
  foreground: string;
  background: string;
  /** Tile size in pixels. */
  size: number;
  /** Stroke width or shape scale, depending on the pattern. */
  weight: number;
  /** Foreground opacity, 0–1. */
  opacity: number;
  /** Whole-pattern rotation in degrees. */
  rotation: number;
}

export const defaultPatternOptions: PatternOptions = {
  foreground: "#6366F1",
  background: "#EEF2FF",
  size: 32,
  weight: 3,
  opacity: 1,
  rotation: 0,
};

/** Deterministic pseudo-random so a given tile always renders identically. */
function seeded(seed: number) {
  let state = seed || 1;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

/** Builds the inner markup of one pattern tile. */
function tileContent(id: PatternId, options: PatternOptions): string {
  const { foreground: fg, size: s, weight: w } = options;
  const half = s / 2;
  const stroke = `stroke="${fg}" stroke-width="${w}" fill="none"`;
  const fill = `fill="${fg}"`;

  switch (id) {
    case "dots":
      return `
        <circle cx="${half}" cy="${half}" r="${w}" ${fill}/>
        <circle cx="0" cy="0" r="${w}" ${fill}/>
        <circle cx="${s}" cy="0" r="${w}" ${fill}/>
        <circle cx="0" cy="${s}" r="${w}" ${fill}/>
        <circle cx="${s}" cy="${s}" r="${w}" ${fill}/>`;

    case "grid":
      return `<path d="M ${s} 0 L 0 0 0 ${s}" ${stroke} stroke-linecap="square"/>`;

    case "lines":
      return `<path d="M 0 ${half} L ${s} ${half}" ${stroke} stroke-linecap="square"/>`;

    case "diagonal":
      return `
        <path d="M -1 1 L 1 -1 M 0 ${s} L ${s} 0 M ${s - 1} ${s + 1} L ${s + 1} ${s - 1}"
          ${stroke} stroke-linecap="square"/>`;

    case "crosshatch":
      return `
        <path d="M -1 1 L 1 -1 M 0 ${s} L ${s} 0 M ${s - 1} ${s + 1} L ${s + 1} ${s - 1}"
          ${stroke} stroke-linecap="square"/>
        <path d="M -1 ${s - 1} L 1 ${s + 1} M 0 0 L ${s} ${s} M ${s - 1} -1 L ${s + 1} 1"
          ${stroke} stroke-linecap="square"/>`;

    case "checkers":
      return `
        <rect x="0" y="0" width="${half}" height="${half}" ${fill}/>
        <rect x="${half}" y="${half}" width="${half}" height="${half}" ${fill}/>`;

    case "triangles":
      return `
        <polygon points="${half},0 ${s},${s} 0,${s}" ${fill}/>`;

    case "zigzag":
      return `
        <path d="M 0 ${s * 0.75} L ${half} ${s * 0.25} L ${s} ${s * 0.75}"
          ${stroke} stroke-linejoin="round" stroke-linecap="round"/>`;

    case "waves":
      return `
        <path d="M 0 ${half} Q ${s * 0.25} ${s * 0.15} ${half} ${half} T ${s} ${half}"
          ${stroke} stroke-linecap="round"/>`;

    case "plus":
      return `
        <path d="M ${half} ${half - w * 1.6} L ${half} ${half + w * 1.6}
                 M ${half - w * 1.6} ${half} L ${half + w * 1.6} ${half}"
          ${stroke} stroke-linecap="round"/>`;

    case "circles":
      return `<circle cx="${half}" cy="${half}" r="${Math.max(2, half - w)}" ${stroke}/>`;

    case "bricks": {
      const h = half;
      return `
        <rect x="0" y="0" width="${s}" height="${h}" ${stroke}/>
        <rect x="0" y="${h}" width="${s}" height="${h}" ${stroke}/>
        <path d="M ${half} 0 L ${half} ${h} M 0 ${h} L 0 ${s} M ${s} ${h} L ${s} ${s}" ${stroke}/>`;
    }

    case "hexagons": {
      const a = s / 2;
      const b = a * 0.577; // tan(30°)
      return `
        <path d="M 0 ${b} L ${a} 0 L ${s} ${b} M ${a} 0 L ${a} ${a}
                 M 0 ${s - b} L ${a} ${s} L ${s} ${s - b} M ${a} ${a} L 0 ${s - b}
                 M ${a} ${a} L ${s} ${s - b}"
          ${stroke} stroke-linejoin="round"/>`;
    }

    case "confetti": {
      const random = seeded(Math.round(s * 97 + w * 13));
      let shapes = "";
      for (let index = 0; index < 6; index++) {
        const x = random() * s;
        const y = random() * s;
        const angle = Math.round(random() * 180);
        shapes += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w}" height="${(
          w * 2.5
        ).toFixed(1)}" rx="${(w / 2).toFixed(1)}" ${fill} transform="rotate(${angle} ${x.toFixed(
          1,
        )} ${y.toFixed(1)})"/>`;
      }
      return shapes;
    }

    default:
      return "";
  }
}

/** Full standalone SVG for one tile of the pattern. */
export function buildPatternSvg(id: PatternId, options: PatternOptions): string {
  const { background, size, opacity, rotation } = options;
  const content = tileContent(id, options);
  const rotate =
    rotation % 360 === 0
      ? ""
      : ` transform="rotate(${rotation} ${size / 2} ${size / 2})"`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${background}"/>
  <g opacity="${opacity}"${rotate}>${content}
  </g>
</svg>`;
}

/** Data URI suitable for `background-image`. */
export function patternDataUri(svg: string): string {
  return `url("data:image/svg+xml,${encodeURIComponent(svg.replace(/\s+/g, " ").trim())}")`;
}

/** Ready-to-paste CSS rule. */
export function patternCss(id: PatternId, options: PatternOptions): string {
  const svg = buildPatternSvg(id, options);
  return [
    `background-color: ${options.background};`,
    `background-image: ${patternDataUri(svg)};`,
    `background-size: ${options.size}px ${options.size}px;`,
  ].join("\n");
}

/** Tailwind arbitrary-value utility for the same pattern. */
export function patternTailwind(id: PatternId, options: PatternOptions): string {
  const svg = buildPatternSvg(id, options);
  const uri = patternDataUri(svg).replace(/^url\("/, "").replace(/"\)$/, "");
  // Assembled by concatenation so the bundler's CSS scanner does not try to
  // resolve this as a real asset reference at build time.
  const wrapped = `bg-[u${"rl"}('${uri}')]`;
  return `${wrapped} bg-[length:${options.size}px_${options.size}px]`;
}

/**
 * Rasterises a pattern SVG onto a canvas at the requested output size,
 * tiling the SVG so the result matches the CSS rendering.
 */
export async function rasterisePattern(
  id: PatternId,
  options: PatternOptions,
  width: number,
  height: number,
): Promise<Blob> {
  const svg = buildPatternSvg(id, options);
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

  const tile = new Image();
  tile.decoding = "async";
  await new Promise<void>((resolve, reject) => {
    tile.onload = () => resolve();
    tile.onerror = () => reject(new Error("Could not rasterise the pattern."));
    tile.src = url;
  });

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is unavailable in this browser.");

  context.fillStyle = options.background;
  context.fillRect(0, 0, width, height);

  const repeat = context.createPattern(tile, "repeat");
  if (repeat) {
    context.fillStyle = repeat;
    context.fillRect(0, 0, width, height);
  }

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Encoding failed."))),
      "image/png",
    );
  });
}
