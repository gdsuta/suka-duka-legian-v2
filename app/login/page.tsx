"use client";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import Card from "@/components/ui/Card";
import Field, { inputClass } from "@/components/ui/Field";
import Button from "@/components/ui/Button";
import { MailIcon, ArrowLeftIcon } from "@/components/ui/icons";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const supabase = createSupabaseBrowserClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-8 w-full max-w-sm text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-brand-soft flex items-center justify-center">
            <MailIcon className="h-6 w-6 text-brand" />
          </div>
          <h1 className="font-heading text-xl font-semibold text-ink mb-2">
            Cek Email Anda
          </h1>
          <p className="text-ink-muted text-sm">
            Link masuk telah dikirim ke{" "}
            <span className="font-semibold text-ink">{email}</span>. Klik
            link tersebut untuk masuk sebagai admin.
          </p>
          <button
            onClick={() => {
              setSent(false);
              setEmail("");
            }}
            className="mt-6 text-sm text-brand hover:underline font-medium"
          >
            Kirim ulang dengan email berbeda
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="font-heading text-2xl font-semibold text-ink">
            Admin Login
          </h1>
          <p className="text-sm text-ink-muted mt-1">
            Masukkan email admin untuk menerima link masuk
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <Field label="Email Admin" htmlFor="email" required>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@sukaduka.id"
              className={inputClass}
            />
          </Field>

          {error && (
            <p className="text-expense text-sm bg-expense-soft p-3 rounded-md">
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Mengirim..." : "Kirim Link Masuk"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <a
            href="/"
            className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-brand transition-colors"
          >
            <ArrowLeftIcon className="h-3.5 w-3.5" />
            Kembali ke Dashboard
          </a>
        </div>
      </Card>
    </div>
  );
}
