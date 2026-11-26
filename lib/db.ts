import "server-only";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { env } from "@/lib/env";

let client: NeonQueryFunction<false, false> | null = null;

/**
 * Klien SQL Neon (HTTP). Hanya untuk Server Components, Server Actions,
 * dan route handlers — jangan pernah di-import dari 'use client'.
 *
 *   const rows = await db()`SELECT * FROM anggota WHERE id = ${id}`;
 *
 * Nilai di dalam ${...} otomatis dikirim sebagai parameter (aman dari SQL injection).
 */
export function db() {
  client ??= neon(env.databaseUrl);
  return client;
}
