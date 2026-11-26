import { ArrowDownRight, ArrowUpRight, Wallet } from "lucide-react";
import { formatRupiah, formatPeriode } from "@/lib/format";
import type { Ringkasan } from "@/lib/ringkasan";

export default function SaldoHero({ r }: { r: Ringkasan }) {
  const negatif = r.saldo < 0;

  return (
    <section
      aria-labelledby="saldo-label"
      className="relative overflow-hidden rounded-card bg-brand-deep text-white shadow-raised"
    >
      {/* Sorotan lembut — dekoratif */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-full bg-brand opacity-60 blur-3xl"
      />
      <div aria-hidden className="pointer-events-none absolute -bottom-32 -left-20 size-64 rounded-full bg-brand/40 blur-3xl" />

      <div className="relative p-5 sm:p-7">
        <div className="flex items-center gap-2 text-sm font-medium text-white/75">
          <Wallet className="size-4" aria-hidden />
          <h2 id="saldo-label">Saldo Kas Saat Ini</h2>
        </div>
        <p
          className={`num mt-2 text-[2.25rem] leading-none font-bold tracking-tight sm:text-5xl ${negatif ? "text-red-200" : ""}`}
        >
          {formatRupiah(r.saldo)}
        </p>

        <dl className="mt-6 grid grid-cols-2 gap-3 sm:mt-7 sm:max-w-lg">
          <div className="rounded-xl bg-white/10 p-3 ring-1 ring-white/10 ring-inset sm:p-4">
            <dt className="flex items-center gap-1.5 text-xs font-medium text-white/70 sm:text-sm">
              <span className="flex size-5 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-200">
                <ArrowUpRight className="size-3.5" aria-hidden />
              </span>
              Total Pemasukan
            </dt>
            <dd className="num mt-1.5 text-base font-semibold sm:text-xl">{formatRupiah(r.totalMasuk)}</dd>
          </div>
          <div className="rounded-xl bg-white/10 p-3 ring-1 ring-white/10 ring-inset sm:p-4">
            <dt className="flex items-center gap-1.5 text-xs font-medium text-white/70 sm:text-sm">
              <span className="flex size-5 items-center justify-center rounded-full bg-red-400/20 text-red-200">
                <ArrowDownRight className="size-3.5" aria-hidden />
              </span>
              Total Pengeluaran
            </dt>
            <dd className="num mt-1.5 text-base font-semibold sm:text-xl">{formatRupiah(r.totalKeluar)}</dd>
          </div>
        </dl>

        <p className="mt-4 text-xs text-white/60">
          {formatPeriode(`${r.bulanIni}-01`)}: masuk{" "}
          <span className="num font-semibold text-white/85">{formatRupiah(r.masukBulanIni)}</span> · keluar{" "}
          <span className="num font-semibold text-white/85">{formatRupiah(r.keluarBulanIni)}</span>
        </p>
      </div>
    </section>
  );
}
