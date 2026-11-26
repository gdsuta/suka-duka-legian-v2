import { SearchX } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function NotFound() {
  return (
    <div className="flex min-h-[60dvh] items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md p-7 text-center sm:p-9">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-surface-alt text-ink-faint">
          <SearchX className="size-6" aria-hidden />
        </div>
        <h1 className="text-xl font-bold text-ink">Halaman tidak ditemukan</h1>
        <p className="mt-2 text-[0.9375rem] text-ink-muted">Alamat yang Anda buka tidak tersedia.</p>
        <Button href="/" className="mt-6">
          Kembali ke Dasbor
        </Button>
      </Card>
    </div>
  );
}
