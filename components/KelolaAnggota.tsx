"use client";
import { useDeferredValue, useState, useTransition } from "react";
import { Check, Pencil, Search, Trash2, TriangleAlert, Users, X } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import { inputClass } from "@/components/ui/Field";
import { hapusAnggota, ubahAnggota } from "@/lib/actions/anggota";
import { formatRupiah } from "@/lib/format";
import { cn } from "@/lib/cn";

export interface BarisAnggota {
  id: string;
  nama_lengkap: string;
  alamat: string | null;
  jumlahTransaksi: number;
  totalBayar: number;
}

function inisial(nama: string) {
  return nama
    .replace(/\(.*?\)/g, "")
    .split(/\s+/)
    .filter((w) => w && !["I", "Ni", "Luh", "Made", "Putu", "Kadek", "Komang", "Ketut", "Gede", "Wayan", "Nyoman"].includes(w))
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || nama[0]?.toUpperCase() || "?";
}

function BarisEdit({ a, onSelesai }: { a: BarisAnggota; onSelesai: () => void }) {
  const [nama, setNama] = useState(a.nama_lengkap);
  const [alamat, setAlamat] = useState(a.alamat ?? "");
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});
  const [pending, startTransition] = useTransition();

  const simpan = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await ubahAnggota(a.id, { nama_lengkap: nama, alamat });
      if (!res.ok) {
        setErrors(res.fieldErrors ?? {});
        toast.error(res.message);
        return;
      }
      toast.success(res.message);
      onSelesai();
    });
  };

  return (
    <form onSubmit={simpan} className="space-y-3 bg-brand-soft/50 p-4 sm:px-5" onKeyDown={(e) => e.key === "Escape" && onSelesai()}>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor={`nama-${a.id}`} className="mb-1 block text-xs font-medium text-ink-muted">
            Nama lengkap
          </label>
          <input
            id={`nama-${a.id}`}
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            autoFocus
            aria-invalid={!!errors.nama_lengkap || undefined}
            className={cn(inputClass, "h-11")}
          />
          {errors.nama_lengkap && <p className="mt-1 text-sm text-expense">{errors.nama_lengkap[0]}</p>}
        </div>
        <div>
          <label htmlFor={`alamat-${a.id}`} className="mb-1 block text-xs font-medium text-ink-muted">
            Alamat
          </label>
          <input
            id={`alamat-${a.id}`}
            value={alamat}
            onChange={(e) => setAlamat(e.target.value)}
            aria-invalid={!!errors.alamat || undefined}
            className={cn(inputClass, "h-11")}
          />
          {errors.alamat && <p className="mt-1 text-sm text-expense">{errors.alamat[0]}</p>}
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" size="sm" onClick={onSelesai}>
          <X aria-hidden /> Batal
        </Button>
        <Button type="submit" size="sm" loading={pending}>
          {!pending && <Check aria-hidden />} Simpan
        </Button>
      </div>
    </form>
  );
}

export default function KelolaAnggota({ anggota }: { anggota: BarisAnggota[] }) {
  const [query, setQuery] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [menghapus, setMenghapus] = useState<string | null>(null);
  const q = useDeferredValue(query).trim().toLowerCase();

  const tampil = q
    ? anggota.filter((a) => `${a.nama_lengkap} ${a.alamat ?? ""}`.toLowerCase().includes(q))
    : anggota;

  const hapus = async (a: BarisAnggota) => {
    setMenghapus(a.id);
    const res = await hapusAnggota(a.id);
    setMenghapus(null);
    if (res.ok) toast.success(res.message);
    else toast.error(res.message);
  };

  const konfirmasiHapus = (a: BarisAnggota) => {
    const punyaRiwayat = a.jumlahTransaksi > 0;
    toast.warning(
      punyaRiwayat
        ? `${a.nama_lengkap} memiliki ${a.jumlahTransaksi} riwayat pembayaran`
        : `Hapus ${a.nama_lengkap}?`,
      {
        description: punyaRiwayat
          ? `Seluruh riwayat (${formatRupiah(a.totalBayar)}) ikut terhapus permanen dan saldo kas berkurang. Tidak dapat dibatalkan.`
          : "Aksi ini tidak dapat dibatalkan.",
        duration: 12000,
        action: { label: punyaRiwayat ? "Hapus semua" : "Ya, hapus", onClick: () => hapus(a) },
        cancel: { label: "Batal", onClick: () => {} },
      }
    );
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-[1.125rem] -translate-y-1/2 text-ink-faint" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari nama atau alamat…"
          aria-label="Cari anggota"
          className={cn(inputClass, "pl-10 sm:max-w-sm")}
        />
      </div>

      <Card className="overflow-hidden">
        {tampil.length === 0 ? (
          <EmptyState
            icon={q ? Search : Users}
            title={q ? "Tidak ada yang cocok" : "Belum ada anggota"}
            description={q ? `Tidak ada anggota dengan kata "${query}".` : "Tambahkan anggota pertama."}
          />
        ) : (
          <ul className="divide-y divide-border">
            {tampil.map((a) =>
              editId === a.id ? (
                <li key={a.id}>
                  <BarisEdit a={a} onSelesai={() => setEditId(null)} />
                </li>
              ) : (
                <li
                  key={a.id}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-alt/40 sm:gap-4 sm:px-5",
                    menghapus === a.id && "pointer-events-none opacity-50"
                  )}
                >
                  <span
                    className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm font-bold text-brand-dark"
                    aria-hidden
                  >
                    {inisial(a.nama_lengkap)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-ink">{a.nama_lengkap}</p>
                    <p className="truncate text-sm text-ink-muted">
                      {a.alamat || <span className="italic text-ink-faint">Tanpa alamat</span>}
                    </p>
                  </div>
                  <div className="hidden shrink-0 text-right md:block">
                    <p className="num text-sm font-semibold text-ink">{formatRupiah(a.totalBayar)}</p>
                    <p className="text-xs text-ink-faint">{a.jumlahTransaksi} transaksi</p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditId(a.id)}
                      aria-label={`Ubah ${a.nama_lengkap}`}
                      title="Ubah"
                    >
                      <Pencil aria-hidden />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => konfirmasiHapus(a)}
                      aria-label={`Hapus ${a.nama_lengkap}`}
                      title="Hapus"
                      className="hover:bg-expense-soft hover:text-expense"
                    >
                      <Trash2 aria-hidden />
                    </Button>
                  </div>
                </li>
              )
            )}
          </ul>
        )}
      </Card>

      <p className="flex items-start justify-center gap-2 text-center text-sm text-ink-faint">
        <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
        Menghapus anggota yang memiliki riwayat pembayaran juga menghapus seluruh transaksinya.
      </p>
    </div>
  );
}
