import { useMemo, useState } from "react";
import { OptionGrid, OptionToggle, TextToolShell } from "@/components/tools/TextToolShell";
import { cleanWhitespace, type WhitespaceOptions } from "@/utils/text";
import { formatNumber } from "@/utils/format";

const SAMPLE = `This   sentence    has   too    many spaces.

	This line starts with a tab and ends with spaces.   


Three blank lines above this one.`;

const DEFAULTS: WhitespaceOptions = {
  collapseSpaces: true,
  trimLines: true,
  collapseBlankLines: true,
  removeBlankLines: false,
  removeTabs: false,
  removeAllSpaces: false,
  trimText: true,
};

export function RemoveSpaces() {
  const [input, setInput] = useState(SAMPLE);
  const [options, setOptions] = useState<WhitespaceOptions>(DEFAULTS);

  const set = <K extends keyof WhitespaceOptions>(key: K, value: WhitespaceOptions[K]) =>
    setOptions((current) => ({ ...current, [key]: value }));

  const output = useMemo(() => cleanWhitespace(input, options), [input, options]);
  const saved = Math.max(0, input.length - output.length);

  return (
    <TextToolShell
      input={input}
      onInputChange={setInput}
      output={output}
      sample={SAMPLE}
      outputLabel="Cleaned text"
      stats={[{ label: "Whitespace removed", value: formatNumber(saved) }]}
      message={
        options.removeAllSpaces
          ? {
              tone: "warning",
              text: "“Remove all spaces” overrides the other options and strips every space and tab.",
            }
          : null
      }
      note="Line breaks are always preserved unless you enable “Remove blank lines”. Collapsing blank lines reduces runs of three or more newlines down to a single blank line."
      options={
        <OptionGrid title="Whitespace options">
          <OptionToggle
            checked={Boolean(options.collapseSpaces)}
            onChange={(value) => set("collapseSpaces", value)}
            label="Collapse extra spaces"
            description="Multiple spaces → one space."
            />
          <OptionToggle
            checked={Boolean(options.trimLines)}
            onChange={(value) => set("trimLines", value)}
            label="Trim each line"
            description="Removes leading and trailing space."
          />
          <OptionToggle
            checked={Boolean(options.collapseBlankLines)}
            onChange={(value) => set("collapseBlankLines", value)}
            label="Collapse blank lines"
            description="Keeps at most one blank line."
          />
          <OptionToggle
            checked={Boolean(options.removeBlankLines)}
            onChange={(value) => set("removeBlankLines", value)}
            label="Remove blank lines"
            description="Deletes every empty line."
          />
          <OptionToggle
            checked={Boolean(options.removeTabs)}
            onChange={(value) => set("removeTabs", value)}
            label="Convert tabs to spaces"
          />
          <OptionToggle
            checked={Boolean(options.trimText)}
            onChange={(value) => set("trimText", value)}
            label="Trim whole text"
          />
          <OptionToggle
            checked={Boolean(options.removeAllSpaces)}
            onChange={(value) => set("removeAllSpaces", value)}
            label="Remove all spaces"
            description="Strips every space and tab."
          />
        </OptionGrid>
      }
    />
  );
}
