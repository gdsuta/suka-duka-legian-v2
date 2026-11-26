"use client";
import { useMemo, useRef, useState, useTransition } from "react";
import { CircleAlert, CircleCheck, Save } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ChipGroup from "@/components/ui/ChipGroup";
import Field, { describedBy, inputClass, selectClass } from "@/components/ui/Field";
import InputRupiah from "@/components/ui/InputRupiah";
import { catatPemasukan } from "@/lib/actions/keuangan";
import { KATEGORI_PEMASUKAN, type KategoriPemasukan } from "@/lib/config";
import { bulanIni, formatPeriode, formatRupiah, hariIni } from "@/lib/format";
import { cn } from "@/lib/cn";

type Errors = Record<string, string[] | undefined>;

const NAMA_BULAN = Array.from({ length: 12 }, (_, i) =>
  new Date(Date.UTC(2000, i, 1)).toLocaleDateString("id-ID", { month: "long", timeZone: "UTC" })
);

interface Props {
  anggota: { id: string; nama_lengkap: string }[];
  /** Nominal yang paling sering dipakai per kategori — untuk tombol cepat */
  nominalUmum: Partial<Record<KategoriPemasukan, number[]>>;
  /** "anggotaId|YYYY-MM" untuk Iuran Bulanan yang sudah tercatat */
  iuranTercatat: string[];
}

export default function FormPemasukan({ anggota, nominalUmum, iuranTercatat }: Props) {
  const [anggotaId, setAnggotaId] = useState("");
  const [kategori, setKategori] = useState<KategoriPemasukan>("Iuran Bulanan");
  const [jumlah, setJumlah] = useState("");
  const [bulan, setBulan] = useState(bulanIni()); // YYYY-MM
  const [tanggalDenda, setTanggalDenda] = useState(hariIni());
  const [errors, setErrors] = useState<Errors>({});
  const [pending, startTransition] = useTransition();
  const [riwayatSesi, setRiwayatSesi] = useState<{ nama: string; kategori: string; jumlah: number }[]>([]);
  const anggotaRef = useRef<HTMLSelectElement>(null);
  const tercatat = useMemo(() => new Set(iuranTercatat), [iuranTercatat]);

  const tahunSekarang = Number(bulanIni().slice(0, 4));
  const daftarTahun = [tahunSekarang + 1, tahunSekarang, tahunSekarang - 1, tahunSekarang - 2];
  const [tahunPilih, bulanPilih] = bulan.split("-");

  const periode =
    kategori === "Iuran Bulanan" ? `${bulan}-01` : kategori === "Denda Gotong-Royong" ? tanggalDenda : null;

  const sudahLunas = kategori === "Iuran Bulanan" && anggotaId && tercatat.has(`${anggotaId}|${bulan}`);
  const saran = nominalUmum[kategori] ?? [];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const nama = anggota.find((a) => a.id === anggotaId)?.nama_lengkap ?? "";

    startTransition(async () => {
      const res = await catatPemasukan({
        anggota_id: anggotaId,
        kategori,
        jumlah: jumlah ? Number(jumlah) : NaN,
        periode_bulan: periode,
      });

      if (!res.ok) {
        setErrors(res.fieldErrors ?? {});
        toast.error(res.message);
        return;
      }

      toast.success(res.message, {
        description: `${nama} · ${kategori} · ${formatRupiah(Number(jumlah))}`,
      });
      setRiwayatSesi((r) => [{ nama, kategori, jumlah: Number(jumlah) }, ...r].slice(0, 5));
      // Pertahankan kategori, periode & nominal agar pencatatan beruntun cepat
      setAnggotaId("");
      anggotaRef.current?.focus();
    });
  };

  const err = (k: string) => errors[k]?.[0];

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <Card className="p-5 sm:p-7">
        <form onSubmit={submit} className="space-y-5" noValidate>
          <ChipGroup
            name="kategori"
            legend="Kategori"
            required
            options={KATEGORI_PEMASUKAN.map((k) => ({ value: k, label: k }))}
            value={kategori}
            onChange={(k) => {
              setKategori(k);
              setErrors({});
            }}
          />

          <Field label="Nama Anggota" htmlFor="anggota_id" required error={err("anggota_id")}>
            <select
              ref={anggotaRef}
              id="anggota_id"
              value={anggotaId}
              onChange={(e) => setAnggotaId(e.target.value)}
              aria-invalid={!!err("anggota_id") || undefined}
              aria-describedby={describedBy("anggota_id", err("anggota_id"))}
              className={cn(selectClass, !anggotaId && "text-ink-faint")}
            >
              <option value="" disabled>
                Pilih anggota…
              </option>
              {anggota.map((a) => (
                <option key={a.id} value={a.id} className="text-ink">
                  {a.nama_lengkap}
                </option>
              ))}
            </select>
          </Field>

          {kategori === "Iuran Bulanan" && (
            <fieldset>
              <legend className="mb-1.5 block text-sm font-medium text-ink">
                Untuk Bulan
                <span className="text-expense" aria-hidden>
                  {" "}*
                </span>
              </legend>
              <div className="grid grid-cols-[minmax(0,1fr)_7.5rem] gap-2">
                <select
                  aria-label="Bulan"
                  value={bulanPilih}
                  onChange={(e) => setBulan(`${tahunPilih}-${e.target.value}`)}
                  className={selectClass}
                >
                  {NAMA_BULAN.map((nama, i) => (
                    <option key={nama} value={String(i + 1).padStart(2, "0")}>
                      {nama}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Tahun"
                  value={tahunPilih}
                  onChange={(e) => setBulan(`${e.target.value}-${bulanPilih}`)}
                  className={selectClass}
                >
                  {daftarTahun.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              {sudahLunas && (
                <p className="mt-2 flex items-start gap-2 rounded-lg bg-gold-soft px-3 py-2 text-sm text-gold" role="status">
                  <CircleAlert className="mt-px size-4 shrink-0" aria-hidden />
                  Anggota ini sudah tercatat membayar iuran {formatPeriode(`${bulan}-01`)}. Pastikan tidak dobel.
                </p>
              )}
            </fieldset>
          )}

          {kategori === "Denda Gotong-Royong" && (
            <Field
              label="Tanggal Gotong-Royong"
              htmlFor="tanggal_denda"
              required
              error={err("periode_bulan")}
              hint="Tanggal kegiatan yang tidak dihadiri."
            >
              <input
                id="tanggal_denda"
                type="date"
                value={tanggalDenda}
                onChange={(e) => setTanggalDenda(e.target.value)}
                aria-invalid={!!err("periode_bulan") || undefined}
                aria-describedby={describedBy("tanggal_denda", err("periode_bulan"), true)}
                className={inputClass}
              />
            </Field>
          )}

          <Field label="Jumlah" htmlFor="jumlah" required error={err("jumlah")}>
            <InputRupiah
              id="jumlah"
              value={jumlah}
              onChange={setJumlah}
              invalid={!!err("jumlah")}
              describedBy={describedBy("jumlah", err("jumlah"))}
            />
            {saran.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-ink-faint">Sering dipakai:</span>
                {saran.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setJumlah(String(n))}
                    className={cn(
                      "num h-8 rounded-full border px-3 text-xs font-semibold transition-colors",
                      jumlah !== "" && Number(jumlah) === n
                        ? "border-brand bg-brand-soft text-brand-dark"
                        : "border-border-strong text-ink-muted hover:border-ink-faint/50 hover:text-ink"
                    )}
                  >
                    {formatRupiah(n)}
                  </button>
                ))}
              </div>
            )}
          </Field>

          <div className="pt-1">
            <Button type="submit" size="lg" loading={pending} className="w-full">
              {!pending && <Save aria-hidden />}
              {pending ? "Menyimpan…" : "Simpan Pemasukan"}
            </Button>
          </div>
        </form>
      </Card>

      <aside aria-label="Baru saja dicatat" className="lg:pt-0">
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-ink">Baru saja dicatat</h2>
          {riwayatSesi.length === 0 ? (
            <p className="mt-1 text-sm text-ink-faint">Catatan di sesi ini akan muncul di sini.</p>
          ) : (
            <ul className="mt-3 space-y-3" aria-live="polite">
              {riwayatSesi.map((r, i) => (
                <li key={i} className="flex animate-fade-in items-start gap-2.5">
                  <CircleCheck className="mt-0.5 size-4 shrink-0 text-income" aria-hidden />
                  <div className="min-w-0 text-sm">
                    <p className="truncate font-medium text-ink">{r.nama}</p>
                    <p className="text-ink-faint">
                      {r.kategori} · <span className="num">{formatRupiah(r.jumlah)}</span>
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </aside>
    </div>
  );
}
