import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "brand" | "income" | "expense" | "gold" | "sky" | "violet" | "neutral";

const tones: Record<Tone, string> = {
  brand: "bg-brand-soft text-brand-dark ring-brand/15",
  income: "bg-income-soft text-income ring-income/15",
  expense: "bg-expense-soft text-expense ring-expense/15",
  gold: "bg-gold-soft text-gold ring-gold/20",
  sky: "bg-sky-soft text-sky ring-sky/15",
  violet: "bg-violet-soft text-violet ring-violet/15",
  neutral: "bg-surface-alt text-ink-muted ring-border-strong/60",
};

export default function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ring-1 ring-inset [&_svg]:size-3.5",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export const TONE_KATEGORI: Record<string, Tone> = {
  "Iuran Bulanan": "brand",
  "Sumbangan Wajib": "gold",
  "Sumbangan Awal": "sky",
  "Denda Gotong-Royong": "expense",
  "Donasi Sukarela": "violet",
};
