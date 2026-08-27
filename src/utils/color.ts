export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface HSL {
  h: number;
  s: number;
  l: number;
}

export interface ParsedColor {
  hex: string;
  rgb: RGB;
  hsl: HSL;
}

export function clampChannel(value: number): number {
  return Math.min(255, Math.max(0, Math.round(value)));
}

export function rgbToHex({ r, g, b }: RGB): string {
  const toHex = (value: number) => clampChannel(value).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

export function hexToRgb(hex: string): RGB | null {
  let value = hex.trim().replace(/^#/, "");
  if (value.length === 3) {
    value = value
      .split("")
      .map((char) => char + char)
      .join("");
  }
  if (!/^[0-9a-fA-F]{6}$/.test(value)) return null;
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  };
}

export function rgbToHsl({ r, g, b }: RGB): HSL {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  let h = 0;
  if (delta !== 0) {
    if (max === red) h = ((green - blue) / delta) % 6;
    else if (max === green) h = (blue - red) / delta + 2;
    else h = (red - green) / delta + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function hslToRgb({ h, s, l }: HSL): RGB {
  const saturation = s / 100;
  const lightness = l / 100;
  const c = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const hp = ((h % 360) + 360) % 360 / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let [red, green, blue] = [0, 0, 0];
  if (hp >= 0 && hp < 1) [red, green, blue] = [c, x, 0];
  else if (hp < 2) [red, green, blue] = [x, c, 0];
  else if (hp < 3) [red, green, blue] = [0, c, x];
  else if (hp < 4) [red, green, blue] = [0, x, c];
  else if (hp < 5) [red, green, blue] = [x, 0, c];
  else [red, green, blue] = [c, 0, x];
  const m = lightness - c / 2;
  return {
    r: Math.round((red + m) * 255),
    g: Math.round((green + m) * 255),
    b: Math.round((blue + m) * 255),
  };
}

/** Accepts `#abc`, `#aabbcc`, `rgb(...)` or `hsl(...)` input. */
export function parseColor(input: string): ParsedColor | null {
  const value = input.trim();

  if (value.startsWith("#") || /^[0-9a-fA-F]{3,6}$/.test(value)) {
    const rgb = hexToRgb(value);
    return rgb ? { hex: rgbToHex(rgb), rgb, hsl: rgbToHsl(rgb) } : null;
  }

  const rgbMatch = value.match(/rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i);
  if (rgbMatch) {
    const rgb: RGB = {
      r: clampChannel(Number(rgbMatch[1])),
      g: clampChannel(Number(rgbMatch[2])),
      b: clampChannel(Number(rgbMatch[3])),
    };
    return { hex: rgbToHex(rgb), rgb, hsl: rgbToHsl(rgb) };
  }

  const hslMatch = value.match(/hsla?\(\s*([\d.]+)[\s,]+([\d.]+)%?[\s,]+([\d.]+)%?/i);
  if (hslMatch) {
    const hsl: HSL = {
      h: Number(hslMatch[1]) % 360,
      s: Math.min(100, Math.max(0, Number(hslMatch[2]))),
      l: Math.min(100, Math.max(0, Number(hslMatch[3]))),
    };
    const rgb = hslToRgb(hsl);
    return { hex: rgbToHex(rgb), rgb, hsl };
  }

  return null;
}

/** Picks readable text color (black or white) for a background. */
export function readableTextColor({ r, g, b }: RGB): string {
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#0f172a" : "#ffffff";
}

/* ------------------------------------------------------------- contrast */

/** WCAG relative luminance of a colour (0 = black, 1 = white). */
export function relativeLuminance({ r, g, b }: RGB): number {
  const channel = (value: number) => {
    const srgb = value / 255;
    return srgb <= 0.03928 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** WCAG contrast ratio between two colours, from 1 to 21. */
export function contrastRatio(a: RGB, b: RGB): number {
  const light = Math.max(relativeLuminance(a), relativeLuminance(b));
  const dark = Math.min(relativeLuminance(a), relativeLuminance(b));
  return (light + 0.05) / (dark + 0.05);
}

export interface ContrastVerdict {
  ratio: number;
  aaNormal: boolean;
  aaLarge: boolean;
  aaaNormal: boolean;
  aaaLarge: boolean;
}

/** Evaluates a contrast ratio against the WCAG 2.1 thresholds. */
export function checkContrast(foreground: RGB, background: RGB): ContrastVerdict {
  const ratio = contrastRatio(foreground, background);
  return {
    ratio,
    aaNormal: ratio >= 4.5,
    aaLarge: ratio >= 3,
    aaaNormal: ratio >= 7,
    aaaLarge: ratio >= 4.5,
  };
}

/* ------------------------------------------------------------ harmonies */

export type HarmonyId =
  | "complementary"
  | "analogous"
  | "triadic"
  | "tetradic"
  | "split-complementary"
  | "monochromatic";

export const harmonies: { id: HarmonyId; name: string; description: string }[] = [
  {
    id: "complementary",
    name: "Complementary",
    description: "Opposite hues — maximum contrast.",
  },
  { id: "analogous", name: "Analogous", description: "Neighbouring hues — calm and cohesive." },
  { id: "triadic", name: "Triadic", description: "Three hues evenly spaced around the wheel." },
  { id: "tetradic", name: "Tetradic", description: "Two complementary pairs." },
  {
    id: "split-complementary",
    name: "Split complementary",
    description: "Softer alternative to complementary.",
  },
  { id: "monochromatic", name: "Monochromatic", description: "One hue at varying lightness." },
];

/** Builds a harmony palette from a base colour. Returns HEX strings. */
export function buildHarmony(base: HSL, harmony: HarmonyId): string[] {
  const rotate = (degrees: number) =>
    rgbToHex(hslToRgb({ ...base, h: (base.h + degrees + 360) % 360 }));

  switch (harmony) {
    case "complementary":
      return [rotate(0), rotate(180)];
    case "analogous":
      return [rotate(-30), rotate(0), rotate(30)];
    case "triadic":
      return [rotate(0), rotate(120), rotate(240)];
    case "tetradic":
      return [rotate(0), rotate(90), rotate(180), rotate(270)];
    case "split-complementary":
      return [rotate(0), rotate(150), rotate(210)];
    case "monochromatic":
      return [80, 65, 50, 35, 20].map((lightness) =>
        rgbToHex(hslToRgb({ ...base, l: lightness })),
      );
    default:
      return [rotate(0)];
  }
}

/** Tailwind-style 50–900 tint/shade ramp from a base colour. */
export function buildScale(base: HSL): { step: number; hex: string }[] {
  const steps: [number, number][] = [
    [50, 97],
    [100, 94],
    [200, 86],
    [300, 76],
    [400, 66],
    [500, 56],
    [600, 47],
    [700, 39],
    [800, 31],
    [900, 24],
  ];
  return steps.map(([step, lightness]) => ({
    step,
    hex: rgbToHex(hslToRgb({ ...base, l: lightness })),
  }));
}

/** Formats a colour in every common CSS notation. */
export function colorFormats(color: ParsedColor) {
  const { rgb, hsl, hex } = color;
  return {
    hex,
    hexLower: hex.toLowerCase(),
    rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
    rgbSpace: `rgb(${rgb.r} ${rgb.g} ${rgb.b})`,
    hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
    hslSpace: `hsl(${hsl.h} ${hsl.s}% ${hsl.l}%)`,
    cssVar: `--color: ${hex};`,
  };
}
