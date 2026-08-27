import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { useId } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/utils/cn";

const controlBase =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm " +
  "placeholder:text-slate-400 transition-colors " +
  "hover:border-slate-300 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 " +
  "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 " +
  "dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-100 dark:placeholder:text-slate-500 " +
  "dark:hover:border-slate-700 dark:focus:border-brand-400";

interface FieldShellProps {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  htmlFor?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function Field({
  label,
  hint,
  error,
  htmlFor,
  action,
  className,
  children,
}: FieldShellProps) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      {label || action ? (
        <div className="flex items-center justify-between gap-2">
          {label ? (
            <label
              htmlFor={htmlFor}
              className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              {label}
            </label>
          ) : (
            <span />
          )}
          {action}
        </div>
      ) : null}
      {children}
      {error ? (
        <p className="text-xs font-medium text-rose-600 dark:text-rose-400">{error}</p>
      ) : hint ? (
        <p className="text-xs muted">{hint}</p>
      ) : null}
    </div>
  );
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  wrapperClassName?: string;
  action?: ReactNode;
}

export function Input({
  label,
  hint,
  error,
  wrapperClassName,
  action,
  className,
  id,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <Field
      label={label}
      hint={hint}
      error={error}
      htmlFor={inputId}
      action={action}
      className={wrapperClassName}
    >
      <input
        id={inputId}
        className={cn(controlBase, className)}
        aria-invalid={error ? true : undefined}
        {...props}
      />
    </Field>
  );
}

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  wrapperClassName?: string;
  action?: ReactNode;
}

export function Textarea({
  label,
  hint,
  error,
  wrapperClassName,
  action,
  className,
  id,
  rows = 6,
  ...props
}: TextareaProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  return (
    <Field
      label={label}
      hint={hint}
      error={error}
      htmlFor={textareaId}
      action={action}
      className={wrapperClassName}
    >
      <textarea
        id={textareaId}
        rows={rows}
        className={cn(controlBase, "resize-y font-mono text-[13px] leading-relaxed", className)}
        aria-invalid={error ? true : undefined}
        {...props}
      />
    </Field>
  );
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: ReactNode;
  hint?: ReactNode;
  wrapperClassName?: string;
  options: { value: string; label: string }[];
}

export function Select({
  label,
  hint,
  wrapperClassName,
  options,
  className,
  id,
  ...props
}: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  return (
    <Field label={label} hint={hint} htmlFor={selectId} className={wrapperClassName}>
      <div className="relative">
        <select
          id={selectId}
          className={cn(controlBase, "cursor-pointer appearance-none pr-9", className)}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
    </Field>
  );
}

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  className?: string;
}

export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled,
  className,
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "flex w-full cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left transition-colors",
        "hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950/40 dark:hover:border-slate-700",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
        disabled && "cursor-not-allowed opacity-60",
        className,
      )}
    >
      <span
        className={cn(
          "relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition-colors duration-200",
          checked ? "bg-brand-600" : "bg-slate-300 dark:bg-slate-700",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200",
            checked && "translate-x-4",
          )}
        />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">{label}</span>
        {description ? <span className="mt-0.5 block text-xs muted">{description}</span> : null}
      </span>
    </button>
  );
}
