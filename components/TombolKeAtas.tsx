"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/cn";

/** Tampil setelah digulir sejauh ini (px) */
const BATAS_GULIR = 600;

/** Tombol melayang untuk kembali ke atas pada halaman yang panjang. */
export default function TombolKeAtas({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const [tampil, setTampil] = useState(false);

  useEffect(() => {
    const cek = () => setTampil(window.scrollY > BATAS_GULIR);
    cek();
    window.addEventListener("scroll", cek, { passive: true });
    return () => window.removeEventListener("scroll", cek);
  }, []);

  // Halaman Catat Iuran punya bilah Simpan di bawah layar; jangan ditutupi
  if (!tampil || pathname.startsWith("/admin/catat-iuran")) return null;

  const keAtas = () => {
    const kurangiGerak = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: kurangiGerak ? "auto" : "smooth" });
  };

  return (
    <button
      type="button"
      onClick={keAtas}
      aria-label="Kembali ke atas"
      title="Kembali ke atas"
      className={cn(
        "fixed right-4 z-30 flex size-12 animate-fade-in items-center justify-center rounded-full border border-border bg-surface text-ink shadow-raised transition-colors hover:bg-surface-alt sm:right-6",
        // Di atas tab bar admin (h-16) di mobile
        isAdmin
          ? "bottom-[calc(5rem+env(safe-area-inset-bottom))] md:bottom-6"
          : "bottom-[calc(1rem+env(safe-area-inset-bottom))] sm:bottom-6"
      )}
    >
      <ArrowUp className="size-5" aria-hidden />
    </button>
  );
}
