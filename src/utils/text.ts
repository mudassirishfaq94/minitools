export function countWords(text: string): number {
  const matches = text.trim().match(/[\p{L}\p{N}'’_-]+/gu);
  return matches ? matches.length : 0;
}

export function countSentences(text: string): number {
  const matches = text.trim().match(/[^.!?\s][^.!?]*(?:[.!?]+(?:\s|$)|$)/g);
  return matches ? matches.length : 0;
}

export function countParagraphs(text: string): number {
  return text.trim() ? text.trim().split(/\n{2,}/).length : 0;
}

export function countLines(text: string): number {
  return text ? text.split(/\r\n|\r|\n/).length : 0;
}

export function utf8Bytes(text: string): number {
  return new TextEncoder().encode(text).length;
}

export function toTitleCase(text: string): string {
  return text.replace(
    /\p{L}[\p{L}\p{N}'’]*/gu,
    (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
  );
}

export function toSentenceCase(text: string): string {
  return text
    .toLowerCase()
    .replace(/(^\s*\w|[.!?]\s+\w)/gu, (chunk) => chunk.toUpperCase());
}

function splitWords(text: string): string[] {
  return text
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
}

export function toCamelCase(text: string): string {
  const words = splitWords(text);
  return words
    .map((word, index) =>
      index === 0
        ? word.charAt(0).toLowerCase() + word.slice(1).toLowerCase()
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
    )
    .join("");
}

export function toPascalCase(text: string): string {
  return splitWords(text)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
}

export function toSnakeCase(text: string): string {
  return splitWords(text).map((word) => word.toLowerCase()).join("_");
}

export function toKebabCase(text: string): string {
  return splitWords(text).map((word) => word.toLowerCase()).join("-");
}

export function toConstantCase(text: string): string {
  return splitWords(text).map((word) => word.toUpperCase()).join("_");
}

export function toAlternatingCase(text: string): string {
  return text
    .split("")
    .map((char, index) => (index % 2 === 0 ? char.toLowerCase() : char.toUpperCase()))
    .join("");
}

/* ------------------------------------------------------- line operations */

export type LineEnding = "\n" | "\r\n";

/** Splits text into lines, tolerating CRLF, CR and LF. */
export function toLines(text: string): string[] {
  return text.split(/\r\n|\r|\n/);
}

export function joinLines(lines: string[], ending: LineEnding = "\n"): string {
  return lines.join(ending);
}

export type SortOrder = "asc" | "desc" | "length-asc" | "length-desc" | "random" | "reverse";

export interface SortOptions {
  order: SortOrder;
  caseSensitive?: boolean;
  /** Sort "item2" before "item10" instead of lexicographically. */
  natural?: boolean;
  removeEmpty?: boolean;
  trimLines?: boolean;
}

/** Sorts lines using the chosen strategy. Pure — never mutates the input. */
export function sortLines(text: string, options: SortOptions): string {
  const {
    order,
    caseSensitive = false,
    natural = true,
    removeEmpty = false,
    trimLines = false,
  } = options;

  let lines = toLines(text);
  if (trimLines) lines = lines.map((line) => line.trim());
  if (removeEmpty) lines = lines.filter((line) => line.trim() !== "");

  const collator = new Intl.Collator(undefined, {
    numeric: natural,
    sensitivity: caseSensitive ? "case" : "base",
  });

  const sorted = [...lines];
  switch (order) {
    case "asc":
      sorted.sort((a, b) => collator.compare(a, b));
      break;
    case "desc":
      sorted.sort((a, b) => collator.compare(b, a));
      break;
    case "length-asc":
      sorted.sort((a, b) => a.length - b.length || collator.compare(a, b));
      break;
    case "length-desc":
      sorted.sort((a, b) => b.length - a.length || collator.compare(a, b));
      break;
    case "reverse":
      sorted.reverse();
      break;
    case "random":
      for (let i = sorted.length - 1; i > 0; i--) {
        const j = randomInt(i + 1);
        [sorted[i], sorted[j]] = [sorted[j], sorted[i]];
      }
      break;
  }

  return joinLines(sorted);
}

export interface DedupeOptions {
  caseSensitive?: boolean;
  /** Ignore leading/trailing whitespace when comparing. */
  ignoreWhitespace?: boolean;
  /** Keep only lines that appeared more than once. */
  keepOnlyDuplicates?: boolean;
  /** Drop every line that has a duplicate, keeping uniques only. */
  removeAllOccurrences?: boolean;
}

export interface DedupeResult {
  text: string;
  removed: number;
  duplicateGroups: number;
}

/** Removes duplicate lines, preserving the order of first appearance. */
export function removeDuplicateLines(
  text: string,
  options: DedupeOptions = {},
): DedupeResult {
  const {
    caseSensitive = false,
    ignoreWhitespace = true,
    keepOnlyDuplicates = false,
    removeAllOccurrences = false,
  } = options;

  const lines = toLines(text);
  const key = (line: string) => {
    let value = ignoreWhitespace ? line.trim() : line;
    if (!caseSensitive) value = value.toLowerCase();
    return value;
  };

  const counts = new Map<string, number>();
  for (const line of lines) counts.set(key(line), (counts.get(key(line)) ?? 0) + 1);

  let result: string[];
  if (removeAllOccurrences) {
    result = lines.filter((line) => counts.get(key(line)) === 1);
  } else if (keepOnlyDuplicates) {
    const seen = new Set<string>();
    result = lines.filter((line) => {
      const id = key(line);
      if ((counts.get(id) ?? 0) < 2 || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  } else {
    const seen = new Set<string>();
    result = lines.filter((line) => {
      const id = key(line);
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }

  let duplicateGroups = 0;
  counts.forEach((count) => {
    if (count > 1) duplicateGroups++;
  });

  return {
    text: joinLines(result),
    removed: lines.length - result.length,
    duplicateGroups,
  };
}

/* ---------------------------------------------------------- whitespace */

export interface WhitespaceOptions {
  /** Collapse runs of spaces/tabs into a single space. */
  collapseSpaces?: boolean;
  trimLines?: boolean;
  /** Collapse 2+ blank lines into one. */
  collapseBlankLines?: boolean;
  /** Delete every blank line. */
  removeBlankLines?: boolean;
  removeAllSpaces?: boolean;
  removeTabs?: boolean;
  /** Strip leading/trailing whitespace from the whole text. */
  trimText?: boolean;
}

/** Normalises whitespace according to the selected options. */
export function cleanWhitespace(text: string, options: WhitespaceOptions = {}): string {
  let output = text;

  if (options.removeAllSpaces) return output.replace(/[^\S\r\n]+/g, "");
  if (options.removeTabs) output = output.replace(/\t/g, " ");
  if (options.collapseSpaces) output = output.replace(/[^\S\r\n]{2,}/g, " ");
  if (options.trimLines) output = joinLines(toLines(output).map((line) => line.trim()));
  if (options.removeBlankLines) {
    output = joinLines(toLines(output).filter((line) => line.trim() !== ""));
  } else if (options.collapseBlankLines) {
    output = output.replace(/(\r?\n\s*){3,}/g, "\n\n");
  }
  if (options.trimText) output = output.trim();

  return output;
}

/* ------------------------------------------------------------- cleaning */

export interface CleanOptions {
  stripHtml?: boolean;
  removePunctuation?: boolean;
  removeNumbers?: boolean;
  removeEmoji?: boolean;
  /** Strip diacritics: "café" → "cafe". */
  removeAccents?: boolean;
  /** Curly quotes and dashes → plain ASCII. */
  normalizeQuotes?: boolean;
  removeUrls?: boolean;
  removeEmails?: boolean;
  /** Keep only letters, numbers and spaces. */
  keepAlphanumeric?: boolean;
  lowercase?: boolean;
}

/** Applies the selected cleaning passes in a stable, predictable order. */
export function cleanText(text: string, options: CleanOptions = {}): string {
  let output = text;

  if (options.stripHtml) {
    output = output
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]*>/g, "");
    // Decode the most common named entities.
    const entities: Record<string, string> = {
      "&nbsp;": " ",
      "&amp;": "&",
      "&lt;": "<",
      "&gt;": ">",
      "&quot;": '"',
      "&#39;": "'",
    };
    output = output.replace(
      /&(nbsp|amp|lt|gt|quot|#39);/g,
      (match) => entities[match] ?? match,
    );
  }

  if (options.removeUrls) output = output.replace(/https?:\/\/\S+|www\.\S+/gi, "");
  if (options.removeEmails) output = output.replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, "");

  if (options.normalizeQuotes) {
    output = output
      .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
      .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
      .replace(/[\u2013\u2014]/g, "-")
      .replace(/\u2026/g, "...");
  }

  if (options.removeAccents) {
    output = output.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  if (options.removeEmoji) {
    output = output.replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu, "");
  }

  if (options.removeNumbers) output = output.replace(/\d+/g, "");
  if (options.removePunctuation) {
    output = output.replace(/[^\p{L}\p{N}\s]/gu, "");
  }
  if (options.keepAlphanumeric) output = output.replace(/[^\p{L}\p{N}\s]/gu, "");
  if (options.lowercase) output = output.toLowerCase();

  return output;
}

/* ------------------------------------------------------------- reversal */

export type ReverseMode = "characters" | "words" | "lines" | "words-in-line";

/** Reverses text at the chosen granularity, preserving line structure. */
export function reverseText(text: string, mode: ReverseMode): string {
  switch (mode) {
    case "characters":
      // Array.from keeps surrogate pairs (emoji) intact.
      return Array.from(text).reverse().join("");
    case "words":
      return text.split(/(\s+)/).reverse().join("");
    case "lines":
      return joinLines(toLines(text).reverse());
    case "words-in-line":
      return joinLines(
        toLines(text).map((line) => line.split(/(\s+)/).reverse().join("")),
      );
    default:
      return text;
  }
}

/* ------------------------------------------------------------ repeating */

export interface RepeatOptions {
  times: number;
  separator?: string;
  /** Append an incrementing counter to each copy. */
  numbered?: boolean;
  startAt?: number;
}

/** Repeats text N times with an optional separator and counter. */
export function repeatText(text: string, options: RepeatOptions): string {
  const { times, separator = "\n", numbered = false, startAt = 1 } = options;
  const count = Math.max(0, Math.floor(times));
  if (count === 0 || !text) return "";

  return Array.from({ length: count }, (_, index) =>
    numbered ? `${startAt + index}. ${text}` : text,
  ).join(separator);
}

interface SlugOptions {
  separator?: string;
  lowercase?: boolean;
  trim?: boolean;
}

export function slugify(text: string, { separator = "-", lowercase = true }: SlugOptions = {}): string {
  let value = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  value = lowercase ? value.toLowerCase() : value;
  value = value
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, separator)
    .replace(new RegExp(`^${separator}+|${separator}+$`, "g"), "");
  return value;
}

export const loremWords = [
  "lorem",
  "ipsum",
  "dolor",
  "sit",
  "amet",
  "consectetur",
  "adipiscing",
  "elit",
  "sed",
  "do",
  "eiusmod",
  "tempor",
  "incididunt",
  "ut",
  "labore",
  "et",
  "dolore",
  "magna",
  "aliqua",
  "enim",
  "ad",
  "minim",
  "veniam",
  "quis",
  "nostrud",
  "exercitation",
  "ullamco",
  "laboris",
  "nisi",
  "aliquip",
  "ex",
  "ea",
  "commodo",
  "consequat",
  "duis",
  "aute",
  "irure",
  "in",
  "reprehenderit",
  "voluptate",
  "velit",
  "esse",
  "cillum",
  "eu",
  "fugiat",
  "nulla",
  "pariatur",
  "excepteur",
  "sint",
  "occaecat",
  "cupidatat",
  "non",
  "proident",
  "sunt",
  "culpa",
  "qui",
  "officia",
  "deserunt",
  "mollit",
  "anim",
  "id",
  "est",
  "laborum",
];

function pick<T>(items: T[]): T {
  return items[randomInt(items.length)];
}

export function randomInt(max: number): number {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0] % max;
}

export function generateSentence(wordCount: number): string {
  const words = Array.from({ length: wordCount }, () => pick(loremWords));
  const sentence = words.join(" ");
  return `${sentence.charAt(0).toUpperCase()}${sentence.slice(1)}.`;
}

export function generateLorem(paragraphs: number, sentencesPerParagraph: number): string {
  return Array.from({ length: paragraphs }, () =>
    Array.from({ length: sentencesPerParagraph }, () => generateSentence(6 + randomInt(8))).join(
      " ",
    ),
  ).join("\n\n");
}
