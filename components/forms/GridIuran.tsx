"use client";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Save } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Field, { inputClass, selectClass } from "@/components/ui/Field";
import InputRupiah from "@/components/ui/InputRupiah";
import { catatIuranSekaligus } from "@/lib/actions/keuangan";
import { bulanIni, formatPeriode, formatRupiah, formatTanggal, hariIni } from "@/lib/format";
import {
  jumlahBayarPerBulan,
  kunciCentang,
  pulihkanCentang,
  ringkasCentang,
  type GridIuran as Grid,
} from "@/lib/iuran";
import { cn } from "@/lib/cn";

const NAMA_BULAN_PENDEK = Array.from({ length: 12 }, (_, i) =>
  new Date(Date.UTC(2000, i, 1)).toLocaleDateString("id-ID", { month: "short", timeZone: "UTC" })
);

export default function GridIuran({
  grid,
  tahun,
  pilihanTahun,
}: {
  grid: Grid;
  tahun: number;
  pilihanTahun: number[];
}) {
  const router = useRouter();
  const [centang, setCentang] = useState<Set<string>>(new Set());
  const [jumlah, setJumlah] = useState("10000");
  const [tanggal, setTanggal] = useState(hariIni());
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});
  const [pending, startTransition] = useTransition();
  const scrollRef = useRef<HTMLDivElement>(null);
  const kunciSimpanan = `sdl-iuran-centang-${tahun}`;

  const jumlahPerBulan = Number(jumlah) || 0;
  const ringkas = ringkasCentang(centang, jumlahPerBulan);
  const perBulan = useMemo(() => jumlahBayarPerBulan(grid, centang), [grid, centang]);
  const adaCentang = centang.size > 0;
  const total = grid.baris.length;

  // Bulan berjalan langsung terlihat di layar ponsel
  useLayoutEffect(() => {
    const el = scrollRef.current;
    const th = el?.querySelector<HTMLElement>(`[data-bulan="${bulanIni()}"]`);
    if (el && th) el.scrollLeft = Math.max(0, th.offsetLeft - el.clientWidth / 2);
  }, [tahun]);

  // Centang disimpan di perangkat (per tahun) agar tidak hilang saat pindah halaman, kembali,
  // atau gagal menyimpan. Saat dipulihkan, bulan yang kini sudah tercatat dibuang.
  const sudahPulih = useRef(false);
  useEffect(() => {
    let raw: string | null = null;
    try {
      raw = sessionStorage.getItem(kunciSimpanan);
    } catch {}
    const pulih = pulihkanCentang(raw, grid);
    sudahPulih.current = true;
    if (pulih.size > 0) {
      setCentang(pulih);
      toast.info(`${pulih.size} centang yang belum disimpan dipulihkan.`);
    }
    // Hanya saat halaman/tahun dibuka
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kunciSimpanan]);

  useEffect(() => {
    if (!sudahPulih.current) return;
    try {
      if (centang.size > 0) sessionStorage.setItem(kunciSimpanan, JSON.stringify([...centang]));
      else sessionStorage.removeItem(kunciSimpanan);
    } catch {}
  }, [centang, kunciSimpanan]);

  // Setelah data diperbarui (mis. tersimpan di tempat lain), buang centang yang kini sudah tercatat
  useEffect(() => {
    setCentang((s) => (s.size ? pulihkanCentang(JSON.stringify([...s]), grid) : s));
  }, [grid]);

  // Peringatan bila meninggalkan halaman dengan centang yang belum disimpan
  useEffect(() => {
    if (!adaCentang) return;
    const cegah = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", cegah);
    return () => window.removeEventListener("beforeunload", cegah);
  }, [adaCentang]);

  const ubah = (kunci: string) =>
    setCentang((s) => {
      const baru = new Set(s);
      if (baru.has(kunci)) baru.delete(kunci);
      else baru.add(kunci);
      return baru;
    });

  const simpan = () => {
    setErrors({});
    const entri = [...centang].map((k) => {
      const i = k.lastIndexOf("|");
      return { anggota_id: k.slice(0, i), bulan: k.slice(i + 1) };
    });
    startTransition(async () => {
      let res: Awaited<ReturnType<typeof catatIuranSekaligus>>;
      try {
        res = await catatIuranSekaligus({ jumlah: jumlahPerBulan, tanggal_diterima: tanggal, entri });
      } catch {
        // Koneksi putus atau sesi berakhir: centang tetap ada (juga tersimpan di perangkat)
        toast.error("Gagal menghubungi server — koneksi terputus atau sesi berakhir.", {
          description: "Centang tidak hilang. Coba Simpan lagi, atau masuk ulang bila diminta.",
          duration: 12000,
        });
        router.refresh();
        return;
      }
      if (!res.ok) {
        setErrors(res.fieldErrors ?? {});
        toast.error(res.message);
        return;
      }
      const lewati = res.dilewati.length
        ? `${res.dilewati.length} dilewati karena sudah tercatat: ${res.dilewati.map((d) => `${d.nama} (${d.bulan})`).join(", ")}`
        : undefined;
      if (res.disimpan > 0) toast.success(res.message, { description: lewati, duration: lewati ? 12000 : 5000 });
      else toast.info(res.message, { description: lewati, duration: 12000 });
      setCentang(new Set());
      router.refresh();
    });
  };

  const err = (k: string) => errors[k]?.[0];

  return (
    <div className="space-y-4">
      {/* Pengaturan untuk seluruh halaman ini */}
      <Card className="grid grid-cols-2 gap-x-3 gap-y-4 p-4 sm:grid-cols-3 sm:gap-4 sm:p-5">
        <Field
          label="Tahun"
          htmlFor="tahun"
          required
          hint={adaCentang ? "Simpan atau batalkan centang dulu untuk ganti tahun." : undefined}
        >
          <select
            id="tahun"
            value={tahun}
            disabled={adaCentang || pending}
            onChange={(e) => router.push(`/admin/catat-iuran?tahun=${e.target.value}`)}
            className={selectClass}
          >
            {pilihanTahun.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Jumlah per bulan" htmlFor="jumlah" required error={err("jumlah")}>
          <InputRupiah id="jumlah" value={jumlah} onChange={setJumlah} invalid={!!err("jumlah")} />
        </Field>
        <Field
          label="Tanggal diterima"
          htmlFor="tanggal_diterima"
          required
          error={err("tanggal_diterima")}
          className="col-span-2 sm:col-span-1"
        >
          <input
            id="tanggal_diterima"
            type="date"
            value={tanggal}
            max={hariIni()}
            onChange={(e) => setTanggal(e.target.value)}
            aria-invalid={!!err("tanggal_diterima") || undefined}
            className={inputClass}
          />
        </Field>
      </Card>

      <Card className="overflow-hidden">
        <p className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-b border-border px-4 py-3 text-sm text-ink-muted sm:px-5">
          <span className="inline-flex items-center gap-1.5">
            <Sel status="tercatat" /> sudah tercatat
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Sel status="kosong" /> belum bayar
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Sel status="dicentang" /> dicentang, belum disimpan
          </span>
        </p>

        <div ref={scrollRef} className="max-h-[70dvh] overflow-auto overscroll-contain">
          <table className="w-full border-separate border-spacing-0 text-left text-[0.9375rem]">
            <caption className="sr-only">Iuran bulanan {tahun} per anggota</caption>
            <thead>
              <tr>
                <th
                  scope="col"
                  className="sticky top-0 left-0 z-30 w-32 min-w-32 border-b border-border bg-surface-alt px-4 py-3 text-xs font-semibold tracking-wide text-ink-faint uppercase sm:w-56 sm:pl-5"
                >
                  Nama Warga
                </th>
                {grid.bulan.map((b, i) => (
                  <th
                    key={b}
                    scope="col"
                    data-bulan={b}
                    className={cn(
                      "sticky top-0 z-20 border-b border-border bg-surface-alt px-1 py-3 text-center text-xs font-semibold",
                      b === bulanIni() ? "text-brand-dark" : "text-ink-faint"
                    )}
                  >
                    {NAMA_BULAN_PENDEK[i]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {grid.baris.map((baris) => (
                <tr key={baris.anggotaId} className="group">
                  <th
                    scope="row"
                    className="sticky left-0 z-10 border-b border-border bg-surface px-4 py-1 text-sm font-medium text-ink group-hover:bg-surface-alt sm:pl-5 sm:text-[0.9375rem]"
                  >
                    {baris.nama}
                  </th>
                  {grid.bulan.map((b) => {
                    const ada = baris.tercatat[b];
                    const kunci = kunciCentang(baris.anggotaId, b);
                    const dicentang = centang.has(kunci);
                    const periode = formatPeriode(`${b}-01`);
                    return (
                      <td key={b} className="border-b border-border p-0 text-center group-hover:bg-surface-alt/50">
                        {ada ? (
                          <button
                            type="button"
                            onClick={() =>
                              toast(baris.nama, {
                                description: `${periode} · ${formatRupiah(ada.jumlah)} · dicatat ${formatTanggal(ada.tanggalBayar)}`,
                              })
                            }
                            aria-label={`${baris.nama}, ${periode}: sudah tercatat ${formatRupiah(ada.jumlah)}`}
                            className="inline-flex size-11 items-center justify-center"
                          >
                            <Sel status="tercatat" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            aria-pressed={dicentang}
                            aria-label={`${baris.nama}, ${periode}: ${dicentang ? "dicentang" : "belum bayar"}`}
                            onClick={() => ubah(kunci)}
                            disabled={pending}
                            className="inline-flex size-11 items-center justify-center"
                          >
                            <Sel status={dicentang ? "dicentang" : "kosong"} />
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th
                  scope="row"
                  className="sticky bottom-0 left-0 z-30 border-t border-border bg-surface-alt px-4 py-3 text-xs font-semibold tracking-wide text-ink-faint uppercase sm:pl-5"
                >
                  Sudah bayar
                </th>
                {grid.bulan.map((b) => {
                  const { tercatat, dicentang } = perBulan[b];
                  return (
                    <td
                      key={b}
                      className="sticky bottom-0 z-20 border-t border-border bg-surface-alt px-1 py-3 text-center text-xs whitespace-nowrap"
                    >
                      <span className="num font-semibold text-ink">
                        {tercatat}
                        {dicentang > 0 && <span className="text-brand">+{dicentang}</span>}
                      </span>
                      <span className="num text-ink-faint">/{total}</span>
                    </td>
                  );
                })}
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      {/* Bilah ringkasan — cocokkan dengan halaman buku catatan sebelum menyimpan */}
      {/* Hanya tampil bila ada centang, agar tidak menutupi baris tabel di layar ponsel */}
      {(adaCentang || pending) && (
        <div className="sticky bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-20 animate-fade-in md:bottom-4">
          <Card className="flex flex-col gap-3 p-3 shadow-raised sm:flex-row sm:items-center sm:justify-between sm:p-4">
            <p className="text-sm text-ink-muted" aria-live="polite">
              <span className="num">
                {ringkas.jumlahBulan} bulan baru · {ringkas.jumlahWarga} warga
              </span>
              <span className="num block text-lg font-bold text-ink">{formatRupiah(ringkas.total)}</span>
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setCentang(new Set())} disabled={!adaCentang || pending}>
                Batalkan
              </Button>
              <Button onClick={simpan} loading={pending} disabled={!adaCentang || pending} className="flex-1 sm:flex-none">
                {!pending && <Save aria-hidden />}
                {pending ? "Menyimpan…" : "Simpan semua"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

/** Tanda sel: sudah tercatat (abu-abu ✓), belum bayar (kotak putus-putus), dicentang (hijau ✓). */
function Sel({ status }: { status: "tercatat" | "kosong" | "dicentang" }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex size-7 items-center justify-center rounded-lg",
        status === "tercatat" && "bg-surface-alt text-ink-faint ring-1 ring-border-strong ring-inset",
        status === "kosong" && "border-[1.5px] border-dashed border-border-strong",
        status === "dicentang" && "bg-brand text-white"
      )}
    >
      {status !== "kosong" && <Check className="size-4" strokeWidth={3} />}
    </span>
  );
}
