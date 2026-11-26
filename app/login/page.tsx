import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import Card from "@/components/ui/Card";
import { BackLink } from "@/components/ui/PageHeader";
import LoginForm from "@/components/LoginForm";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Masuk Admin" };

export default async function LoginPage() {
  if (await getSession()) redirect("/");

  return (
    <div className="mx-auto w-full max-w-md animate-fade-in px-4 py-6 sm:py-12">
      <BackLink label="Kembali ke Dasbor" />
      <Card className="p-6 sm:p-8">
        <div className="mb-6">
          <span className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-brand-soft text-brand">
            <ShieldCheck className="size-6" aria-hidden />
          </span>
          <h1 className="text-2xl font-bold text-ink">Masuk sebagai Admin</h1>
          <p className="mt-1 text-[0.9375rem] text-ink-muted">
            Khusus pengurus untuk mencatat transaksi dan mengelola anggota.
          </p>
        </div>
        <LoginForm />
      </Card>
      <p className="mt-5 text-center text-sm text-ink-faint">
        Warga dapat memantau kas tanpa perlu masuk.
      </p>
    </div>
  );
}
