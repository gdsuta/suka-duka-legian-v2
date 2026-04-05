# CLAUDE.md — Panduan Proyek Suka Duka Legian

## Tentang Proyek
Aplikasi pencatatan keuangan komunitas Suka Duka Legian, Bali.
Stack: Next.js 16 · React 19 · Supabase · Tailwind CSS v4 · Vercel · PWA

---

## Struktur Folder

```
suka-duka-legian/
├── app/                        ← Hanya untuk routing (page.tsx, layout.tsx, route.ts)
│   ├── page.tsx                ← Dashboard publik (read-only)
│   ├── layout.tsx              ← Root layout + Toaster
│   ├── loading.tsx             ← Skeleton loader
│   ├── error.tsx               ← Error boundary
│   ├── login/page.tsx          ← Halaman login admin (magic link)
│   ├── auth/callback/route.ts  ← Handler redirect Supabase
│   └── admin/                  ← Semua route yang butuh autentikasi
│       ├── layout.tsx          ← Auth guard — redirect ke /login jika belum login
│       ├── catat-pemasukan/
│       ├── catat-pengeluaran/
│       ├── tambah-anggota/
│       └── riwayat-transaksi/
├── components/                 ← Semua komponen UI (bukan di app/)
│   ├── ControlPanel.tsx
│   ├── DataTabs.tsx
│   ├── TombolEkspor.tsx
│   └── GrafikBulanan.tsx
├── lib/
│   ├── supabase/
│   │   ├── server.ts           ← Gunakan di Server Components & route handlers
│   │   └── client.ts           ← Gunakan di 'use client' components
│   ├── env.ts                  ← Validasi env vars saat startup
│   ├── config.ts               ← Konstanta (JUMLAH_ANGGOTA_MAKSIMAL, dll)
│   └── schemas.ts              ← Zod schemas untuk semua form
└── middleware.ts               ← Proteksi route /admin/*
```

---

## Aturan Penting

### Autentikasi
- Auth menggunakan **Supabase Magic Link** (bukan PIN localStorage)
- Route publik: `/` (dashboard read-only), `/login`
- Route admin: semua di bawah `/admin/*` — dilindungi oleh `middleware.ts` dan `app/admin/layout.tsx`
- Untuk cek sesi di Server Component: gunakan `createSupabaseServerClient()` dari `lib/supabase/server.ts`
- Untuk cek sesi di Client Component: gunakan `createSupabaseBrowserClient()` dari `lib/supabase/client.ts`

### Supabase Client
- **JANGAN** import dari `lib/supabase.ts` (file lama — sudah dihapus)
- Server Component → `import { createSupabaseServerClient } from "@/lib/supabase/server"`
- Client Component → `import { createSupabaseBrowserClient } from "@/lib/supabase/client"`

### Validasi Form
- Semua form wajib divalidasi dengan **Zod** sebelum dikirim ke Supabase
- Schema ada di `lib/schemas.ts`: `PemasukanSchema`, `PengeluaranSchema`, `AnggotaSchema`

### Notifikasi
- Gunakan **sonner** (`import { toast } from "sonner"`) untuk semua feedback aksi
- Jangan gunakan `alert()` atau `window.confirm()` — ganti dengan `toast.warning()` + action

### Komponen
- Semua komponen UI ada di `components/` — **jangan taruh di `app/`**
- Import dengan alias: `@/components/NamaKomponen`

### Konstanta
- Batas anggota: `JUMLAH_ANGGOTA_MAKSIMAL` dari `lib/config.ts`
- Kategori pemasukan: `KATEGORI_PEMASUKAN` dari `lib/config.ts`
- Jangan hardcode nilai-nilai ini langsung di komponen

### Performa
- `app/page.tsx` punya `export const revalidate = 60` — cache 60 detik
- Semua query Supabase di Server Components dijalankan **paralel** dengan `Promise.all`
- Gunakan `next/image` (`<Image>`) — bukan `<img>` biasa

### TypeScript Database Types
Jika schema Supabase berubah, regenerate types:
```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/database.types.ts
```
Lalu update client di `lib/supabase/server.ts` dan `lib/supabase/client.ts` untuk menggunakannya.

---

## Environment Variables
Buat file `.env.local` di root proyek:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

---

## Menjalankan Proyek
```bash
npm install
npm run dev
```
