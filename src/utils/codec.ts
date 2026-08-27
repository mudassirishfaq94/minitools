/**
 * Encoding / decoding primitives.
 *
 * All operations use standard browser APIs (`TextEncoder`, `btoa`/`atob`,
 * `encodeURIComponent`) and run entirely on the client.
 */

export interface CodecResult {
  output: string;
  error: string | null;
}

/* ----------------------------------------------------------------- base64 */

/** UTF-8 safe Base64 encode, chunked so large inputs do not blow the stack. */
export function encodeBase64(text: string, urlSafe = false): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }
  const encoded = btoa(binary);
  return urlSafe ? encoded.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "") : encoded;
}

/** UTF-8 safe Base64 decode. Accepts standard and URL-safe alphabets. */
export function decodeBase64(text: string): string {
  let clean = text.replace(/\s+/g, "").replace(/-/g, "+").replace(/_/g, "/");
  // Restore padding stripped by URL-safe encoders.
  const remainder = clean.length % 4;
  if (remainder === 2) clean += "==";
  else if (remainder === 3) clean += "=";
  else if (remainder === 1) throw new Error("length");

  const binary = atob(clean);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index++) bytes[index] = binary.charCodeAt(index);
  // `fatal` surfaces invalid UTF-8 instead of silently inserting U+FFFD.
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

/** Explains exactly why a Base64 string cannot be decoded. */
export function describeBase64Error(text: string): string {
  const clean = text.replace(/\s+/g, "");
  const invalid = clean.match(/[^A-Za-z0-9+/=\-_]/g);

  if (invalid) {
    const unique = [...new Set(invalid)].slice(0, 5).join(" ");
    return `Contains characters that are not valid Base64: ${unique}`;
  }
  if (clean.length % 4 === 1) {
    return "Invalid length — a Base64 string cannot have a remainder of 1 when divided by 4.";
  }
  if (/=[^=]/.test(clean)) {
    return "Padding “=” may only appear at the end of the string.";
  }
  return "Decoded bytes are not valid UTF-8 text. This may be binary data rather than text.";
}

export function base64Encode(text: string, urlSafe = false): CodecResult {
  if (!text) return { output: "", error: null };
  try {
    return { output: encodeBase64(text, urlSafe), error: null };
  } catch {
    return { output: "", error: "Could not encode this text." };
  }
}

export function base64Decode(text: string): CodecResult {
  if (!text) return { output: "", error: null };
  try {
    return { output: decodeBase64(text), error: null };
  } catch {
    return { output: "", error: describeBase64Error(text) };
  }
}

/* -------------------------------------------------------------------- url */

export type UrlScope = "component" | "full";

export function urlEncode(text: string, scope: UrlScope = "component"): CodecResult {
  if (!text) return { output: "", error: null };
  try {
    return {
      output: scope === "component" ? encodeURIComponent(text) : encodeURI(text),
      error: null,
    };
  } catch {
    return { output: "", error: "Could not encode this text." };
  }
}

export function urlDecode(text: string): CodecResult {
  if (!text) return { output: "", error: null };
  try {
    return { output: decodeURIComponent(text.replace(/\+/g, " ")), error: null };
  } catch {
    const bad = text.match(/%(?![0-9A-Fa-f]{2})../g);
    return {
      output: "",
      error: bad
        ? `Malformed percent-escape near “${bad[0]}”. Each % must be followed by two hex digits.`
        : "Malformed URI sequence — check for stray % characters.",
    };
  }
}

/** Breaks a URL into parts for inspection. Returns null when unparseable. */
export function inspectUrl(text: string) {
  try {
    const url = new URL(text);
    return {
      protocol: url.protocol.replace(":", ""),
      host: url.host,
      pathname: url.pathname,
      hash: url.hash,
      params: [...url.searchParams.entries()],
    };
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------- json */

export interface JsonError {
  message: string;
  /** 1-based line number, when it can be determined. */
  line: number | null;
  column: number | null;
  /** Character offset reported by the parser. */
  position: number | null;
  /** The offending line, for inline display. */
  snippet: string | null;
}

export interface JsonAnalysis {
  valid: boolean;
  error: JsonError | null;
  value: unknown;
  stats: {
    type: string;
    keys: number;
    totalKeys: number;
    depth: number;
    arrays: number;
    objects: number;
    strings: number;
    numbers: number;
    booleans: number;
    nulls: number;
    nodes: number;
  } | null;
}

/** Derives line/column from a parser character offset. */
function locateOffset(text: string, position: number) {
  const before = text.slice(0, position);
  const lines = before.split(/\r\n|\r|\n/);
  const line = lines.length;
  const column = lines[lines.length - 1].length + 1;
  const snippet = text.split(/\r\n|\r|\n/)[line - 1] ?? null;
  return { line, column, snippet };
}

/** Extracts a position from the various engine-specific error message formats. */
function extractPosition(message: string): number | null {
  const patterns = [
    /at position (\d+)/i,
    /at JSON position (\d+)/i,
    /column (\d+)/i,
  ];
  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match) return Number(match[1]);
  }
  return null;
}

/** Recursively measures the shape of a parsed JSON value. */
function measure(value: unknown) {
  const stats = {
    totalKeys: 0,
    depth: 0,
    arrays: 0,
    objects: 0,
    strings: 0,
    numbers: 0,
    booleans: 0,
    nulls: 0,
    nodes: 0,
  };

  const walk = (node: unknown, depth: number) => {
    stats.nodes++;
    stats.depth = Math.max(stats.depth, depth);

    if (node === null) {
      stats.nulls++;
      return;
    }
    if (Array.isArray(node)) {
      stats.arrays++;
      node.forEach((item) => walk(item, depth + 1));
      return;
    }
    switch (typeof node) {
      case "object": {
        stats.objects++;
        const entries = Object.entries(node as Record<string, unknown>);
        stats.totalKeys += entries.length;
        entries.forEach(([, item]) => walk(item, depth + 1));
        break;
      }
      case "string":
        stats.strings++;
        break;
      case "number":
        stats.numbers++;
        break;
      case "boolean":
        stats.booleans++;
        break;
    }
  };

  walk(value, 1);
  return stats;
}

/** Parses JSON and reports precise diagnostics plus structural statistics. */
export function analyzeJson(text: string): JsonAnalysis {
  if (!text.trim()) {
    return { valid: false, error: null, value: undefined, stats: null };
  }

  try {
    const value = JSON.parse(text) as unknown;
    const measured = measure(value);
    const type = Array.isArray(value)
      ? "array"
      : value === null
        ? "null"
        : typeof value;

    return {
      valid: true,
      error: null,
      value,
      stats: {
        type,
        ...measured,
        // Top-level size: object key count, or array length.
        keys:
          value && typeof value === "object" && !Array.isArray(value)
            ? Object.keys(value as object).length
            : Array.isArray(value)
              ? value.length
              : 0,
      },
    };
  } catch (caught) {
    const message = (caught as Error).message;
    const position = extractPosition(message);
    const located = position === null ? null : locateOffset(text, position);

    return {
      valid: false,
      value: undefined,
      stats: null,
      error: {
        message,
        position,
        line: located?.line ?? null,
        column: located?.column ?? null,
        snippet: located?.snippet ?? null,
      },
    };
  }
}

/** Recursively sorts object keys so two documents can be compared. */
export function sortJsonKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortJsonKeys);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, item]) => [key, sortJsonKeys(item)]),
    );
  }
  return value;
}
