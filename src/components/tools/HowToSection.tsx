import { ListChecks } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { HowToStep } from "@/data/toolContent";

interface HowToSectionProps {
  toolName: string;
  steps: HowToStep[];
}

/** Numbered "how to use" walkthrough rendered under the tool interface. */
export function HowToSection({ toolName, steps }: HowToSectionProps) {
  if (steps.length === 0) return null;

  return (
    <section aria-labelledby="how-to-heading">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
          <ListChecks className="h-4 w-4" />
        </span>
        <div>
          <h2 id="how-to-heading" className="text-lg font-semibold tracking-tight">
            How to use {toolName}
          </h2>
          <p className="text-xs muted">Four quick steps — no setup required</p>
        </div>
      </div>

      <ol className="grid gap-4 sm:grid-cols-2">
        {steps.map((step, index) => (
          <li key={step.title}>
            <Card className="h-full">
              <div className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                >
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold">{step.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed muted">{step.body}</p>
                </div>
              </div>
            </Card>
          </li>
        ))}
      </ol>
    </section>
  );
}
