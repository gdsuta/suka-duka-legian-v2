// Dibaca saat dipakai (bukan saat import) agar `next build` tidak gagal
// di lingkungan yang belum punya env — error muncul jelas saat runtime.
function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}\n` +
        `Set it in .env.local (local) or Vercel → Settings → Environment Variables.`
    );
  }
  return value;
}

export const env = {
  get databaseUrl() {
    return requireEnv("DATABASE_URL");
  },
  get authSecret() {
    const secret = requireEnv("AUTH_SECRET");
    if (secret.length < 32) {
      throw new Error("AUTH_SECRET must be at least 32 characters long.");
    }
    return secret;
  },
};
