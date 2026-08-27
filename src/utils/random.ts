export interface PasswordOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeSimilar: boolean;
}

const charsets = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.?/",
};

const similar = /[il1Lo0O|`]/g;

function withoutSimilar(chars: string): string {
  return chars.replace(similar, "");
}

export function buildCharset(options: PasswordOptions): string {
  const parts: string[] = [];
  if (options.uppercase) parts.push(charsets.uppercase);
  if (options.lowercase) parts.push(charsets.lowercase);
  if (options.numbers) parts.push(charsets.numbers);
  if (options.symbols) parts.push(charsets.symbols);
  if (parts.length === 0) return charsets.lowercase;

  const joined = parts.join("");
  return options.excludeSimilar ? withoutSimilar(joined) : joined;
}

/** Cryptographically secure random selection using rejection sampling. */
function randomChar(chars: string): string {
  const limit = 256 - (256 % chars.length);
  const array = new Uint8Array(1);
  let value: number;
  do {
    crypto.getRandomValues(array);
    value = array[0];
  } while (value >= limit);
  return chars[value % chars.length];
}

function shuffleInPlace<T>(items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    const j = array[0] % (i + 1);
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

export function generatePassword(options: PasswordOptions): string {
  const charset = buildCharset(options);
  const length = Math.max(4, Math.min(128, options.length));

  // Guarantee at least one character from every selected group.
  const groups: string[] = [];
  if (options.uppercase) groups.push(charsets.uppercase);
  if (options.lowercase) groups.push(charsets.lowercase);
  if (options.numbers) groups.push(charsets.numbers);
  if (options.symbols) groups.push(charsets.symbols);
  if (groups.length === 0) groups.push(charsets.lowercase);

  const picks = groups.map((group) =>
    randomChar(options.excludeSimilar ? withoutSimilar(group) || group : group),
  );
  while (picks.length < length) picks.push(randomChar(charset));

  return shuffleInPlace(picks).join("").slice(0, length);
}

/** Shannon-style entropy estimate based on the character pool actually used. */
export function estimateEntropy(password: string): { bits: number; poolSize: number } {
  if (!password) return { bits: 0, poolSize: 0 };
  const pool = new Set(password).size;
  const poolSize = Math.max(pool, 2);
  return { bits: Math.round(password.length * Math.log2(poolSize)), poolSize: pool };
}

export function strengthLabel(bits: number): {
  label: string;
  tone: "danger" | "warning" | "success";
} {
  if (bits < 45) return { label: "Weak", tone: "danger" };
  if (bits < 75) return { label: "Good", tone: "warning" };
  return { label: "Strong", tone: "success" };
}

/* ------------------------------------------------------ generic randomness */

/**
 * Cryptographically secure integer in [min, max] inclusive.
 * Uses rejection sampling so every value is equally likely — a plain
 * `% range` would bias the low end of the range.
 */
export function secureRandomInt(min: number, max: number): number {
  const low = Math.ceil(Math.min(min, max));
  const high = Math.floor(Math.max(min, max));
  const range = high - low + 1;
  if (range <= 0) return low;
  if (range === 1) return low;

  const limit = Math.floor(0xffffffff / range) * range;
  const array = new Uint32Array(1);
  let value: number;
  do {
    crypto.getRandomValues(array);
    value = array[0];
  } while (value >= limit);

  return low + (value % range);
}

/** Secure float in [0, 1). */
export function secureRandomFloat(): number {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0] / 0x100000000;
}

/** Secure decimal in [min, max) with the given number of decimal places. */
export function secureRandomDecimal(min: number, max: number, decimals = 2): number {
  const value = min + secureRandomFloat() * (max - min);
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/** Returns a new shuffled array (Fisher–Yates). Never mutates the input. */
export function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = secureRandomInt(0, i);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Picks one random element, or undefined when the list is empty. */
export function pickOne<T>(items: T[]): T | undefined {
  if (items.length === 0) return undefined;
  return items[secureRandomInt(0, items.length - 1)];
}

/**
 * Picks `count` elements.
 * Without repeats this is a partial shuffle, so no element appears twice.
 */
export function pickMany<T>(items: T[], count: number, allowRepeats = false): T[] {
  if (items.length === 0 || count <= 0) return [];
  if (allowRepeats) {
    return Array.from({ length: count }, () => items[secureRandomInt(0, items.length - 1)]);
  }
  return shuffle(items).slice(0, Math.min(count, items.length));
}

/**
 * Generates `count` unique integers in [min, max].
 * Falls back to a shuffled full range when the request is dense.
 */
export function uniqueIntegers(min: number, max: number, count: number): number[] {
  const low = Math.ceil(Math.min(min, max));
  const high = Math.floor(Math.max(min, max));
  const size = high - low + 1;
  const wanted = Math.min(count, size);
  if (wanted <= 0) return [];

  // Dense request: shuffling the whole range is cheaper than rejection.
  if (wanted > size / 2) {
    return shuffle(Array.from({ length: size }, (_, index) => low + index)).slice(0, wanted);
  }

  const seen = new Set<number>();
  while (seen.size < wanted) seen.add(secureRandomInt(low, high));
  return [...seen];
}

export interface DiceRoll {
  /** Individual die results. */
  rolls: number[];
  /** Sum of the dice before modifier. */
  subtotal: number;
  modifier: number;
  total: number;
  sides: number;
}

/** Rolls `count` dice with `sides` faces and applies a flat modifier. */
export function rollDice(count: number, sides: number, modifier = 0): DiceRoll {
  const rolls = Array.from({ length: Math.max(0, count) }, () => secureRandomInt(1, sides));
  const subtotal = rolls.reduce((sum, value) => sum + value, 0);
  return { rolls, subtotal, modifier, total: subtotal + modifier, sides };
}

export type CoinSide = "heads" | "tails";

/** Flips `count` fair coins. */
export function flipCoins(count: number): CoinSide[] {
  return Array.from({ length: Math.max(0, count) }, () =>
    secureRandomInt(0, 1) === 0 ? "heads" : "tails",
  );
}

export function uuidV4(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export async function digestHex(algorithm: string, text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const buffer = await crypto.subtle.digest(algorithm, data);
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
