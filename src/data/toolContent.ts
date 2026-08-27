import { categoryLabel, getCategory } from "@/data/categories";
import type { ToolCategoryId, ToolMeta } from "@/types";

/**
 * Tool page content, generated from catalog data.
 *
 * Rather than authoring a How-to and FAQ for all 55 tools by hand, content is
 * derived from the tool's category archetype and its own metadata. Individual
 * tools can override any part where the generated text would be too generic —
 * so specifics live in one small map instead of being copied across pages.
 */

export interface HowToStep {
  title: string;
  body: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

interface Archetype {
  /** Verb phrase describing what the tool does, e.g. "convert units". */
  action: string;
  steps: (tool: ToolMeta) => HowToStep[];
  faqs: (tool: ToolMeta) => FaqItem[];
}

/* ---------------------------------------------------------- archetypes */

const archetypes: Record<ToolCategoryId, Archetype> = {
  converters: {
    action: "convert values between formats",
    steps: (tool) => [
      {
        title: "Enter your value",
        body: `Type or paste the value you want to convert into the input field. ${tool.name} accepts decimals and thousands separators, and validates as you type.`,
      },
      {
        title: "Choose the units or formats",
        body: "Pick what you are converting from and what you want to convert to. Use the swap button to reverse the direction without retyping anything.",
      },
      {
        title: "Read the result instantly",
        body: "The conversion updates on every keystroke — there is no submit button. The exact formula and conversion ratio are shown alongside the result.",
      },
      {
        title: "Copy or reset",
        body: "Use the copy button to put the result on your clipboard, or reset to return to the default values and start again.",
      },
    ],
    faqs: (tool) => [
      {
        question: `How accurate is ${tool.name}?`,
        answer:
          "Conversions use exact published factors rather than rounded approximations, and every value pivots through a single base unit so repeated conversions do not accumulate error. Results are displayed to the precision that is meaningful for the measurement.",
      },
      {
        question: "Can I convert in the opposite direction?",
        answer:
          "Yes. The swap button reverses the source and target instantly while keeping your entered value, so you can check a conversion both ways without retyping.",
      },
    ],
  },

  calculators: {
    action: "run calculations",
    steps: (tool) => [
      {
        title: "Fill in the input fields",
        body: `Enter the figures ${tool.name} needs. Each field is validated on its own, so you will see a clear message if a value is missing, negative where it should not be, or out of range.`,
      },
      {
        title: "Adjust the options",
        body: "Switch modes, units or frequencies where the calculator offers them. Preset chips under each field fill in common values with one tap.",
      },
      {
        title: "Read the result and breakdown",
        body: "The headline figure updates live as you type. Below it, a breakdown shows how the result was reached so you can check the working rather than trusting a single number.",
      },
      {
        title: "Copy the figures you need",
        body: "Copy the main result or any individual line from the breakdown. Reset restores the default inputs at any point.",
      },
    ],
    faqs: (tool) => [
      {
        question: `Is ${tool.name} accurate?`,
        answer:
          "The formula used is shown on the page so you can verify it. Calculations are performed with standard floating-point arithmetic and rounded only at the display stage, so intermediate precision is never lost.",
      },
      {
        question: "Are my figures saved anywhere?",
        answer:
          "No. Everything you type stays in the page and is discarded when you close the tab. Nothing is transmitted, logged or stored on a server.",
      },
    ],
  },

  text: {
    action: "transform text",
    steps: (tool) => [
      {
        title: "Paste or type your text",
        body: `Drop your content into the input panel. ${tool.name} handles long documents, and you can load a sample first if you want to see how it behaves.`,
      },
      {
        title: "Set the options",
        body: "Toggle the options to control exactly how the text is processed. Every change re-runs immediately so you can see the effect of each setting.",
      },
      {
        title: "Check the live output",
        body: "The result appears beside your input with live character, word and line counts for both, making it easy to see exactly what changed.",
      },
      {
        title: "Copy or chain the result",
        body: "Copy the output with one click, or use the reuse button to feed it straight back into the input and apply another transformation.",
      },
    ],
    faqs: (tool) => [
      {
        question: "Is there a limit on how much text I can process?",
        answer:
          "There is no fixed limit. Processing happens in your browser, so the practical ceiling is your device's memory — documents of several hundred thousand characters are handled comfortably.",
      },
      {
        question: `Does ${tool.name} handle emoji and accented characters?`,
        answer:
          "Yes. Text is processed as Unicode throughout, so accented letters, non-Latin scripts and multi-codepoint emoji are preserved correctly rather than being split or mangled.",
      },
    ],
  },

  developer: {
    action: "inspect and debug data",
    steps: (tool) => [
      {
        title: "Paste your input",
        body: `Drop the data you are working with into the input panel. ${tool.name} parses it as you type, so you get feedback immediately.`,
      },
      {
        title: "Configure the options",
        body: "Adjust the settings to match what you need — indentation, flags, algorithms or output format, depending on the tool.",
      },
      {
        title: "Review the output and any errors",
        body: "Valid input produces formatted output straight away. If something is wrong, you get the precise reason and location rather than a generic failure message.",
      },
      {
        title: "Copy the result",
        body: "Copy the output to your clipboard, or reset to clear the workspace and start from the sample again.",
      },
    ],
    faqs: (tool) => [
      {
        question: "Is it safe to paste sensitive data here?",
        answer:
          "The tool runs entirely in your browser with no network requests, so pasted data never leaves your machine. That said, treat any browser tab with normal caution and avoid pasting production secrets into pages you have not audited.",
      },
      {
        question: `Which standard does ${tool.name} follow?`,
        answer:
          "It uses your browser's native implementation rather than a reimplementation, so behaviour matches exactly what your JavaScript runtime does with the same input.",
      },
    ],
  },

  generators: {
    action: "generate data",
    steps: (tool) => [
      {
        title: "Set your options",
        body: `Configure ${tool.name} to match what you need — length, quantity, character sets, colours or formatting, depending on the generator.`,
      },
      {
        title: "Generate",
        body: "Press the generate button to produce a result. You can run it as many times as you like; each run is independent.",
      },
      {
        title: "Review the output",
        body: "Results appear immediately along with any relevant statistics. Where it applies, a history panel keeps your recent results so you can compare them.",
      },
      {
        title: "Copy or download",
        body: "Copy individual results or the whole batch. Some generators also export directly as a file.",
      },
    ],
    faqs: () => [
      {
        question: "How random are the results?",
        answer:
          "Randomness comes from the Web Crypto API using rejection sampling, not from Math.random(). That matters: scaling a random number with a plain modulo subtly biases the result towards lower values, which rejection sampling avoids entirely.",
      },
      {
        question: "Is anything I generate sent to a server?",
        answer:
          "No. Generation happens locally in your browser and results are never transmitted or logged, which is why this is safe to use for passwords and keys.",
      },
    ],
  },

  image: {
    action: "process images",
    steps: (tool) => [
      {
        title: "Add your image",
        body: "Drag an image onto the upload area, click to browse, or paste one straight from your clipboard. JPEG, PNG, WebP, AVIF, GIF, BMP and SVG are all accepted.",
      },
      {
        title: "Adjust the settings",
        body: `Use the controls to configure how ${tool.name} processes the image. The preview updates as you change them, so you can judge the result before committing.`,
      },
      {
        title: "Compare before and after",
        body: "The original and processed versions are shown side by side, with file sizes and dimensions so you can see exactly what changed.",
      },
      {
        title: "Download the result",
        body: "Download the processed image at full resolution. The preview is rendered at a reduced size for speed, but the export always uses the original dimensions.",
      },
    ],
    faqs: () => [
      {
        question: "Are my images uploaded to a server?",
        answer:
          "No. Images are decoded and processed with the Canvas API inside your browser. There is no upload step and no server component, so your photos never leave your device.",
      },
      {
        question: "What file size can I work with?",
        answer:
          "Files up to 30 MB and roughly 40 megapixels are supported. The limit exists to keep the page responsive — larger files would risk freezing the tab rather than failing cleanly.",
      },
    ],
  },
};

/* ------------------------------------------------- shared FAQ entries */

/** Questions that genuinely apply to every tool on the site. */
function universalFaqs(tool: ToolMeta): FaqItem[] {
  return [
    {
      question: `Is ${tool.name} free to use?`,
      answer:
        "Yes, completely. There is no account, no sign-up, no usage cap and no paid tier. Every tool on the site is free and always will be.",
    },
    {
      question: "Do I need to install anything?",
      answer:
        "No. It runs in any modern browser on desktop, tablet and phone. There is nothing to download and no extension to add.",
    },
  ];
}

/* --------------------------------------------------- per-tool overrides */

interface ToolOverride {
  /** Replaces the generated intro sentence. */
  intro?: string;
  /** Appended after the generated steps. */
  extraSteps?: HowToStep[];
  /** Prepended before the generated FAQs — the most tool-specific answers. */
  faqs?: FaqItem[];
}

/**
 * Only tools whose generated content would miss something important are
 * listed here. Everything else is fully derived from its category.
 */
const overrides: Record<string, ToolOverride> = {
  "password-generator": {
    faqs: [
      {
        question: "Are the passwords really secure?",
        answer:
          "Each character is drawn from crypto.getRandomValues() with rejection sampling to keep the distribution uniform. Passwords are generated on your device, never transmitted, and never stored — not even in your browser history.",
      },
      {
        question: "What length should I choose?",
        answer:
          "For most accounts, 16 characters with mixed character types is comfortably strong. The entropy readout tells you how many bits of randomness you actually have; above 75 bits is considered strong against offline attacks.",
      },
    ],
  },
  "background-remover": {
    faqs: [
      {
        question: "Does this use AI to remove backgrounds?",
        answer:
          "No, and it is worth being clear about that. This is a colour-key remover: it makes pixels matching a chosen background colour transparent. It works excellently on uniform backgrounds such as product shots, logos, scans and studio photography, but it cannot separate a subject from a busy or detailed background the way a machine-learning matting model can.",
      },
      {
        question: "Why is there a fringe around my subject?",
        answer:
          "Anti-aliased edges in the original blend the subject with the old background, leaving a thin halo. Raise the edge softness for a smoother transition, or use the trim control to erode the edge by a pixel or two.",
      },
    ],
  },
  "json-formatter": {
    faqs: [
      {
        question: "Why is my JSON rejected when my editor accepts it?",
        answer:
          "Strict JSON does not allow trailing commas, comments, single-quoted strings or unquoted keys, even though many editors and JavaScript itself tolerate them. The validator follows the specification exactly, which is usually what you want before sending data to an API.",
      },
    ],
  },
  "regex-tester": {
    faqs: [
      {
        question: "Which regex flavour is used?",
        answer:
          "JavaScript's native RegExp engine, so behaviour matches exactly what you will get in Node or the browser. Patterns written for PCRE, Python or Go may need small adjustments — lookbehind and named groups are supported in modern browsers.",
      },
    ],
  },
  "qr-code-generator": {
    faqs: [
      {
        question: "Will my QR code still scan if I change the colours?",
        answer:
          "Usually, provided there is strong contrast between the foreground and background, and the foreground stays darker. Very light foregrounds or low-contrast pairs will fail on many scanners. Keep the quiet zone at two modules or more.",
      },
      {
        question: "Which error correction level should I pick?",
        answer:
          "Medium suits most uses. Choose a higher level if the code will be printed small, placed on a curved surface, or partially covered by a logo — higher levels recover more damage but make the pattern denser.",
      },
    ],
  },
  "image-compressor": {
    faqs: [
      {
        question: "Why did my file get bigger after compressing?",
        answer:
          "The source was probably already well optimised, or you converted a flat graphic to a lossy format. When this happens the tool tells you rather than quietly returning a worse file — lower the quality, try WebP, or keep the original.",
      },
    ],
  },
  "bmi-calculator": {
    faqs: [
      {
        question: "Is BMI a reliable measure of health?",
        answer:
          "It is a population-level screening figure, not a diagnosis. BMI does not distinguish muscle from fat and can misclassify athletes, older adults, pregnant people and children. Treat it as one rough indicator and speak to a clinician for anything meaningful.",
      },
    ],
  },
  "hash-generator": {
    faqs: [
      {
        question: "Can I use this to hash passwords?",
        answer:
          "No. SHA-family hashes are far too fast for password storage. Use a purpose-built algorithm such as bcrypt, scrypt or Argon2 with a per-user salt. These hashes are for checksums, integrity verification and content addressing.",
      },
    ],
  },
  "date-difference-calculator": {
    faqs: [
      {
        question: "How are months counted?",
        answer:
          "Calendar-accurately. The calculation anchors forward whole months from the start date, clamping to real month lengths, then measures the remaining days. Leap years and short months are handled correctly, so 31 January to 1 March returns one month and one day.",
      },
    ],
  },
};

/* ------------------------------------------------------------ builders */

/** Ordered how-to steps for a tool. */
export function buildHowTo(tool: ToolMeta): HowToStep[] {
  const archetype = archetypes[tool.category];
  const override = overrides[tool.id];
  return [...archetype.steps(tool), ...(override?.extraSteps ?? [])];
}

/**
 * FAQ entries for a tool: the most specific answers first, then the
 * category archetype, then the questions that apply site-wide.
 */
export function buildFaqs(tool: ToolMeta): FaqItem[] {
  const archetype = archetypes[tool.category];
  const override = overrides[tool.id];

  const items = [
    ...(override?.faqs ?? []),
    ...archetype.faqs(tool),
    ...universalFaqs(tool),
  ];

  // Guard against a duplicate question if an override repeats a generated one.
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.question.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** One-paragraph intro shown under the tool interface. */
export function buildIntro(tool: ToolMeta): string {
  const override = overrides[tool.id];
  if (override?.intro) return override.intro;

  const category = getCategory(tool.category);
  const archetype = archetypes[tool.category];
  return `${tool.name} is a free, browser-based tool to ${archetype.action}. It sits in the ${categoryLabel(
    tool.category,
  )} collection${
    category ? ` — ${category.tagline.toLowerCase()}` : ""
  }. Everything runs locally on your device, with no account and no uploads.`;
}

/** Search-engine description, kept within the length engines display. */
export function buildMetaDescription(tool: ToolMeta): string {
  return `${tool.description} Free ${categoryLabel(
    tool.category,
  ).toLowerCase()} that runs entirely in your browser — no sign-up, no uploads.`;
}
