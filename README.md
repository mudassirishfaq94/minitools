<div align="center">

# 🧰 Toolstack

### All-in-One Mini Tools — 54 free utilities that run entirely in your browser

**No sign-up · No uploads · No tracking · No cost**

Converters · Calculators · Text Tools · Developer Tools · Generators · Image Tools

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)
[![Deploy](https://img.shields.io/badge/Deploy-GitHub%20Pages-blue?style=flat-square&logo=github-actions&logoColor=white)](https://github.com/mudassirishfaq94/minitools/actions)

**Designed & developed by [Mudassir Ishfaq](https://github.com/mudassirishfaq94)**

</div>

---

## 📖 Overview

The web is full of single-purpose tool sites: cluttered layouts, pop-up ads, trackers,
mandatory sign-ups, and a completely different interface every time. They solve a real
problem — you just wish they solved it better.

**Toolstack** takes that idea and applies product thinking to it. One coherent design
system, one instant search, one dark mode, and **54 tools that all behave the same way**.

Critically, **every tool runs client-side**. There is no backend, no API, and no upload
step. Your text, your numbers, your images and your passwords never leave your device.
That isn't just a privacy claim — it's why the tools are instant, and why they keep
working with no network connection once the page has loaded.

---

## ✨ Key Features

| | Feature | Description |
|:---:|---|---|
| 🔒 | **100% Client-Side** | No backend, no uploads, no analytics. Every computation uses standard Web APIs. |
| ⚡ | **Instant Results** | No submit buttons. Everything recalculates as you type. |
| 🔍 | **Smart Search** | Ranked, fuzzy search across names, keywords and categories with live highlighting. |
| ⌨️ | **Command Palette** | Press <kbd>⌘K</kbd> / <kbd>Ctrl+K</kbd> (or <kbd>/</kbd>) anywhere to jump to any tool. |
| 🌗 | **Light & Dark Mode** | Follows your OS, remembers your choice, zero flash on load. |
| ⭐ | **Favorites & History** | Star tools and revisit recents — saved locally, no account needed. |
| 📱 | **Truly Responsive** | Mobile-first layouts with no horizontal overflow at any breakpoint. |
| ♿ | **Accessible** | Keyboard navigation, ARIA labels, focus states, skip links, live regions. |
| 🚀 | **SEO-Ready** | Unique titles, meta descriptions, canonical URLs and JSON-LD per route. |
| 📦 | **Single-File Build** | Compiles to one self-contained HTML file. Deploy anywhere. |

---

## 🧰 Tool Catalog

### 🔄 Converters (14)

**Unit converters** — 8 categories, 49 units, all pivoting through a single base unit
so repeated conversions never accumulate error:

| Tool | Units |
|---|---|
| Length Converter | meter, kilometer, centimeter, millimeter, mile, yard, foot, inch |
| Weight Converter | kilogram, gram, milligram, pound, ounce, tonne |
| Temperature Converter | Celsius, Fahrenheit, Kelvin *(with absolute-zero validation)* |
| Area Converter | m², km², mi², acre, hectare, ft², in² |
| Volume Converter | liter, milliliter, m³, gallon, quart, pint, cup *(US customary)* |
| Speed Converter | km/h, mph, m/s, knots |
| Time Converter | second, minute, hour, day, week, month, year |
| Data Storage Converter | bit, byte, KB, MB, GB, TB, PB *(binary, 1 KB = 1024 B)* |

**Format converters** — Base64 Encoder · Base64 Decoder · URL Encoder · URL Decoder ·
Timestamp Converter · HEX/RGB Converter

### 🧮 Calculators (12)

Basic Calculator *(full keyboard support + history)* · Percentage Calculator ·
Discount Calculator *(stacked discounts multiply, not add)* · GST/VAT Calculator
*(add or remove tax)* · BMI Calculator *(metric & imperial)* · Loan Calculator ·
EMI Calculator *(full amortisation schedule)* · Compound Interest Calculator
*(with regular contributions)* · Tip Calculator · Split Bill Calculator
*(rounding remainders distributed so shares sum exactly)* · Age Calculator ·
Date Difference Calculator *(calendar-accurate across leap years)*

### 📝 Text Tools (9)

Word Counter · Character Counter *(with X/SMS/meta-tag limit gauges)* · Case Converter
*(10 cases)* · Text Cleaner *(HTML, emoji, accents, URLs, punctuation)* ·
Remove Extra Spaces · Text Sorter *(natural order — `item2` before `item10`)* ·
Duplicate Line Remover · Reverse Text *(emoji-safe)* · Text Repeater

### 💻 Developer Tools (4)

JSON Formatter *(format, validate, minify)* · JSON Validator *(exact line, column and
offset diagnostics with a caret)* · Regex Tester *(live matches, capture groups, flags,
replace)* · Hash Generator *(SHA-1/256/384/512 via Web Crypto)*

### ✨ Generators (11)

Password Generator *(real entropy estimate)* · UUID Generator *(v4)* · QR Code Generator
*(PNG/SVG export, Web Share)* · Pattern Background Generator *(14 seamless SVG patterns →
CSS/SVG/Tailwind)* · Lorem Ipsum Generator · Slug Generator · Random Number Generator ·
Random Name Picker · Coin Flip · Dice Roller *(d4–d100 with modifiers)* ·
Color Picker *(harmonies, scales, WCAG contrast)*

### 🖼️ Image Tools (4)

Image Compressor *(by quality or exact target file size)* · Image Converter
*(JPEG/PNG/WebP/AVIF with runtime capability detection)* · Image Resizer
*(pixels, percent or preset)* · Background Remover *(colour-key + solid, gradient or
custom image backgrounds)*

> **Note:** the Background Remover is a **colour-key** tool, not an AI matting model.
> It excels on uniform backgrounds — product shots, logos, scans, studio photography —
> but cannot separate a subject from a busy background. This is stated in the tool
> itself so nobody is misled.

---

## 🏗️ Architecture

```text
src/
├── components/
│   ├── ui/          Button · Card · Badge · Field · Segmented · CopyButton
│   │                EmptyState · Container · Icon registry
│   ├── layout/      Navbar (sticky) · Footer · Layout · Logo
│   ├── theme/       ThemeToggle
│   ├── search/      SearchDialog (⌘K command palette)
│   └── tools/       ToolCard · CategoryCard · ToolBrowser · ToolGrid · ToolFilters
│                    UnitConverter · CalculatorShell · TextToolShell
│                    RandomizerShell · ImageDropzone · BackgroundPicker
│                    FavoriteButton · HowToSection · FaqSection
├── pages/           Home · Tools · Category · Tool · Favorites · About · NotFound
├── tools/           Implementations grouped by domain + registry.ts
├── data/            catalog · categories · tools · units · toolContent
├── hooks/           useTheme · useHashRoute · useToolSearch · useUnitConverter
│                    useFavorites · useRecentTools · useImageUpload
│                    useGridKeyboardNav · useHotkey · useDebounce
├── utils/           units · finance · datetime · text · codec · color · image
│                    background · patterns · random · search · storage · seo
└── types/           Shared TypeScript contracts
```

### Design Principles

**1. Data is separate from UI.**
`src/data/` holds serialisable catalog and unit data with zero JSX.
`src/data/catalog.ts` is the single data-access layer every page reads from.

**2. One engine, many tools.**
All 8 unit converters render the *same* `UnitConverter` component driven by
`useUnitConverter`. Adding a converter means adding **unit data**, never conversion logic.
The same pattern applies to calculators, text tools and randomizers.

**3. Content is generated, not duplicated.**
How-to steps, FAQs and related-tool suggestions for all 54 pages come from **category
archetypes + tool metadata**. Only 9 tools carry targeted overrides where the generated
text would omit something important.

**4. Adding a tool is one entry.**
Add to `data/tools.ts`, map the component in `tools/registry.ts` — search, filtering,
routing, navigation, related tools, How-to, FAQ and SEO metadata all update automatically.

---

## ✅ Quality Assurance

This project ships with **two dev-only verification layers** that run automatically on
`npm run dev` and are tree-shaken out of production builds.

### Calculation Self-Test — 213 assertions

Every formula is asserted against **independently known values**, not snapshots of the
app's own output:

```
EMI 100k @10% / 12mo  → 8,791.59        Compound 10k @8% monthly 10y → 22,196.40
BMI 70kg / 1.75m      → 22.86           Black on white contrast      → exactly 21:1
−40 °C                → −40 °F          1 mile                       → 1.609344 km
Split 100 ÷ 3         → [33.34, 33.33, 33.33]  (sums to exactly 100)
```

> This layer caught a genuine bug: the calendar month-borrow algorithm returned
> **negative days** for `2024-01-31 → 2024-03-01`. It was replaced with a clamped-anchor
> algorithm, and the Age Calculator — which had the same flaw copied inline — was fixed too.

### Project Integrity Audit

Catches the failure modes that are **invisible in a screenshot**: a tool with catalog data
but no registered component silently vanishes; a mistyped icon name silently renders a
generic star. The audit asserts registry completeness, icon validity, route round-tripping,
category population, content generation and unit-data correctness.

---

## 🚀 Getting Started

**Requirements:** Node.js 20+

```bash
# Clone the repository
git clone https://github.com/mudassirishfaq94/minitools.git
cd minitools

# Install dependencies
npm install

# Start the dev server (with self-test + audit in console)
npm run dev

# Build for production
npm run build

# Preview the production build
npm run preview
```

### Deployment

The build uses `vite-plugin-singlefile`, producing **one self-contained
`dist/index.html`** with all CSS and JS inlined. Combined with hash routing, it works from
any static host or sub-path with zero server configuration — GitHub Pages, Netlify,
Vercel, S3, or even a USB stick.

A GitHub Actions workflow (`.github/workflows/deploy.yml`) builds and deploys to GitHub
Pages on every push to `main`. Enable it under **Settings → Pages → Source: GitHub Actions**.

---

## 🔐 Privacy

There is no privacy policy to read, because there is nothing to disclose:

- **No backend.** The app is static files. There is no server to send data to.
- **No analytics, no cookies, no fingerprinting.**
- **No uploads.** Images are decoded and processed with the Canvas API in your browser.
- **No account.** Favorites and history use `localStorage` and stay on your device.
- **Works offline** once loaded.

---

## ⚠️ Known Limitations

Stated openly rather than glossed over:

| Limitation | Detail |
|---|---|
| **Hash-route SEO** | Metadata is applied per route and works for social previews and JS-executing crawlers, but crawlers that don't run JavaScript see only the shell. Full indexing needs history routing + server rewrites + pre-rendering. |
| **Background Remover** | Colour-key, not AI. Excellent on uniform backgrounds, unable to handle cluttered ones. |
| **Animated GIFs** | Image tools keep only the first frame — Canvas has no multi-frame encoder. |
| **Bundle size** | ~199 KB gzipped in a single file. The single-file constraint rules out code-splitting. |

---

## 🛠️ Tech Stack

**React 19** · **TypeScript 5.9** · **Tailwind CSS v4** · **Vite 7** ·
**lucide-react** · **qrcode**

Browser APIs used: Web Crypto · Canvas & OffscreenCanvas · `createImageBitmap` ·
`TextEncoder`/`TextDecoder` · Clipboard · Web Share · `localStorage` · `Intl`

---

## 📄 License

Released under the [MIT License](LICENSE) — free to use, modify and distribute.

---

<div align="center">

### Built with ❤️ by **Mudassir Ishfaq**

If Toolstack saves you time, consider giving the repository a ⭐

[GitHub](https://github.com/mudassirishfaq94) · [Repository](https://github.com/mudassirishfaq94/minitools)

</div>
