import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input, Switch } from "@/components/ui/Field";
import { Segmented } from "@/components/ui/Segmented";
import { ResultPanel } from "@/components/tools/ResultPanel";
import { StatTile } from "@/components/tools/StatTile";
import { slugify } from "@/utils/text";
import { formatNumber } from "@/utils/format";
import type { SegmentedOption } from "@/components/ui/Segmented";

type Separator = "-" | "_" | "." | "";

const separators: SegmentedOption<Separator>[] = [
  { value: "-", label: "hyphen" },
  { value: "_", label: "underscore" },
  { value: ".", label: "dot" },
  { value: "", label: "none" },
];

export function SlugGenerator() {
  const [text, setText] = useState("Build a Modern Mini Tools Website");
  const [separator, setSeparator] = useState<Separator>("-");
  const [lowercase, setLowercase] = useState(true);

  const slug = useMemo(
    () => slugify(text, { separator, lowercase }),
    [text, separator, lowercase],
  );

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card className="space-y-4">
        <Input
          label="Text to slugify"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="e.g. My Next Blog Post Title"
        />

        <div className="space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Separator
          </span>
          <Segmented
            options={separators}
            value={separator}
            onChange={setSeparator}
            size="sm"
            aria-label="Slug separator"
          />
        </div>

        <Switch
          checked={lowercase}
          onChange={setLowercase}
          label="Lowercase output"
          description="Recommended for URLs and SEO-friendly permalinks."
        />
      </Card>

      <div className="space-y-5">
        <ResultPanel label="Slug" value={slug} placeholder="Enter some text to generate a slug…" />
        <div className="grid grid-cols-2 gap-3">
          <StatTile label="Length" value={formatNumber(slug.length)} icon="Hash" />
          <StatTile
            label="Preview"
            value={<span className="truncate font-mono text-base">/{slug || "…"}</span>}
            icon="Link2"
          />
        </div>
      </div>
    </div>
  );
}
