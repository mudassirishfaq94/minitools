import { useMemo, useState } from "react";
import { Eraser, WandSparkles } from "lucide-react";
import { StatTile } from "@/components/tools/StatTile";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Field";
import { formatBytes, formatNumber, pluralize } from "@/utils/format";
import { countLines, countParagraphs, countSentences, countWords, utf8Bytes } from "@/utils/text";

const sample =
  "Toolstack keeps every utility in one place.\n\nPaste your draft here to see how long it really is — words, characters, sentences and reading time update as you type. Nothing is uploaded, everything is computed locally in your browser.";

export function WordCounter() {
  const [text, setText] = useState(sample);

  const stats = useMemo(() => {
    const words = countWords(text);
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, "").length;
    const sentences = countSentences(text);
    const paragraphs = countParagraphs(text);
    const bytes = utf8Bytes(text);
    const minutes = words / 200;
    const readingTime =
      words === 0 ? "0s" : minutes < 1 ? `${Math.max(1, Math.round(minutes * 60))}s` : `${minutes.toFixed(1)} min`;

    const frequencies = new Map<string, number>();
    for (const word of text.toLowerCase().match(/[\p{L}\p{N}'’-]{3,}/gu) ?? []) {
      frequencies.set(word, (frequencies.get(word) ?? 0) + 1);
    }
    const topWords = [...frequencies.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    return {
      words,
      characters,
      charactersNoSpaces,
      sentences,
      paragraphs,
      lines: countLines(text),
      bytes,
      readingTime,
      speakingTime:
        words === 0
          ? "0s"
          : `${Math.max(1, Math.round((words / 130) * 60))}s`,
      topWords,
      uniqueWords: frequencies.size,
    };
  }, [text]);

  return (
    <div className="space-y-5">
      <Card>
        <Textarea
          label="Your text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Start typing or paste your text…"
          rows={10}
          className="font-sans text-[15px]"
          action={
            <div className="flex gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setText(sample)}
                className="h-8 px-2.5 text-xs"
              >
                <WandSparkles className="h-3.5 w-3.5" />
                Sample
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setText("")}
                disabled={!text}
                className="h-8 px-2.5 text-xs"
              >
                <Eraser className="h-3.5 w-3.5" />
                Clear
              </Button>
            </div>
          }
        />
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <StatTile label="Words" value={formatNumber(stats.words)} icon="Type" />
        <StatTile
          label="Characters"
          value={formatNumber(stats.characters)}
          hint={`${formatNumber(stats.charactersNoSpaces)} without spaces`}
          icon="Hash"
        />
        <StatTile label="Sentences" value={formatNumber(stats.sentences)} icon="Braces" />
        <StatTile label="Paragraphs" value={formatNumber(stats.paragraphs)} icon="Layers" />
        <StatTile label="Lines" value={formatNumber(stats.lines)} icon="Blocks" />
        <StatTile
          label="Unique words"
          value={formatNumber(stats.uniqueWords)}
          hint={`${pluralize(stats.words, "word")} total`}
          icon="Sparkles"
        />
        <StatTile
          label="Reading time"
          value={stats.readingTime}
          hint="at 200 words / minute"
          icon="Timer"
        />
        <StatTile
          label="Size"
          value={formatBytes(stats.bytes)}
          hint="UTF-8 encoded"
          icon="Gauge"
        />
      </div>

      {stats.topWords.length > 0 ? (
        <Card>
          <h3 className="text-sm font-semibold">Most used words</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {stats.topWords.map(([word, count]) => (
              <span
                key={word}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
              >
                {word}
                <span className="text-slate-400 dark:text-slate-500">×{count}</span>
              </span>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
