import Image from "next/image";
import Link from "next/link";
import { LogOut, ShieldCheck } from "lucide-react";
import Button from "@/components/ui/Button";
import AdminNav from "@/components/AdminNav";
import { logout } from "@/lib/actions/auth";

export default function AppHeader({ adminEmail }: { adminEmail: string | null }) {
  const isAdmin = Boolean(adminEmail);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/85 backdrop-blur-md supports-[backdrop-filter]:bg-surface/75">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-3 rounded-xl pr-2" aria-label="Suka Duka Legian — Dasbor">
          <span className="relative size-10 shrink-0 overflow-hidden rounded-full border border-border bg-surface-alt">
            <Image src="/logo.png" alt="" fill sizes="40px" className="object-cover" priority />
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-[0.9375rem] font-bold text-ink">Suka Duka Legian</span>
            <span className="block truncate text-xs font-medium text-ink-faint">Kas &amp; Iuran Warga</span>
          </span>
        </Link>

        {isAdmin ? (
          <div className="flex items-center gap-2">
            <span
              className="hidden items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1.5 text-xs font-semibold text-brand-dark sm:inline-flex"
              title={adminEmail ?? undefined}
            >
              <ShieldCheck className="size-3.5" aria-hidden />
              Admin
            </span>
            <form action={logout}>
              <Button type="submit" variant="ghost" size="sm" aria-label="Keluar dari mode admin">
                <LogOut aria-hidden />
                <span className="hidden sm:inline">Keluar</span>
              </Button>
            </form>
          </div>
        ) : (
          <Button href="/login" variant="secondary" size="sm">
            <ShieldCheck aria-hidden />
            Masuk Admin
          </Button>
        )}
      </div>

      {isAdmin && <AdminNav variant="top" />}
    </header>
  );
}
