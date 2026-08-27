# Changelog

Toolstack — designed and developed by **Mudassir Ishfaq**.

Work is tracked in parts. Each entry maps to one commit.

---

## Part 14 — Branding & documentation

**Commit:** `docs: professional README and author attribution`

- Footer now reads **"Built with ❤️ by Mudassir Ishfaq"** instead of listing the
  tech stack
- Added a "Created by" credit to the About page (the technical "Built with"
  stack list remains, since it is genuinely informative there)
- Rewrote `README.md` as full project documentation: feature matrix, complete
  tool catalog by category, architecture and design principles, QA layers,
  setup and deployment, privacy statement, and an explicit
  **Known Limitations** section

---

## Part 13 — Full project audit

**Commit:** `fix: resolve 9 issues found in full project audit`

Added `utils/audit.ts`, a dev-only integrity check that runs on boot and reports
unregistered tools, unknown icon names, broken routes, empty categories, missing
page content and invalid unit data. These fail *silently* in normal use, so they
are now asserted rather than eyeballed.

**Bugs found and fixed**

1. **Skip link broke navigation** — `href="#main-content"` was parsed by the hash
   router as the route `/main-content` and landed on the 404 page. Replaced with
   focus management that leaves the hash untouched.
2. **Duplicate React keys** — `resolveSlugs()` did not de-duplicate, so a tool that
   was both favorited and recently used rendered twice in the command palette,
   producing a console error. Now de-duplicates while preserving order.
3. **Mobile horizontal overflow** — the HEX/RGB Converter rendered six shade
   swatches with labelled copy buttons in a fixed six-column grid; on a 320px
   screen the labels overflowed the card. Now three columns on phones.
4. **Invalid nested interactive elements** — the Color Picker swatch nested a
   `role="button"` span inside a `<button>`, which is invalid HTML and breaks
   screen-reader navigation. The two controls are now siblings.
5. **Stacked scroll locks** — opening search from an open mobile menu applied two
   body-scroll locks that could unwind in the wrong order, leaving the page
   scrollable behind the overlay. Search now closes the menu first.
6. **Missing Clear/Reset controls** — Case Converter and Hash Generator had
   neither; HEX/RGB Converter, Percentage Calculator and Password Generator had
   no reset. Password Generator needed one most, since its options persist to
   `localStorage` with no other way back to defaults.
7. **Documentation inaccuracy** — the catalog holds **54** tools, not 55, and
   Converters is 14 rather than 15. UI counts are computed from data and were
   always correct; only the README and meta description were wrong.
8. **Dead code** — removed the unused `useMediaQuery` hook.
9. **Unnecessary re-renders** — `useRecordToolVisit` subscribed to the recents
   store when it only ever writes, re-rendering every tool page whenever history
   changed. It now writes directly via `recordToolVisit()`.

## Part 12 — Tool page content & SEO

**Commit:** `feat: generate how-to, FAQ and SEO metadata for every tool page`

- Every tool page now has: title, description, tool interface, intro paragraph,
  **How to use** (numbered steps), **FAQ** (accordion) and **Related tools**
- New `data/toolContent.ts` generates all supporting copy from **category
  archetypes + tool metadata**, so nothing is duplicated across 55 pages;
  per-tool overrides exist only where the generated text would miss something
  important (9 tools, e.g. password entropy, BMI caveats, JSON strictness)
- `relatedTools()` now scores automatically: same category, then shared
  keywords, then featured — surfacing cross-category matches and never empty
- New `utils/seo.ts` with per-route `<title>`, meta description, keywords,
  canonical link, Open Graph and Twitter cards
- Added JSON-LD structured data: `WebApplication`, `BreadcrumbList`, `HowTo`
  and `FAQPage` per tool; `CollectionPage` and `WebSite` elsewhere
- New accessible `HowToSection` and `FaqSection` components; FAQ answers stay
  in the DOM while collapsed so in-page search and crawlers can read them
- Self-test extended to 213 assertions, verifying all 55 tools produce complete
  content, no duplicate FAQ questions, unique descriptions under 160 characters,
  and related lists that never self-reference

## Part 11 — Local user features (favorites & history)

**Commit:** `feat: add localStorage favorites and recently used tools`

- Added **favorite/unfavorite** on every tool card and tool page header
- Added **/favorites** page with both a Favorites grid and a Recently used list,
  each with its own empty state and clear action
- Added **recently used** tracking: de-duplicated by slug, capped at 12 entries,
  storing last-visit time and a visit counter
- New `utils/storage.ts` — a subscribable persistent store so favorites toggled
  in one component immediately update the navbar badge, homepage and palette
- New reusable hooks `useFavorites`, `useRecentTools` and `useRecordToolVisit`,
  built on `useSyncExternalStore`
- New reusable `FavoriteButton` (icon and labelled variants) and `PersonalSection`
- Navbar gains a star link with a live count badge; footer gains a Favorites link
- Command palette now surfaces your own tools before the default popular list
- Cross-tab sync via the `storage` event; corrupt or stale data is sanitised on
  load, and slugs for removed tools are pruned automatically
- Self-test extended to 199 assertions covering de-duplication, capping,
  subscriber notification and corrupt-JSON recovery
- No login, no account, no server — everything stays in the browser

## Part 10 — Background remover & pattern generator

**Commit:** `feat: add background remover with fill options and SVG pattern generator`

- Added **Background Remover** — colour-key cut-out with auto-detection from the
  image corners, eyedropper sampling, tolerance, edge softness, halo trim, and
  contiguous vs global matching
- Backgrounds can be replaced with **transparent, a solid colour, a linear/radial
  gradient (2–4 stops, adjustable angle) or a custom uploaded image** (cover /
  contain / stretch)
- Added **Pattern Background Generator** — 14 seamless SVG patterns with colour,
  tile size, thickness, opacity and rotation controls; exports as CSS, raw SVG,
  Tailwind utilities, PNG or SVG file
- New `utils/background.ts` (keying, flood fill, gradient/image compositing) and
  `utils/patterns.ts` (SVG tile generation, data URIs, rasterisation)
- New reusable `BackgroundPicker` component, shared by any tool that composites
- Preview renders at up to 1400px for responsiveness; downloads export at the
  original resolution
- Self-test extended to 186 assertions, including a synthetic keying fixture that
  verifies contiguous mode preserves enclosed regions of the key colour
- Tool count: 53 → 55

## Part 9 — Image tools

**Commit:** `feat: add image compressor, converter and resizer (fully client-side)`

- Added **Image Compressor** (quality slider or binary search to an exact target
  file size), **Image Converter** (JPEG/PNG/WebP/AVIF with runtime capability
  probing) and **Image Resizer** (pixels, percent or preset, aspect-ratio lock)
- New `utils/image.ts`: validation, decoding, stepped downscaling, encoding,
  format detection and geometry helpers — all Canvas/`createImageBitmap` based
- New shared `ImageDropzone` (drag-drop, click, paste), `ComparePreview` and
  `useImageUpload` hook that releases object URLs and `ImageBitmap`s on unmount
- **No uploads** — every operation runs locally; there is no server component
- Stepped halving on large downscales avoids the aliasing a single-pass
  `drawImage` produces when shrinking more than ~2×
- Encoders are probed at runtime so unsupported formats are disabled rather
  than silently falling back to PNG
- SVG inputs fall back to `<img>` rasterisation, which Chromium requires
- Image Tools category is no longer "coming soon"
- Self-test extended to 165 assertions
- Tool count: 50 → 53

## Part 8 — Generators, randomizers and colour tools

**Commit:** `feat: add QR generator, randomizers and colour picker`

- Added **QR Code Generator** using the `qrcode` library — real scannable output,
  PNG/SVG download, Web Share API support, adjustable size, quiet zone, colours and
  error-correction level, plus URL/email/Wi-Fi/vCard presets
- Added **Random Number Generator**, **Random Name Picker**, **Coin Flip** and
  **Dice Roller**, all sharing a new `RandomizerShell` + `HistoryPanel`
- Added **Color Picker** with HSL channel sliders, six harmony types, a 50–900
  tint/shade scale, savable palette and live WCAG contrast checking
- Renamed the existing Color Converter to **HEX / RGB Converter** for discoverability
- Extended `utils/random.ts` with `secureRandomInt` (rejection sampling — no modulo
  bias), `shuffle`, `pickMany`, `uniqueIntegers`, `rollDice`, `flipCoins`
- Extended `utils/color.ts` with `contrastRatio`, `checkContrast`, `buildHarmony`,
  `buildScale`, `colorFormats`
- Self-test extended to 152 assertions covering randomness bounds, uniqueness,
  shuffle immutability, dice/coin ranges and WCAG reference ratios (black on white = 21:1)
- Tool count: 43 → 50

## Part 7 — Developer tools

**Commit:** `feat: add JSON Validator, split encoder/decoder tools, shared codec engine`

- Added **JSON Validator** with line/column/offset diagnostics, a caret pointing at
  the failure, and recursive structure stats (depth, total keys, type counts)
- Split Base64 and URL into separate **Encoder** and **Decoder** catalog entries;
  both reuse one component via a `defaultMode` prop — no duplicated logic
- New `utils/codec.ts`: UTF-8 safe Base64 (URL-safe alphabet, padding recovery,
  `fatal` UTF-8 decoding), URL encode/decode with `+`→space, `analyzeJson`, `sortJsonKeys`
- Base64 errors now explain the cause (invalid characters, bad length, misplaced
  padding, non-UTF-8 bytes) instead of a generic message
- URL Decoder shows a live breakdown of protocol, host, path and query parameters
- Added missing **Reset** buttons to JSON Formatter, Regex Tester, UUID Generator
  and Timestamp Converter
- Self-test extended to 118 assertions; caught a wrong URL-safe Base64 expectation
  (`fn5+P35+fg` should be `fn5-P35-fg`)
- Tool count: 40 → 43

## Part 6 — Text tools

**Commit:** `feat: add 7 text tools on a shared TextToolShell`

- Added Character Counter, Text Cleaner, Remove Extra Spaces, Text Sorter,
  Duplicate Line Remover, Reverse Text and Text Repeater
- Word Counter, Case Converter, Lorem Ipsum and Password Generator already shipped
- New reusable `TextToolShell` (input/output panes, sample, clear, copy, reuse,
  live counters) plus `OptionToggle` and `OptionGrid`
- Extended `utils/text.ts` with pure transforms: `sortLines`, `removeDuplicateLines`,
  `cleanWhitespace`, `cleanText`, `reverseText`, `repeatText`
- Character Counter tracks platform limits (X, SMS, meta tags) and counts
  grapheme clusters so emoji count as one visible unit
- Text Repeater caps output at 500k characters to keep the page responsive
- Extended the self-test to 90 assertions covering every text transform
- Tool count: 33 → 40

## Part 5 — Calculator tools

**Commit:** `feat: add 10 calculators with a shared, self-tested formula engine`

- Added Basic, Discount, GST/VAT, BMI, Loan, EMI, Compound Interest, Tip,
  Split Bill and Date Difference calculators
- New pure engines: `utils/finance.ts` (loans, amortisation, compounding, tax,
  tip, split, BMI) and `utils/datetime.ts` (calendar arithmetic)
- New reusable UI: `NumberField` with shared `validateNumber()`, `CalculatorShell`,
  `PrimaryResult`, `ResultBreakdown`
- Consolidated numeric parsing into `utils/number.ts`; the unit engine now
  delegates to it instead of duplicating the regex
- **Bug fix:** calendar month-borrow returned negative days for cases such as
  `2024-01-31 → 2024-03-01`. Replaced with a clamped-anchor algorithm and
  updated the Age Calculator to use it
- Added `utils/selftest.ts`: 45 dev-only assertions against independently known
  values, tree-shaken from production builds
- Tool count: 23 → 33

## Part 4 — Converter tools

**Commit:** `feat: add 8 working unit converters on a shared conversion engine`

- Added Length, Weight, Temperature, Area, Volume, Speed, Time and Data Storage converters
- Built one reusable `UnitConverter` component — all 8 tools are thin bindings with zero
  per-tool conversion logic
- Added `validateUnitInput()` to the engine: numeric validation, magnitude limits,
  absolute-zero floors, and neutral handling of in-progress input (`-`, `1.`, `2e-`)
- Extended `useUnitConverter` with `error`, `warning`, `isEmpty`, `clear()` and
  `formattedWithSymbol`
- Each converter ships From/To selectors, swap, instant results, clear/reset, copy,
  an all-units table and a responsive mobile layout
- `CopyButton` gained an accessible `iconOnly` mode
- Tool count: 15 → 23

## Part 3 — Reusable components and data layer

**Commit:** `refactor: extract catalog data layer and reusable ToolBrowser`

- Added `src/data/catalog.ts` as the single data-access layer
  (`availableTools`, `featuredTools`, `countsForQuery`, `groupToolsByCategory`, …)
- Extracted `ToolBrowser`, `CategorySectionHeader` and `NoToolsFound` components
- Reduced `ToolsPage` and `CategoryPage` to thin compositions so both behave identically
- `tools/registry.ts` is now used only for component resolution
- Command palette reads from the catalog, so it can never surface an unimplemented tool

## Part 2 — Centralized tool data system

**Commit:** `feat: centralize tool data, add category filtering and unit data`

- Reorganised the catalog into 6 categories: Converters, Calculators, Text Tools,
  Developer Tools, Generators, Image Tools
- Every tool now carries `name`, `slug`, `description`, `category`, `icon`, `route`,
  with routes derived by `defineTool()`
- All Tools page with instant search, category filtering, live per-category counts,
  grouped browse view and a "No tools found" state
- Keyboard navigation: arrow keys, `Home`/`End`, `Enter`/`↓` into results, `Esc` to clear
- Added the unit conversion system: `data/units.ts` (8 categories, 49 units) and
  `utils/units.ts` (pure conversion, formatting and formula helpers)
- Added `useUnitConverter` headless hook

## Part 1 — Foundation

**Commit:** `feat: scaffold design system, layout and 15 working tools`

- Design system on Tailwind v4 tokens: brand ramp, shadows, animations, custom utilities
- Sticky blur navbar, mobile drawer, footer, responsive layout, no horizontal overflow
- Light/dark mode with OS sync, persistence and no flash of the wrong theme
- Hash router, homepage, tool/category/about/404 pages
- `⌘K` command palette with ranked search and keyboard navigation
- Reusable `ToolCard` and `CategoryCard`, plus 15 fully working tools
