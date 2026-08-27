import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ToolCard } from "@/components/tools/ToolCard";
import { featuredTools } from "@/data/catalog";

export function NotFoundPage() {
  return (
    <Container className="py-20">
      <div className="mx-auto max-w-lg text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400">
          404
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          We couldn’t find that page
        </h1>
        <p className="mt-3 text-pretty muted">
          The link may be outdated or the tool has moved. Everything is still one click away.
        </p>
        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button href="/">
            <ArrowLeft className="h-4 w-4" />
            Back home
          </Button>
          <Button href="/tools" variant="outline">
            Browse all tools
          </Button>
        </div>
      </div>

      <div className="mt-14">
        <h2 className="text-center text-sm font-semibold uppercase tracking-wide text-slate-400">
          Popular tools
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredTools.slice(0, 3).map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </div>
    </Container>
  );
}
