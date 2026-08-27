import type { ComponentType } from "react";
import { toolMetas } from "@/data/tools";
import type { ToolCategoryId, ToolDefinition } from "@/types";

import { WordCounter } from "@/tools/text/WordCounter";
import { CaseConverter } from "@/tools/text/CaseConverter";
import { CharacterCounter } from "@/tools/text/CharacterCounter";
import { TextCleaner } from "@/tools/text/TextCleaner";
import { RemoveSpaces } from "@/tools/text/RemoveSpaces";
import { TextSorter } from "@/tools/text/TextSorter";
import { DuplicateRemover } from "@/tools/text/DuplicateRemover";
import { ReverseText } from "@/tools/text/ReverseText";
import { TextRepeater } from "@/tools/text/TextRepeater";
import { LoremIpsum } from "@/tools/text/LoremIpsum";
import { SlugGenerator } from "@/tools/text/SlugGenerator";
import { JsonFormatter } from "@/tools/developer/JsonFormatter";
import { RegexTester } from "@/tools/developer/RegexTester";
import { TimestampConverter } from "@/tools/developer/TimestampConverter";
import { UuidGenerator } from "@/tools/developer/UuidGenerator";
import { Base64Decoder, Base64Encoder } from "@/tools/encoding/Base64Encoder";
import { UrlDecoder, UrlEncoder } from "@/tools/encoding/UrlEncoder";
import { JsonValidator } from "@/tools/developer/JsonValidator";
import { PasswordGenerator } from "@/tools/security/PasswordGenerator";
import { HashGenerator } from "@/tools/security/HashGenerator";
import { ColorConverter } from "@/tools/design/ColorConverter";
import { ColorPicker } from "@/tools/design/ColorPicker";
import { QrCodeGenerator } from "@/tools/generators/QrCodeGenerator";
import { BackgroundRemover } from "@/tools/image/BackgroundRemover";
import { PatternGenerator } from "@/tools/generators/PatternGenerator";
import { ImageCompressor } from "@/tools/image/ImageCompressor";
import { ImageConverter } from "@/tools/image/ImageConverter";
import { ImageResizer } from "@/tools/image/ImageResizer";
import { RandomNumberGenerator } from "@/tools/generators/RandomNumberGenerator";
import { RandomNamePicker } from "@/tools/generators/RandomNamePicker";
import { CoinFlip } from "@/tools/generators/CoinFlip";
import { DiceRoller } from "@/tools/generators/DiceRoller";
import { PercentageCalculator } from "@/tools/math/PercentageCalculator";
import { AgeCalculator } from "@/tools/math/AgeCalculator";
import {
  AreaConverter,
  DataStorageConverter,
  LengthConverter,
  SpeedConverter,
  TemperatureConverter,
  TimeConverter,
  VolumeConverter,
  WeightConverter,
} from "@/tools/converters";
import { BasicCalculator } from "@/tools/calculators/BasicCalculator";
import { BmiCalculator } from "@/tools/calculators/BmiCalculator";
import { CompoundInterestCalculator } from "@/tools/calculators/CompoundInterestCalculator";
import { DateDifferenceCalculator } from "@/tools/calculators/DateDifferenceCalculator";
import { DiscountCalculator } from "@/tools/calculators/DiscountCalculator";
import { EmiCalculator } from "@/tools/calculators/EmiCalculator";
import { GstCalculator } from "@/tools/calculators/GstCalculator";
import { LoanCalculator } from "@/tools/calculators/LoanCalculator";
import { SplitBillCalculator } from "@/tools/calculators/SplitBillCalculator";
import { TipCalculator } from "@/tools/calculators/TipCalculator";

/** Implementation lookup keyed by tool id. */
const components: Record<string, ComponentType> = {
  "length-converter": LengthConverter,
  "weight-converter": WeightConverter,
  "temperature-converter": TemperatureConverter,
  "area-converter": AreaConverter,
  "volume-converter": VolumeConverter,
  "speed-converter": SpeedConverter,
  "time-converter": TimeConverter,
  "data-storage-converter": DataStorageConverter,
  "basic-calculator": BasicCalculator,
  "discount-calculator": DiscountCalculator,
  "gst-calculator": GstCalculator,
  "bmi-calculator": BmiCalculator,
  "loan-calculator": LoanCalculator,
  "emi-calculator": EmiCalculator,
  "compound-interest-calculator": CompoundInterestCalculator,
  "tip-calculator": TipCalculator,
  "split-bill-calculator": SplitBillCalculator,
  "date-difference-calculator": DateDifferenceCalculator,
  "word-counter": WordCounter,
  "character-counter": CharacterCounter,
  "text-cleaner": TextCleaner,
  "remove-spaces": RemoveSpaces,
  "text-sorter": TextSorter,
  "duplicate-remover": DuplicateRemover,
  "reverse-text": ReverseText,
  "text-repeater": TextRepeater,
  "case-converter": CaseConverter,
  "lorem-ipsum": LoremIpsum,
  "slug-generator": SlugGenerator,
  "json-formatter": JsonFormatter,
  "regex-tester": RegexTester,
  "timestamp-converter": TimestampConverter,
  "uuid-generator": UuidGenerator,
  "base64-encoder": Base64Encoder,
  "base64-decoder": Base64Decoder,
  "url-encoder": UrlEncoder,
  "url-decoder": UrlDecoder,
  "json-validator": JsonValidator,
  "password-generator": PasswordGenerator,
  "hash-generator": HashGenerator,
  "color-converter": ColorConverter,
  "color-picker": ColorPicker,
  "qr-code-generator": QrCodeGenerator,
  "background-remover": BackgroundRemover,
  "pattern-generator": PatternGenerator,
  "image-compressor": ImageCompressor,
  "image-converter": ImageConverter,
  "image-resizer": ImageResizer,
  "random-number-generator": RandomNumberGenerator,
  "random-name-picker": RandomNamePicker,
  "coin-flip": CoinFlip,
  "dice-roller": DiceRoller,
  "percentage-calculator": PercentageCalculator,
  "age-calculator": AgeCalculator,
};

export const tools: ToolDefinition[] = toolMetas
  .filter((meta) => Boolean(components[meta.id]))
  .map((meta) => ({ ...meta, component: components[meta.id] }));

export function getTool(slug: string): ToolDefinition | undefined {
  return tools.find((tool) => tool.slug === slug);
}

export function toolsByCategory(category: ToolCategoryId | string): ToolDefinition[] {
  return tools.filter((tool) => tool.category === category);
}

export const toolCountByCategory: Record<string, number> = tools.reduce<Record<string, number>>(
  (counts, tool) => {
    counts[tool.category] = (counts[tool.category] ?? 0) + 1;
    return counts;
  },
  {},
);

export const featuredTools = tools.filter((tool) => tool.featured);
