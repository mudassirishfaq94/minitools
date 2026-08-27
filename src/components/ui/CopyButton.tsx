import { Check, Copy } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { cn } from "@/utils/cn";

interface CopyButtonProps {
  value: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
  disabled?: boolean;
  /** Renders icon only; the label is still exposed to screen readers. */
  iconOnly?: boolean;
}

export function CopyButton({
  value,
  label = "Copy",
  copiedLabel = "Copied",
  className,
  disabled,
  iconOnly,
}: CopyButtonProps) {
  const { copied, copy } = useCopyToClipboard();
  const accessibleLabel = copied ? copiedLabel || "Copied" : label || "Copy";

  return (
    <button
      type="button"
      disabled={disabled || !value}
      onClick={() => copy(value)}
      aria-label={iconOnly ? `${accessibleLabel}${value ? `: ${value}` : ""}` : undefined}
      title={iconOnly ? accessibleLabel : undefined}
      aria-live="polite"
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition-all",
        "hover:border-slate-300 hover:text-slate-900 active:scale-[0.98]",
        "disabled:pointer-events-none disabled:opacity-50",
        "dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white",
        iconOnly && "w-9 justify-center px-0",
        className,
      )}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-emerald-500" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
      {iconOnly ? (
        <span className="sr-only">{accessibleLabel}</span>
      ) : (
        <span>{copied ? copiedLabel : label}</span>
      )}
    </button>
  );
}
