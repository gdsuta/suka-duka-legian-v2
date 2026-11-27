import Link from "next/link";
import { ListChecks, Pencil } from "lucide-react";
import { cn } from "@/lib/cn";

/** Pilihan cara mencatat iuran: satu per satu (form biasa) atau sekaligus (grid buku catatan). */
export default function ModeCatat({ aktif }: { aktif: "satu" | "sekaligus" }) {
  const pilihan = [
    { key: "satu", href: "/admin/catat-pemasukan", label: "Satu per satu", icon: Pencil },
    { key: "sekaligus", href: "/admin/catat-iuran", label: "Sekaligus (logbook)", icon: ListChecks },
  ] as const;

  return (
    <nav
      aria-label="Cara mencatat"
      className="mb-5 inline-grid w-full grid-cols-2 rounded-xl bg-surface-alt p-1 ring-1 ring-border ring-inset sm:w-96"
    >
      {pilihan.map(({ key, href, label, icon: Icon }) => (
        <Link
          key={key}
          href={href}
          aria-current={aktif === key ? "page" : undefined}
          className={cn(
            "flex h-11 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-[background-color,color,box-shadow]",
            aktif === key ? "bg-surface text-ink shadow-card" : "text-ink-muted hover:text-ink"
          )}
        >
          <Icon className={cn("size-4", aktif === key && "text-brand")} aria-hidden />
          {label}
        </Link>
      ))}
    </nav>
  );
}
