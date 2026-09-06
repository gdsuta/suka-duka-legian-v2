import type { ReactNode } from "react";

export const inputClass =
  "block w-full min-h-11 rounded-md border border-border bg-surface px-3 py-2.5 text-[15px] text-ink placeholder:text-ink-faint focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25 transition";

interface FieldProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
}

export default function Field({
  label,
  htmlFor,
  required,
  error,
  hint,
  children,
}: FieldProps) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-ink mb-1.5">
        {label}
        {required && <span className="text-expense"> *</span>}
      </label>
      {children}
      {error ? (
        <p className="mt-1.5 text-xs font-medium text-expense">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-ink-faint">{hint}</p>
      ) : null}
    </div>
  );
}
