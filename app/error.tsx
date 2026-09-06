"use client";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { WarningIcon } from "@/components/ui/icons";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="text-center p-8 sm:p-10 max-w-md w-full">
        <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-expense-soft flex items-center justify-center">
          <WarningIcon className="h-6 w-6 text-expense" />
        </div>
        <h2 className="font-heading text-xl font-semibold text-ink mb-2">
          Terjadi Kesalahan
        </h2>
        <p className="text-ink-muted mb-6 text-sm">{error.message}</p>
        <Button onClick={reset}>Coba Lagi</Button>
        <div className="mt-4">
          <a href="/" className="text-sm text-ink-muted hover:text-brand transition-colors">
            ← Kembali ke Dashboard
          </a>
        </div>
      </Card>
    </div>
  );
}
