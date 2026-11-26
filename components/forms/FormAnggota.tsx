"use client";
import { useRef, useState, useTransition } from "react";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Field, { describedBy, inputClass, textareaClass } from "@/components/ui/Field";
import { tambahAnggota } from "@/lib/actions/anggota";
import { JUMLAH_ANGGOTA_MAKSIMAL } from "@/lib/config";

type Errors = Record<string, string[] | undefined>;

export default function FormAnggota({ jumlahAnggota }: { jumlahAnggota: number }) {
  const [nama, setNama] = useState("");
  const [alamat, setAlamat] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [pending, startTransition] = useTransition();
  const namaRef = useRef<HTMLInputElement>(null);
  const err = (k: string) => errors[k]?.[0];
  const penuh = jumlahAnggota >= JUMLAH_ANGGOTA_MAKSIMAL;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    startTransition(async () => {
      const res = await tambahAnggota({ nama_lengkap: nama, alamat });
      if (!res.ok) {
        setErrors(res.fieldErrors ?? {});
        toast.error(res.message);
        return;
      }
      toast.success(res.message);
      setNama("");
      setAlamat("");
      namaRef.current?.focus();
    });
  };

  return (
    <Card className="max-w-2xl p-5 sm:p-7">
      {penuh && (
        <p className="mb-5 rounded-xl bg-gold-soft px-4 py-3 text-sm text-gold" role="status">
          Jumlah anggota ({jumlahAnggota}) sudah mencapai batas {JUMLAH_ANGGOTA_MAKSIMAL}. Anda tetap bisa
          menambah anggota bila memang diperlukan.
        </p>
      )}
      <form onSubmit={submit} className="space-y-5" noValidate>
        <Field label="Nama Lengkap" htmlFor="nama" required error={err("nama_lengkap")}>
          <input
            ref={namaRef}
            id="nama"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            autoComplete="off"
            placeholder="Contoh: I Wayan Suka"
            aria-invalid={!!err("nama_lengkap") || undefined}
            aria-describedby={describedBy("nama", err("nama_lengkap"))}
            className={inputClass}
          />
        </Field>
        <Field label="Alamat" htmlFor="alamat" required error={err("alamat")}>
          <textarea
            id="alamat"
            value={alamat}
            onChange={(e) => setAlamat(e.target.value)}
            rows={3}
            placeholder="Contoh: Legian II No. 10"
            aria-invalid={!!err("alamat") || undefined}
            aria-describedby={describedBy("alamat", err("alamat"))}
            className={textareaClass}
          />
        </Field>
        <div className="pt-1">
          <Button type="submit" size="lg" loading={pending} className="w-full">
            {!pending && <UserPlus aria-hidden />}
            {pending ? "Menyimpan…" : "Simpan Anggota"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
