"use client";

import { useEffect } from "react";
import { RotateCw, TriangleAlert } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60dvh] items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md p-7 text-center sm:p-9">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-expense-soft text-expense">
          <TriangleAlert className="size-6" aria-hidden />
        </div>
        <h1 className="text-xl font-bold text-ink">Gagal memuat data</h1>
        <p className="mt-2 text-[0.9375rem] text-ink-muted">
          Koneksi ke database sedang bermasalah. Biasanya cukup dicoba sekali lagi.
        </p>
        {error.digest && <p className="num mt-3 text-xs text-ink-faint">Kode: {error.digest}</p>}
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button onClick={reset}>
            <RotateCw aria-hidden />
            Coba Lagi
          </Button>
          <Button href="/" variant="secondary">
            Kembali ke Dasbor
          </Button>
        </div>
      </Card>
    </div>
  );
}
