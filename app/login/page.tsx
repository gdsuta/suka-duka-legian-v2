"use client";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md w-96 text-center">
          <div className="text-5xl mb-4">📧</div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">
            Cek Email Anda
          </h1>
          <p className="text-gray-500 text-sm">
            Link masuk telah dikirim ke{" "}
            <span className="font-semibold text-gray-700">{email}</span>.
            Klik link tersebut untuk masuk sebagai admin.
          </p>
          <button
            onClick={() => { setSent(false); setEmail(""); }}
            className="mt-6 text-sm text-blue-500 hover:underline"
          >
            Kirim ulang dengan email berbeda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Admin Login</h1>
          <p className="text-sm text-gray-500 mt-1">
            Masukkan email admin untuk menerima link masuk
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Admin
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@sukaduka.id"
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition font-medium disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Mengirim..." : "Kirim Link Masuk"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/" className="text-sm text-blue-500 hover:underline">
            ← Kembali ke Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
