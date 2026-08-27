import type { ElementType, ReactNode } from "react";
import { cn } from "@/utils/cn";

interface ContainerProps {
  as?: ElementType;
  className?: string;
  children: ReactNode;
}

/** Centered, responsive page container with consistent gutters. */
export function Container({ as: Tag = "div", className, children }: ContainerProps) {
  return (
    <Tag className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}>
      {children}
    </Tag>
  );
}

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  actions?: ReactNode;
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  actions,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        align === "center" && "sm:flex-col sm:items-center",
        className,
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
        {eyebrow ? (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-600 dark:text-brand-400">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
        {description ? (
          <p className="mt-3 text-pretty leading-relaxed muted">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );
}
