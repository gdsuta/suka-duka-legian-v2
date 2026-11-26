"use server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { endSession, startSession } from "@/lib/auth";
import { getDummyHash, verifyPassword } from "@/lib/password";
import { LoginSchema } from "@/lib/schemas";

export interface LoginState {
  error?: string;
  email?: string;
}

const BATAS_GAGAL = 5;
const JENDELA_MENIT = 15;

export async function login(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  const emailInput = String(formData.get("email") ?? "");

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Isian tidak valid.",
      email: emailInput,
    };
  }

  const { email, password } = parsed.data;
  const sql = db();

  const [{ gagal }] = await sql`
    SELECT count(*)::int AS gagal FROM login_attempts
    WHERE email = ${email} AND success = false
      AND attempted_at > now() - interval '15 minutes'`; // = JENDELA_MENIT

  if (gagal >= BATAS_GAGAL) {
    return {
      error: `Terlalu banyak percobaan gagal. Coba lagi dalam ${JENDELA_MENIT} menit.`,
      email,
    };
  }

  const [admin] = await sql`
    SELECT id, email, password_hash FROM admin_users WHERE email = ${email}`;

  // Tetap jalankan verifikasi walau email tidak ada, agar waktu respons sama.
  const valid = await verifyPassword(
    password,
    admin?.password_hash ?? (await getDummyHash())
  );
  const berhasil = Boolean(admin) && valid;

  await sql`INSERT INTO login_attempts (email, success) VALUES (${email}, ${berhasil})`;

  if (!berhasil) {
    return { error: "Email atau password salah.", email };
  }

  // Bersihkan riwayat lama sesekali agar tabel tetap kecil
  await sql`DELETE FROM login_attempts WHERE attempted_at < now() - interval '30 days'`;

  await startSession({ sub: admin.id, email: admin.email });
  redirect("/");
}

export async function logout() {
  await endSession();
  redirect("/");
}
