"use client";
import { useState, useTransition } from "react";
import { Minus, Plus, Save } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ChipGroup from "@/components/ui/ChipGroup";
import Field, { describedBy, inputClass } from "@/components/ui/Field";
import InputRupiah from "@/components/ui/InputRupiah";
import { catatPengeluaran } from "@/lib/actions/keuangan";
import { KATEGORI_PENGELUARAN, type KategoriPengeluaran } from "@/lib/config";
import { formatRupiah, hariIni } from "@/lib/format";
import { cn } from "@/lib/cn";

type Errors = Record<string, string[] | undefined>;

export default function FormPengeluaran({ saranPembeli }: { saranPembeli: string[] }) {
  const [kategori, setKategori] = useState<KategoriPengeluaran | "">("");
  const [item, setItem] = useState("");
  const [tanggal, setTanggal] = useState(hariIni());
  const [vendor, setVendor] = useState("");
  const [harga, setHarga] = useState("");
  const [volume, setVolume] = useState(1);
  const [pembeli, setPembeli] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [pending, startTransition] = useTransition();

  const total = (Number(harga) || 0) * volume;
  const err = (k: string) => errors[k]?.[0];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    startTransition(async () => {
      const res = await catatPengeluaran({
        kategori: kategori || undefined,
        item_barang: item,
        tanggal,
        vendor,
        harga_satuan: harga ? Number(harga) : NaN,
        volume,
        pembeli,
      });
      if (!res.ok) {
        setErrors(res.fieldErrors ?? {});
        toast.error(res.message);
        return;
      }
      toast.success(res.message, { description: `${kategori} · ${item} · ${formatRupiah(total)}` });
      // Kategori dipertahankan: belanja satu kegiatan biasanya dicatat beruntun
      setItem("");
      setVendor("");
      setHarga("");
      setVolume(1);
    });
  };

  return (
    <Card className="max-w-2xl p-5 sm:p-7">
      <form onSubmit={submit} className="space-y-5" noValidate>
        <div>
          <ChipGroup
            name="kategori"
            legend="Kategori"
            required
            options={KATEGORI_PENGELUARAN.map((k) => ({ value: k, label: k }))}
            value={kategori}
            onChange={(k) => {
              setKategori(k);
              setErrors((e) => ({ ...e, kategori: undefined }));
            }}
          />
          {err("kategori") && (
            <p id="kategori-error" role="alert" className="mt-1.5 text-sm font-medium text-expense">
              {err("kategori")}
            </p>
          )}
        </div>

        <Field label="Nama Item / Keperluan" htmlFor="item_barang" required error={err("item_barang")}>
          <input
            id="item_barang"
            value={item}
            onChange={(e) => setItem(e.target.value)}
            placeholder="Contoh: Lampu jalan LED 50W"
            aria-invalid={!!err("item_barang") || undefined}
            aria-describedby={describedBy("item_barang", err("item_barang"))}
            className={inputClass}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Tanggal Beli" htmlFor="tanggal" required error={err("tanggal")}>
            <input
              id="tanggal"
              type="date"
              value={tanggal}
              max={hariIni()}
              onChange={(e) => setTanggal(e.target.value)}
              aria-invalid={!!err("tanggal") || undefined}
              aria-describedby={describedBy("tanggal", err("tanggal"))}
              className={inputClass}
            />
          </Field>
          <Field label="Toko / Vendor" htmlFor="vendor">
            <input
              id="vendor"
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
              placeholder="Contoh: Toko Bangunan Jaya"
              className={inputClass}
            />
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_11rem]">
          <Field label="Harga Satuan" htmlFor="harga_satuan" required error={err("harga_satuan")}>
            <InputRupiah
              id="harga_satuan"
              value={harga}
              onChange={setHarga}
              invalid={!!err("harga_satuan")}
              describedBy={describedBy("harga_satuan", err("harga_satuan"))}
            />
          </Field>
          <Field label="Volume" htmlFor="volume" required error={err("volume")}>
            <div className="flex h-12 items-stretch overflow-hidden rounded-xl border border-border-strong bg-surface focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/15">
              <button
                type="button"
                onClick={() => setVolume((v) => Math.max(1, v - 1))}
                aria-label="Kurangi volume"
                disabled={volume <= 1}
                className="flex w-12 items-center justify-center text-ink-muted hover:bg-surface-alt disabled:opacity-40"
              >
                <Minus className="size-4" aria-hidden />
              </button>
              <input
                id="volume"
                type="number"
                inputMode="numeric"
                min={1}
                value={volume}
                onChange={(e) => setVolume(Math.max(1, Math.floor(Number(e.target.value) || 1)))}
                className="num w-full min-w-0 border-x border-border bg-transparent text-center text-base font-semibold text-ink focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setVolume((v) => v + 1)}
                aria-label="Tambah volume"
                className="flex w-12 items-center justify-center text-ink-muted hover:bg-surface-alt"
              >
                <Plus className="size-4" aria-hidden />
              </button>
            </div>
          </Field>
        </div>

        <div
          className={cn(
            "flex items-center justify-between rounded-xl border px-4 py-3.5 transition-colors",
            total > 0 ? "border-expense/20 bg-expense-soft" : "border-border bg-surface-alt"
          )}
          aria-live="polite"
        >
          <span className="text-sm font-medium text-ink-muted">Total Biaya</span>
          <span className={cn("num text-xl font-bold", total > 0 ? "text-expense" : "text-ink-faint")}>
            {formatRupiah(total)}
          </span>
        </div>

        <Field label="Pembeli / Penanggung Jawab" htmlFor="pembeli" required error={err("pembeli")}>
          <input
            id="pembeli"
            value={pembeli}
            onChange={(e) => setPembeli(e.target.value)}
            list="saran-pembeli"
            placeholder="Contoh: Made Santiasa"
            aria-invalid={!!err("pembeli") || undefined}
            aria-describedby={describedBy("pembeli", err("pembeli"))}
            className={inputClass}
          />
          <datalist id="saran-pembeli">
            {saranPembeli.map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
        </Field>

        <div className="pt-1">
          <Button type="submit" variant="danger" size="lg" loading={pending} className="w-full">
            {!pending && <Save aria-hidden />}
            {pending ? "Menyimpan…" : "Simpan Pengeluaran"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
