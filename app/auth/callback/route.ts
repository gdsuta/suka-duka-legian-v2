import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Login berhasil — arahkan ke halaman utama
      return NextResponse.redirect(`${origin}/`);
    }
  }

  // Jika ada error, arahkan kembali ke login
  return NextResponse.redirect(`${origin}/login?error=link_invalid`);
}
