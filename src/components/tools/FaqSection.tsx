import { useState } from "react";
import { ChevronDown, CircleHelp } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/utils/cn";
import type { FaqItem } from "@/data/toolContent";

interface FaqSectionProps {
  toolName: string;
  items: FaqItem[];
}

/**
 * Accessible FAQ accordion.
 *
 * Answers stay in the DOM (hidden with `hidden`) rather than being unmounted,
 * so in-page search and crawlers can still read them while collapsed.
 */
export function FaqSection({ toolName, items }: FaqSectionProps) {
  const [open, setOpen] = useState<number | null>(0);

  if (items.length === 0) return null;

  return (
    <section aria-labelledby="faq-heading">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
          <CircleHelp className="h-4 w-4" />
        </span>
        <div>
          <h2 id="faq-heading" className="text-lg font-semibold tracking-tight">
            Frequently asked questions
          </h2>
          <p className="truncate text-xs muted">About {toolName}</p>
        </div>
      </div>

      <Card padded={false} className="overflow-hidden">
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {items.map((item, index) => {
            const expanded = open === index;
            const panelId = `faq-panel-${index}`;
            const buttonId = `faq-button-${index}`;

            return (
              <li key={item.question}>
                <h3>
                  <button
                    type="button"
                    id={buttonId}
                    aria-expanded={expanded}
                    aria-controls={panelId}
                    onClick={() => setOpen(expanded ? null : index)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  >
                    <span className="text-sm font-medium">{item.question}</span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200",
                        expanded && "rotate-180",
                      )}
                      aria-hidden="true"
                    />
                  </button>
                </h3>

                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  hidden={!expanded}
                  className="px-4 pb-4"
                >
                  <p className="text-sm leading-relaxed muted">{item.answer}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </Card>
    </section>
  );
}
