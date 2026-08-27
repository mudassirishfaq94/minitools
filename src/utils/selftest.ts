/**
 * Development-only calculation self-test.
 *
 * Runs in `npm run dev` and reports to the browser console. Every expected
 * value below is an independently known result, not a snapshot of our own
 * output, so a regression in a formula fails loudly.
 *
 * Excluded from production builds via `import.meta.env.DEV`.
 */

import {
  amortisationSchedule,
  calculateBmi,
  calculateCompoundInterest,
  calculateDiscount,
  calculateLoan,
  calculateTax,
  calculateTip,
  feetInchesToMeters,
  poundsToKilograms,
  splitAmount,
} from "@/utils/finance";
import { calendarDifference, countWeekdays, parseDateInput } from "@/utils/datetime";
import { convert } from "@/utils/units";
import { roundTo } from "@/utils/number";
import {
  cleanText,
  cleanWhitespace,
  removeDuplicateLines,
  repeatText,
  reverseText,
  sortLines,
} from "@/utils/text";
import {
  analyzeJson,
  base64Decode,
  decodeBase64,
  encodeBase64,
  sortJsonKeys,
  urlDecode,
  urlEncode,
} from "@/utils/codec";
import {
  flipCoins,
  pickMany,
  rollDice,
  secureRandomInt,
  shuffle,
  uniqueIntegers,
} from "@/utils/random";
import { buildHarmony, buildScale, checkContrast, contrastRatio } from "@/utils/color";
import {
  fitWithin,
  renameExtension,
  savingsPercent,
  simplifyRatio,
} from "@/utils/image";
import {
  autoDetectBackground,
  colorDistance,
  removeBackground,
} from "@/utils/background";
import {
  buildPatternSvg,
  defaultPatternOptions,
  patternDataUri,
  patterns,
} from "@/utils/patterns";
import { createPersistentStore, uniqueStrings } from "@/utils/storage";
import { availableTools, relatedTools } from "@/data/catalog";
import {
  buildFaqs,
  buildHowTo,
  buildIntro,
  buildMetaDescription,
} from "@/data/toolContent";
import { clampDescription } from "@/utils/seo";

interface Failure {
  name: string;
  expected: unknown;
  actual: unknown;
}

const failures: Failure[] = [];
let passed = 0;

/** Asserts two numbers match within a tolerance. */
function near(name: string, actual: number, expected: number, tolerance = 0.01) {
  if (!Number.isFinite(actual) || Math.abs(actual - expected) > tolerance) {
    failures.push({ name, expected, actual });
  } else {
    passed++;
  }
}

function equal(name: string, actual: unknown, expected: unknown) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    failures.push({ name, expected, actual });
  } else {
    passed++;
  }
}

export function runCalculationSelfTest() {
  /* ------------------------------------------------------------- loans */
  // Textbook case: 100,000 at 10% p.a. over 12 months → EMI 8,791.59
  const loan = calculateLoan(100_000, 10, 12);
  near("EMI 100k @10% / 12mo", loan.emi, 8791.59, 0.01);
  near("EMI total payment", loan.totalPayment, 105_499.06, 0.5);
  near("EMI total interest", loan.totalInterest, 5499.06, 0.5);

  // Zero interest must degrade to a plain division.
  near("EMI at 0% interest", calculateLoan(12_000, 0, 12).emi, 1000, 0.001);

  // A schedule must fully amortise: closing balance exactly zero.
  const schedule = amortisationSchedule(100_000, 10, 12);
  equal("Schedule length", schedule.length, 12);
  near("Schedule closes at zero", schedule[schedule.length - 1].balance, 0, 0.005);
  near(
    "Schedule principal sums to loan",
    schedule.reduce((sum, row) => sum + row.principal, 0),
    100_000,
    0.05,
  );

  /* -------------------------------------------------- compound interest */
  // 10,000 at 8% compounded monthly for 10 years → 22,196.40
  const compound = calculateCompoundInterest(10_000, 8, 10, 12);
  near("Compound 10k @8% monthly 10y", compound.amount, 22_196.4, 0.5);
  // Effective annual rate for 8% nominal compounded monthly → 8.2999%
  near("Effective annual rate", compound.effectiveRate, 8.2999, 0.001);
  // Annual compounding: 1000 @5% for 10y → 1628.89
  near(
    "Compound 1k @5% annually 10y",
    calculateCompoundInterest(1000, 5, 10, 1).amount,
    1628.89,
    0.01,
  );
  // Zero rate with contributions is a plain sum.
  near(
    "Compound at 0% with contributions",
    calculateCompoundInterest(1000, 0, 2, 12, 100).amount,
    1000 + 100 * 24,
    0.001,
  );

  /* ----------------------------------------------------------- discount */
  const discount = calculateDiscount(2000, 25);
  near("Discount 25% of 2000 saved", discount.saved, 500);
  near("Discount 25% of 2000 final", discount.final, 1500);
  // Stacked discounts multiply, they do not add: 25% then 10% → 32.5% total.
  const stacked = calculateDiscount(calculateDiscount(2000, 25).final, 10);
  near("Stacked discount final", stacked.final, 1350);

  /* ---------------------------------------------------------------- tax */
  const exclusive = calculateTax(1000, 18, "exclusive");
  near("GST exclusive tax", exclusive.tax, 180);
  near("GST exclusive gross", exclusive.gross, 1180);
  const inclusive = calculateTax(1180, 18, "inclusive");
  near("GST inclusive net", inclusive.net, 1000);
  near("GST inclusive tax", inclusive.tax, 180);

  /* ---------------------------------------------------------------- tip */
  const tip = calculateTip(85, 18);
  near("Tip 18% of 85", tip.tip, 15.3);
  near("Tip total", tip.total, 100.3);

  /* -------------------------------------------------------------- split */
  // Uneven split must still sum exactly to the total.
  const split = splitAmount(100, 3);
  equal("Split 100 / 3 shares", split.shares, [33.34, 33.33, 33.33]);
  near(
    "Split shares sum to total",
    split.shares.reduce((sum, value) => sum + value, 0),
    100,
    0.0001,
  );
  const evenSplit = splitAmount(100.3, 2);
  equal("Split 100.30 / 2", evenSplit.shares, [50.15, 50.15]);

  /* ---------------------------------------------------------------- BMI */
  near("BMI 70kg / 1.75m", calculateBmi(70, 1.75).bmi, 22.86, 0.01);
  equal("BMI category normal", calculateBmi(70, 1.75).category, "Normal weight");
  equal("BMI category obese", calculateBmi(100, 1.6).category, "Obese");
  equal("BMI category underweight", calculateBmi(45, 1.75).category, "Underweight");
  // Imperial path: 154 lb, 5'9" → ~22.7
  near(
    "BMI imperial 154lb 5ft9",
    calculateBmi(poundsToKilograms(154), feetInchesToMeters(5, 9)).bmi,
    22.74,
    0.05,
  );

  /* --------------------------------------------------------------- dates */
  const d = (value: string) => parseDateInput(value)!;
  equal("Date diff 2024-01-01 → 2024-03-15", calendarDifference(d("2024-01-01"), d("2024-03-15")), {
    years: 0,
    months: 2,
    days: 14,
  });
  // Month-end borrow across a leap February — the classic failure case.
  equal("Date diff 2024-01-31 → 2024-03-01", calendarDifference(d("2024-01-31"), d("2024-03-01")), {
    years: 0,
    months: 1,
    days: 1,
  });
  // Leap-day anniversary clamps to Feb 28 in a non-leap year → exactly 1 year.
  equal("Date diff leap-day anniversary", calendarDifference(d("2000-02-29"), d("2001-02-28")), {
    years: 1,
    months: 0,
    days: 0,
  });
  equal("Date diff whole years", calendarDifference(d("1995-06-15"), d("2025-06-15")), {
    years: 30,
    months: 0,
    days: 0,
  });
  // 2024-01-01 is a Monday; the first week has 5 weekdays and 2 weekend days.
  equal("Weekday count first week 2024", countWeekdays(d("2024-01-01"), d("2024-01-07")), {
    weekdays: 5,
    weekends: 2,
    totalDays: 7,
  });

  /* --------------------------------------------------------- unit engine */
  near("1 km → m", convert(1, "kilometer", "meter", "length")!, 1000);
  near("1 mile → km", convert(1, "mile", "kilometer", "length")!, 1.609344, 1e-6);
  near("100 °C → °F", convert(100, "celsius", "fahrenheit", "temperature")!, 212);
  near("-40 °C → °F", convert(-40, "celsius", "fahrenheit", "temperature")!, -40);
  near("0 °C → K", convert(0, "celsius", "kelvin", "temperature")!, 273.15);
  near("1 kg → lb", convert(1, "kilogram", "pound", "weight")!, 2.2046226, 1e-6);
  near("1 GB → MB", convert(1, "gigabyte", "megabyte", "data")!, 1024);
  near("1 hour → seconds", convert(1, "hour", "second", "time")!, 3600);
  near("100 km/h → mph", convert(100, "kilometers-per-hour", "miles-per-hour", "speed")!, 62.1371, 1e-4);
  near("1 hectare → m²", convert(1, "hectare", "square-meter", "area")!, 10_000);
  near("1 gallon → liters", convert(1, "gallon", "liter", "volume")!, 3.785412, 1e-5);

  /* ------------------------------------------------------------ rounding */
  near("roundTo avoids float drift", roundTo(1.005, 2), 1.01, 1e-9);
  near("roundTo 2.675", roundTo(2.675, 2), 2.68, 1e-9);

  /* ---------------------------------------------------------- text tools */
  // Sorting: natural order must beat lexicographic on numbered items.
  equal(
    "Sort natural order",
    sortLines("item10\nitem2\nitem1", { order: "asc", natural: true }),
    "item1\nitem2\nitem10",
  );
  equal(
    "Sort lexicographic order",
    sortLines("item10\nitem2\nitem1", { order: "asc", natural: false }),
    "item1\nitem10\nitem2",
  );
  equal(
    "Sort descending",
    sortLines("a\nc\nb", { order: "desc" }),
    "c\nb\na",
  );
  equal(
    "Sort by length",
    sortLines("ccc\na\nbb", { order: "length-asc" }),
    "a\nbb\nccc",
  );
  equal(
    "Sort removes empty lines",
    sortLines("b\n\na", { order: "asc", removeEmpty: true }),
    "a\nb",
  );
  // Shuffling must preserve the multiset of lines.
  equal(
    "Shuffle preserves items",
    sortLines("a\nb\nc\nd", { order: "random" }).split("\n").sort().join(","),
    "a,b,c,d",
  );

  // Deduplication.
  equal(
    "Dedupe keeps first occurrence order",
    removeDuplicateLines("b\na\nb\nc\na").text,
    "b\na\nc",
  );
  equal(
    "Dedupe case-insensitive by default",
    removeDuplicateLines("Apple\napple").text,
    "Apple",
  );
  equal(
    "Dedupe case-sensitive keeps both",
    removeDuplicateLines("Apple\napple", { caseSensitive: true }).text,
    "Apple\napple",
  );
  equal(
    "Dedupe reports removed count",
    removeDuplicateLines("a\na\na").removed,
    2,
  );
  equal(
    "Dedupe keep-only-duplicates",
    removeDuplicateLines("a\nb\na\nc\nb", { keepOnlyDuplicates: true }).text,
    "a\nb",
  );
  equal(
    "Dedupe remove-all-occurrences",
    removeDuplicateLines("a\nb\na\nc", { removeAllOccurrences: true }).text,
    "b\nc",
  );

  // Whitespace.
  equal(
    "Collapse extra spaces",
    cleanWhitespace("a   b    c", { collapseSpaces: true }),
    "a b c",
  );
  equal(
    "Trim each line",
    cleanWhitespace("  a  \n  b  ", { trimLines: true }),
    "a\nb",
  );
  equal(
    "Remove blank lines",
    cleanWhitespace("a\n\n\nb", { removeBlankLines: true }),
    "a\nb",
  );
  equal(
    "Collapse blank lines to one",
    cleanWhitespace("a\n\n\n\nb", { collapseBlankLines: true }),
    "a\n\nb",
  );
  equal(
    "Remove all spaces keeps newlines",
    cleanWhitespace("a b\tc\nd e", { removeAllSpaces: true }),
    "abc\nde",
  );

  // Cleaning.
  equal("Strip HTML tags", cleanText("<p>Hi <b>there</b></p>", { stripHtml: true }), "Hi there");
  equal(
    "Strip HTML drops script bodies",
    cleanText("<script>evil()</script>safe", { stripHtml: true }),
    "safe",
  );
  equal("Decode entities", cleanText("a &amp; b", { stripHtml: true }), "a & b");
  equal("Remove accents", cleanText("café résumé", { removeAccents: true }), "cafe resume");
  equal(
    "Normalise smart quotes",
    cleanText("\u201Chi\u201D \u2014 it\u2019s", { normalizeQuotes: true }),
    '"hi" - it\'s',
  );
  equal("Remove numbers", cleanText("a1b22c", { removeNumbers: true }), "abc");
  equal("Remove URLs", cleanText("see https://a.com now", { removeUrls: true }), "see  now");
  equal(
    "Remove emails",
    cleanText("ping hi@example.com ok", { removeEmails: true }),
    "ping  ok",
  );
  equal("Remove punctuation keeps letters", cleanText("hi, there!", { removePunctuation: true }), "hi there");

  // Reversing.
  equal("Reverse characters", reverseText("abc", "characters"), "cba");
  equal("Reverse words", reverseText("one two three", "words"), "three two one");
  equal("Reverse lines", reverseText("a\nb\nc", "lines"), "c\nb\na");
  equal("Reverse words per line", reverseText("a b\nc d", "words-in-line"), "b a\nd c");
  // Emoji must not be split into broken surrogate halves.
  equal("Reverse keeps emoji intact", reverseText("a😀b", "characters"), "b😀a");

  /* --------------------------------------------------------- randomness */
  // Range bounds must always hold, in either argument order.
  const inRange = Array.from({ length: 400 }, () => secureRandomInt(5, 10));
  equal("Random int respects bounds", inRange.every((v) => v >= 5 && v <= 10), true);
  equal("Random int covers full range", new Set(inRange).size, 6);
  equal("Random int single value range", secureRandomInt(7, 7), 7);
  equal(
    "Random int tolerates reversed args",
    secureRandomInt(10, 5) >= 5 && secureRandomInt(10, 5) <= 10,
    true,
  );

  // Unique integers must never repeat and must respect the range.
  const unique = uniqueIntegers(1, 10, 10);
  equal("Unique integers has no repeats", new Set(unique).size, 10);
  equal("Unique integers sorted covers range", [...unique].sort((a, b) => a - b).join(","), "1,2,3,4,5,6,7,8,9,10");
  equal("Unique integers caps at range size", uniqueIntegers(1, 3, 99).length, 3);

  // Shuffle preserves the multiset and does not mutate the source.
  const source = [1, 2, 3, 4, 5];
  const shuffled = shuffle(source);
  equal("Shuffle preserves elements", [...shuffled].sort().join(","), "1,2,3,4,5");
  equal("Shuffle does not mutate input", source.join(","), "1,2,3,4,5");

  // Picking without repeats cannot duplicate entries.
  const picked = pickMany(["a", "b", "c"], 3, false);
  equal("pickMany unique has no repeats", new Set(picked).size, 3);
  equal("pickMany caps at list length", pickMany(["a", "b"], 10, false).length, 2);
  equal("pickMany with repeats honours count", pickMany(["a"], 5, true).length, 5);

  // Dice.
  const roll = rollDice(3, 6, 2);
  equal("Dice roll count", roll.rolls.length, 3);
  equal("Dice faces within range", roll.rolls.every((v) => v >= 1 && v <= 6), true);
  equal("Dice total includes modifier", roll.total, roll.subtotal + 2);
  equal("Dice d20 bounds", rollDice(50, 20).rolls.every((v) => v >= 1 && v <= 20), true);

  // Coins.
  equal("Coin flip count", flipCoins(25).length, 25);
  equal(
    "Coin flip only two outcomes",
    flipCoins(200).every((side) => side === "heads" || side === "tails"),
    true,
  );

  /* -------------------------------------------------------------- colour */
  // WCAG reference values: black on white is exactly 21:1.
  near("Contrast black on white", contrastRatio({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 }), 21, 0.01);
  near("Contrast identical colours", contrastRatio({ r: 50, g: 50, b: 50 }, { r: 50, g: 50, b: 50 }), 1, 0.001);
  equal(
    "Contrast AA pass for black on white",
    checkContrast({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 }).aaNormal,
    true,
  );
  equal(
    "Contrast AA fail for light grey on white",
    checkContrast({ r: 200, g: 200, b: 200 }, { r: 255, g: 255, b: 255 }).aaNormal,
    false,
  );
  // Harmonies rotate the hue by known amounts.
  equal("Complementary returns 2 colours", buildHarmony({ h: 0, s: 100, l: 50 }, "complementary").length, 2);
  equal("Triadic returns 3 colours", buildHarmony({ h: 0, s: 100, l: 50 }, "triadic").length, 3);
  equal("Tetradic returns 4 colours", buildHarmony({ h: 0, s: 100, l: 50 }, "tetradic").length, 4);
  equal(
    "Complementary of red is cyan",
    buildHarmony({ h: 0, s: 100, l: 50 }, "complementary")[1],
    "#00FFFF",
  );
  equal("Scale produces 10 steps", buildScale({ h: 240, s: 80, l: 50 }).length, 10);

  /* --------------------------------------------------------------- image */
  // Fitting preserves aspect ratio and never upscales.
  equal("Fit landscape into square", fitWithin(1000, 500, 400, 400), { width: 400, height: 200 });
  equal("Fit portrait into square", fitWithin(500, 1000, 400, 400), { width: 200, height: 400 });
  equal("Fit never upscales", fitWithin(100, 100, 400, 400), { width: 100, height: 100 });
  equal("Fit exact match", fitWithin(400, 300, 400, 300), { width: 400, height: 300 });

  equal("Ratio 1920x1080 simplifies", simplifyRatio(1920, 1080), "16:9");
  equal("Ratio 800x600 simplifies", simplifyRatio(800, 600), "4:3");
  equal("Ratio square", simplifyRatio(512, 512), "1:1");

  equal("Rename extension swaps suffix", renameExtension("photo.png", "webp"), "photo.webp");
  equal("Rename handles dots in stem", renameExtension("my.photo.v2.jpeg", "png"), "my.photo.v2.png");
  equal("Rename handles missing extension", renameExtension("photo", "jpg"), "photo.jpg");

  near("Savings 50%", savingsPercent(1000, 500), 50);
  near("Savings negative when grown", savingsPercent(500, 1000), -100);
  near("Savings zero guard", savingsPercent(0, 100), 0);

  /* ------------------------------------------------- generated content */
  // Every tool in the catalog must produce complete page content.
  const contentGaps = availableTools.filter((tool) => {
    const steps = buildHowTo(tool);
    const faqs = buildFaqs(tool);
    return (
      steps.length < 3 ||
      faqs.length < 3 ||
      !buildIntro(tool) ||
      steps.some((step) => !step.title || !step.body) ||
      faqs.some((item) => !item.question || !item.answer)
    );
  });
  equal("Every tool has how-to and FAQ content", contentGaps.map((t) => t.id), []);

  // Overrides must not introduce a duplicate question.
  const duplicateFaqs = availableTools.filter((tool) => {
    const questions = buildFaqs(tool).map((item) => item.question.toLowerCase());
    return new Set(questions).size !== questions.length;
  });
  equal("No duplicate FAQ questions", duplicateFaqs.map((t) => t.id), []);

  // Descriptions must fit what search engines display.
  const longDescriptions = availableTools.filter(
    (tool) => clampDescription(buildMetaDescription(tool)).length > 160,
  );
  equal("Meta descriptions stay within 160 chars", longDescriptions.map((t) => t.id), []);
  equal(
    "Descriptions are unique per tool",
    new Set(availableTools.map((tool) => buildMetaDescription(tool))).size,
    availableTools.length,
  );

  equal("clampDescription leaves short text alone", clampDescription("Short text."), "Short text.");
  equal(
    "clampDescription truncates on a word boundary",
    clampDescription("aaaa bbbb cccc dddd", 12).endsWith("…"),
    true,
  );
  equal("clampDescription never exceeds the cap", clampDescription("x".repeat(400), 50).length <= 51, true);

  // Related tools are derived, never hand-curated.
  const relatedGaps = availableTools.filter((tool) => relatedTools(tool).length === 0);
  equal("Every tool has related suggestions", relatedGaps.map((t) => t.id), []);
  const selfReferences = availableTools.filter((tool) =>
    relatedTools(tool).some((item) => item.id === tool.id),
  );
  equal("Related tools never include the tool itself", selfReferences.map((t) => t.id), []);
  equal(
    "Related tools have no duplicates",
    availableTools.every((tool) => {
      const ids = relatedTools(tool).map((item) => item.id);
      return new Set(ids).size === ids.length;
    }),
    true,
  );
  // Same-category tools should outrank unrelated ones.
  const lengthRelated = relatedTools(
    availableTools.find((tool) => tool.id === "length-converter")!,
  );
  equal(
    "Related favours the same category",
    lengthRelated[0]?.category,
    "converters",
  );

  /* -------------------------------------------------------- local store */
  equal("uniqueStrings removes duplicates", uniqueStrings(["a", "b", "a", "c", "b"]), [
    "a",
    "b",
    "c",
  ]);
  equal("uniqueStrings preserves first-seen order", uniqueStrings(["c", "a", "c"]), ["c", "a"]);
  equal("uniqueStrings drops non-strings", uniqueStrings(["a", 1, null, "", "b"]), ["a", "b"]);
  equal("uniqueStrings handles non-arrays", uniqueStrings("nope"), []);

  // The store must de-duplicate, cap length and survive corrupt payloads.
  const storeKey = "toolstack:selftest";
  window.localStorage.removeItem(storeKey);
  const probe = createPersistentStore<string[]>(storeKey, [], (value) =>
    uniqueStrings(value).slice(0, 3),
  );
  probe.set(["a", "b"]);
  equal("Store persists values", window.localStorage.getItem(storeKey), '["a","b"]');

  let notified = 0;
  const unsubscribe = probe.subscribe(() => notified++);
  probe.set((current) => ["c", ...current]);
  equal("Store notifies subscribers", notified, 1);
  equal("Store applies updater", probe.get(), ["c", "a", "b"]);
  unsubscribe();
  probe.set(["z"]);
  equal("Store stops notifying after unsubscribe", notified, 1);

  // Corrupt JSON must fall back rather than throw.
  window.localStorage.setItem(storeKey, "{not json");
  const recovered = createPersistentStore<string[]>(storeKey, ["fallback"]);
  equal("Store recovers from corrupt JSON", recovered.get(), ["fallback"]);

  // Sanitiser enforces the cap on load.
  window.localStorage.setItem(storeKey, JSON.stringify(["a", "a", "b", "c", "d", "e"]));
  const capped = createPersistentStore<string[]>(storeKey, [], (value) =>
    uniqueStrings(value).slice(0, 3),
  );
  equal("Store sanitises on load", capped.get(), ["a", "b", "c"]);
  window.localStorage.removeItem(storeKey);

  /* ------------------------------------------------- background removal */
  // Identical colours are distance 0; black vs white is the maximum, 100.
  near("Colour distance identical", colorDistance(10, 20, 30, 10, 20, 30), 0, 0.001);
  near("Colour distance black/white", colorDistance(0, 0, 0, 255, 255, 255), 100, 0.001);
  equal(
    "Colour distance is symmetric",
    Math.round(colorDistance(200, 10, 50, 20, 240, 5)) ===
      Math.round(colorDistance(20, 240, 5, 200, 10, 50)),
    true,
  );

  // Build a 4×4 image: white border, red 2×2 centre.
  const makeTestImage = () => {
    const data = new ImageData(4, 4);
    for (let index = 0; index < 16; index++) {
      const x = index % 4;
      const y = (index / 4) | 0;
      const centre = x >= 1 && x <= 2 && y >= 1 && y <= 2;
      data.data.set(centre ? [255, 0, 0, 255] : [255, 255, 255, 255], index * 4);
    }
    return data;
  };

  const keyed = removeBackground(makeTestImage(), {
    color: { r: 255, g: 255, b: 255, a: 255 },
    tolerance: 5,
    softness: 0,
    mode: "global",
    trim: 0,
  });
  equal("Keying clears the white border", keyed.output.data[3], 0);
  equal("Keying keeps the red centre", keyed.output.data[(1 * 4 + 1) * 4 + 3], 255);
  near("Keying reports 12 of 16 removed", keyed.removedRatio, 12 / 16, 0.001);

  // Contiguous mode must preserve an enclosed region of the key colour.
  const enclosed = new ImageData(5, 5);
  for (let index = 0; index < 25; index++) {
    const x = index % 5;
    const y = (index / 5) | 0;
    const isRing = x === 1 || x === 3 || y === 1 || y === 3;
    const inside = x > 0 && x < 4 && y > 0 && y < 4;
    enclosed.data.set(
      inside && isRing ? [255, 0, 0, 255] : [255, 255, 255, 255],
      index * 4,
    );
  }
  const contiguous = removeBackground(enclosed, {
    color: { r: 255, g: 255, b: 255, a: 255 },
    tolerance: 5,
    softness: 0,
    mode: "contiguous",
    trim: 0,
  });
  // The white pixel at (2,2) is walled in by red, so it must survive.
  equal("Contiguous keeps enclosed key colour", contiguous.output.data[(2 * 5 + 2) * 4 + 3], 255);
  equal("Contiguous still clears the outer edge", contiguous.output.data[3], 0);

  // Auto-detect should agree with a uniform border.
  const detected = autoDetectBackground(makeTestImage());
  equal("Auto-detect finds white", `${detected.r},${detected.g},${detected.b}`, "255,255,255");

  /* -------------------------------------------------------------- patterns */
  const patternSvg = buildPatternSvg("dots", defaultPatternOptions);
  equal("Pattern emits an svg root", patternSvg.startsWith("<svg"), true);
  equal("Pattern is square", patternSvg.includes(`width="${defaultPatternOptions.size}"`), true);
  equal("Pattern includes background", patternSvg.includes(defaultPatternOptions.background), true);
  equal(
    "Every pattern renders non-empty markup",
    patterns.every((item) => buildPatternSvg(item.id, defaultPatternOptions).length > 120),
    true,
  );
  equal(
    "Pattern data URI is encoded",
    patternDataUri(patternSvg).startsWith('url("data:image/svg+xml,'),
    true,
  );
  equal(
    "Pattern data URI escapes angle brackets",
    patternDataUri(patternSvg).includes("<"),
    false,
  );

  /* ----------------------------------------------------------- dev tools */
  // Base64 must survive a UTF-8 round trip, including emoji.
  equal("Base64 encode ASCII", encodeBase64("Man"), "TWFu");
  equal("Base64 encode padding 1", encodeBase64("Ma"), "TWE=");
  equal("Base64 encode padding 2", encodeBase64("M"), "TQ==");
  equal("Base64 round trip unicode", decodeBase64(encodeBase64("héllo 🚀")), "héllo 🚀");
  equal("Base64 decode standard", decodeBase64("VG9vbHN0YWNr"), "Toolstack");
  // URL-safe alphabet swaps +/ for -_ and drops padding.
  // Standard alphabet yields "fn5+P35+fg=="; URL-safe swaps + → - and drops padding.
  equal("Base64 standard alphabet", encodeBase64("~~~?~~~"), "fn5+P35+fg==");
  equal("Base64 url-safe encode", encodeBase64("~~~?~~~", true), "fn5-P35-fg");
  equal("Base64 url-safe round trip", decodeBase64(encodeBase64("~~~?~~~", true)), "~~~?~~~");
  equal("Base64 decode restores padding", decodeBase64("TWE"), "Ma");
  equal("Base64 rejects bad characters", base64Decode("!!!!").error !== null, true);
  equal("Base64 rejects bad length", base64Decode("TWFuZ").error !== null, true);

  // URL encoding.
  equal("URL component escapes separators", urlEncode("a&b=c", "component").output, "a%26b%3Dc");
  equal(
    "URL full keeps structure",
    urlEncode("https://a.com/x y", "full").output,
    "https://a.com/x%20y",
  );
  equal("URL decode round trip", urlDecode(urlEncode("a&b=c").output).output, "a&b=c");
  equal("URL decode plus as space", urlDecode("a+b").output, "a b");
  equal("URL decode reports malformed", urlDecode("%zz").error !== null, true);

  // JSON analysis.
  equal("JSON valid detects object", analyzeJson('{"a":1}').valid, true);
  equal("JSON invalid detects trailing comma", analyzeJson('{"a":1,}').valid, false);
  equal("JSON counts nested keys", analyzeJson('{"a":{"b":{"c":1}}}').stats?.totalKeys, 3);
  equal("JSON measures depth", analyzeJson('{"a":{"b":{"c":1}}}').stats?.depth, 4);
  equal("JSON counts array length", analyzeJson("[1,2,3]").stats?.keys, 3);
  equal("JSON types counted", analyzeJson('{"s":"x","n":1,"b":true,"z":null}').stats?.nulls, 1);
  // A syntax error must report a usable line number.
  equal("JSON error reports a line", (analyzeJson('{\n  "a": 1,\n}').error?.line ?? 0) > 0, true);
  equal("JSON empty input is not valid", analyzeJson("   ").valid, false);
  // Key sorting is recursive and stable.
  equal(
    "JSON key sort is recursive",
    JSON.stringify(sortJsonKeys({ b: 1, a: { d: 2, c: 3 } })),
    '{"a":{"c":3,"d":2},"b":1}',
  );

  // Repeating.
  equal("Repeat with newline", repeatText("x", { times: 3 }), "x\nx\nx");
  equal("Repeat with separator", repeatText("x", { times: 3, separator: "-" }), "x-x-x");
  equal("Repeat numbered", repeatText("x", { times: 2, numbered: true }), "1. x\n2. x");
  equal("Repeat zero times", repeatText("x", { times: 0 }), "");

  /* -------------------------------------------------------------- report */
  const total = passed + failures.length;
  if (failures.length === 0) {
    console.info(`✅ Calculation self-test: ${passed}/${total} checks passed.`);
  } else {
    console.error(`❌ Calculation self-test: ${failures.length}/${total} checks FAILED.`);
    console.table(failures);
  }

  return { passed, failed: failures.length, failures };
}
