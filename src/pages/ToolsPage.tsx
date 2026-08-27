import { ToolBrowser } from "@/components/tools/ToolBrowser";
import { Container } from "@/components/ui/Container";
import { availableTools, categories } from "@/data/catalog";
import { pluralize } from "@/utils/format";

export function ToolsPage() {
  return (
    <Container className="py-10 sm:py-14">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">All tools</h1>
        <p className="mt-3 text-pretty leading-relaxed muted">
          {pluralize(availableTools.length, "tool")} across {categories.length} categories. Search
          by name or category — results update instantly and everything runs locally in your
          browser.
        </p>
      </header>

      <ToolBrowser tools={availableTools} groupWhenIdle columns={4} className="mt-8" />
    </Container>
  );
}
