import { ToolPageShell } from "@/components/tools/ToolPageShell";
import { useRecordToolVisit } from "@/hooks/useRecentTools";
import { getTool } from "@/tools/registry";
import { NotFoundPage } from "@/pages/NotFoundPage";

interface ToolPageProps {
  slug: string;
}

export function ToolPage({ slug }: ToolPageProps) {
  const tool = getTool(slug);

  // Records the visit for the "recently used" list. Safe when the tool is
  // missing — the hook ignores an undefined slug.
  useRecordToolVisit(tool?.slug);

  if (!tool) return <NotFoundPage />;

  const ToolComponent = tool.component;

  return (
    <ToolPageShell tool={tool}>
      <div className="animate-fade-up">
        <ToolComponent />
      </div>
    </ToolPageShell>
  );
}
