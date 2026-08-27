import { useMemo, useState } from "react";
import { OptionGrid, OptionToggle, TextToolShell } from "@/components/tools/TextToolShell";
import { Button } from "@/components/ui/Button";
import { cleanText, cleanWhitespace, type CleanOptions } from "@/utils/text";
import { formatNumber } from "@/utils/format";

const SAMPLE = `<p>Hello   <strong>world</strong>!</p>
Visit https://example.com or email us at hi@example.com 😀
Caf&eacute; — “smart quotes” and 12345 numbers…`;

const DEFAULTS: CleanOptions & { tidyWhitespace: boolean } = {
  stripHtml: true,
  normalizeQuotes: true,
  removeUrls: false,
  removeEmails: false,
  removeEmoji: false,
  removeAccents: false,
  removeNumbers: false,
  removePunctuation: false,
  lowercase: false,
  tidyWhitespace: true,
};

export function TextCleaner() {
  const [input, setInput] = useState(SAMPLE);
  const [options, setOptions] = useState(DEFAULTS);

  const set = <K extends keyof typeof options>(key: K, value: (typeof options)[K]) =>
    setOptions((current) => ({ ...current, [key]: value }));

  const output = useMemo(() => {
    let result = cleanText(input, options);
    if (options.tidyWhitespace) {
      result = cleanWhitespace(result, {
        collapseSpaces: true,
        trimLines: true,
        collapseBlankLines: true,
        trimText: true,
      });
    }
    return result;
  }, [input, options]);

  const removed = input.length - output.length;

  return (
    <TextToolShell
      input={input}
      onInputChange={setInput}
      output={output}
      sample={SAMPLE}
      outputLabel="Cleaned text"
      stats={[{ label: "Characters removed", value: formatNumber(Math.max(0, removed)) }]}
      note="Cleaning passes run in a fixed order: HTML → URLs/emails → quotes → accents → emoji → numbers → punctuation → whitespace. This keeps results predictable no matter which options you combine."
      options={
        <>
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">Cleaning options</h3>
            <div className="flex gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setOptions(DEFAULTS)}
              >
                Reset
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() =>
                  setOptions({
                    stripHtml: false,
                    normalizeQuotes: false,
                    removeUrls: false,
                    removeEmails: false,
                    removeEmoji: false,
                    removeAccents: false,
                    removeNumbers: false,
                    removePunctuation: false,
                    lowercase: false,
                    tidyWhitespace: false,
                  })
                }
              >
                None
              </Button>
            </div>
          </div>

          <OptionGrid>
            <OptionToggle
              checked={Boolean(options.stripHtml)}
              onChange={(value) => set("stripHtml", value)}
              label="Strip HTML tags"
              description="Removes markup and decodes entities."
            />
            <OptionToggle
              checked={Boolean(options.tidyWhitespace)}
              onChange={(value) => set("tidyWhitespace", value)}
              label="Tidy whitespace"
              description="Collapses spaces and blank lines."
            />
            <OptionToggle
              checked={Boolean(options.normalizeQuotes)}
              onChange={(value) => set("normalizeQuotes", value)}
              label="Normalise quotes"
              description="Curly quotes and dashes → ASCII."
            />
            <OptionToggle
              checked={Boolean(options.removeUrls)}
              onChange={(value) => set("removeUrls", value)}
              label="Remove URLs"
            />
            <OptionToggle
              checked={Boolean(options.removeEmails)}
              onChange={(value) => set("removeEmails", value)}
              label="Remove emails"
            />
            <OptionToggle
              checked={Boolean(options.removeEmoji)}
              onChange={(value) => set("removeEmoji", value)}
              label="Remove emoji"
            />
            <OptionToggle
              checked={Boolean(options.removeAccents)}
              onChange={(value) => set("removeAccents", value)}
              label="Remove accents"
              description="café → cafe"
            />
            <OptionToggle
              checked={Boolean(options.removeNumbers)}
              onChange={(value) => set("removeNumbers", value)}
              label="Remove numbers"
            />
            <OptionToggle
              checked={Boolean(options.removePunctuation)}
              onChange={(value) => set("removePunctuation", value)}
              label="Remove punctuation"
            />
            <OptionToggle
              checked={Boolean(options.lowercase)}
              onChange={(value) => set("lowercase", value)}
              label="Lowercase everything"
            />
          </OptionGrid>
        </>
      }
    />
  );
}
