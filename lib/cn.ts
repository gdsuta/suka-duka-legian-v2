import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Merges class lists so a later conflicting utility (e.g. bg-brand passed
// via `className`) always wins over an earlier one (e.g. Card's own
// bg-surface) — Tailwind's generated CSS order alone doesn't guarantee that.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
