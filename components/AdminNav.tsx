"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { History, LayoutDashboard, TrendingDown, TrendingUp, Users } from "lucide-react";
import { cn } from "@/lib/cn";

const ITEMS = [
  { href: "/", label: "Dasbor", icon: LayoutDashboard, match: (p: string) => p === "/" },
  { href: "/admin/catat-pemasukan", label: "Pemasukan", icon: TrendingUp, match: (p: string) => p.startsWith("/admin/catat-pemasukan") },
  { href: "/admin/catat-pengeluaran", label: "Pengeluaran", icon: TrendingDown, match: (p: string) => p.startsWith("/admin/catat-pengeluaran") },
  {
    href: "/admin/kelola-anggota",
    label: "Anggota",
    icon: Users,
    match: (p: string) => p.startsWith("/admin/kelola-anggota") || p.startsWith("/admin/tambah-anggota"),
  },
  { href: "/admin/riwayat-transaksi", label: "Riwayat", icon: History, match: (p: string) => p.startsWith("/admin/riwayat-transaksi") },
];

/**
 * Navigasi admin.
 * - "top": baris tab di bawah header, tampil mulai layar md
 * - "bottom": tab bar tetap di bawah layar, hanya mobile
 */
export default function AdminNav({ variant }: { variant: "top" | "bottom" }) {
  const pathname = usePathname();

  if (variant === "top") {
    return (
      <nav aria-label="Menu admin" className="hidden border-t border-border md:block">
        <ul className="mx-auto flex h-12 max-w-6xl items-stretch gap-1 px-4 sm:px-6">
          {ITEMS.map(({ href, label, icon: Icon, match }) => {
            const active = match(pathname);
            return (
              <li key={href} className="flex">
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative inline-flex items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors",
                    "after:absolute after:inset-x-3 after:-bottom-px after:h-0.5 after:rounded-full after:transition-colors",
                    active
                      ? "text-brand-dark after:bg-brand"
                      : "text-ink-muted hover:text-ink after:bg-transparent"
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    );
  }

  return (
    <nav
      aria-label="Menu admin"
      className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur-md md:hidden"
    >
      <ul className="grid h-16 grid-cols-5">
        {ITEMS.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <li key={href} className="flex">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center gap-1 text-[0.6875rem] font-semibold transition-colors",
                  active ? "text-brand" : "text-ink-faint hover:text-ink"
                )}
              >
                <span
                  className={cn(
                    "flex h-7 w-12 items-center justify-center rounded-full transition-colors",
                    active && "bg-brand-soft"
                  )}
                >
                  <Icon className="size-5" strokeWidth={active ? 2.25 : 2} aria-hidden />
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
