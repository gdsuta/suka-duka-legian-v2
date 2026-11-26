import type { ReactNode } from "react";
import { CircleAlert } from "lucide-react";
import { cn } from "@/lib/cn";

/** Kelas dasar input/select/textarea — 16px agar iOS tidak auto-zoom. */
export const inputClass =
  "block w-full h-12 rounded-xl border border-border-strong bg-surface px-3.5 text-base text-ink " +
  "placeholder:text-ink-faint/80 shadow-[inset_0_1px_1px_rgb(15_26_36/0.03)] " +
  "transition-[border-color,box-shadow] duration-150 " +
  "hover:border-ink-faint/50 " +
  "focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15 " +
  "aria-[invalid=true]:border-expense aria-[invalid=true]:focus:ring-expense/15 " +
  "disabled:bg-surface-alt disabled:text-ink-faint";

export const selectClass = cn(inputClass, "select-chevron pr-10");

export const textareaClass = cn(inputClass, "h-auto min-h-24 py-3 leading-relaxed");

interface FieldProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  hint?: ReactNode;
  className?: string;
  children: ReactNode;
}

/**
 * Label + kontrol + pesan. Beri kontrol di dalamnya
 * `aria-describedby={describedBy(id, error, hint)}` dan `aria-invalid={!!error}`.
 */
export default function Field({ label, htmlFor, required, error, hint, className, children }: FieldProps) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
        {required ? (
          <span className="text-expense" aria-hidden>
            {" "}*
          </span>
        ) : (
          <span className="font-normal text-ink-faint"> (opsional)</span>
        )}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-expense" role="alert">
          <CircleAlert className="size-4 shrink-0" aria-hidden />
          {error}
        </p>
      ) : hint ? (
        <p id={`${htmlFor}-hint`} className="mt-1.5 text-sm text-ink-faint">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function describedBy(id: string, error?: string, hint?: unknown) {
  if (error) return `${id}-error`;
  if (hint) return `${id}-hint`;
  return undefined;
}
