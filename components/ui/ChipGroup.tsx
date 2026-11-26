"use client";
import { cn } from "@/lib/cn";

/** Grup pilihan tunggal berbentuk chip (radio button yang dapat diakses keyboard). */
export default function ChipGroup<T extends string>({
  name,
  legend,
  options,
  value,
  onChange,
  required,
}: {
  name: string;
  legend: string;
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  required?: boolean;
}) {
  return (
    <fieldset>
      <legend className="mb-1.5 block text-sm font-medium text-ink">
        {legend}
        {required && (
          <span className="text-expense" aria-hidden>
            {" "}*
          </span>
        )}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const checked = o.value === value;
          return (
            <label
              key={o.value}
              className={cn(
                "relative inline-flex h-10 items-center rounded-full border px-4 text-sm font-medium transition-colors",
                "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand",
                checked
                  ? "border-brand bg-brand text-white shadow-card"
                  : "border-border-strong bg-surface text-ink-muted hover:border-ink-faint/50 hover:text-ink"
              )}
            >
              <input
                type="radio"
                name={name}
                value={o.value}
                checked={checked}
                onChange={() => onChange(o.value)}
                className="sr-only"
              />
              {o.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
