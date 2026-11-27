# CLAUDE.md — Panduan Proyek Suka Duka Legian

## Tentang Proyek
Aplikasi pencatatan keuangan komunitas Suka Duka Legian, Bali.
Stack: Next.js 16 · React 19 · Neon Postgres · Tailwind CSS v4 · Vercel · PWA

---

## Struktur Folder

```
suka-duka-legian/
├── app/                        ← Hanya routing (page.tsx, layout.tsx, loading.tsx)
│   ├── page.tsx                ← Dashboard publik (read-only, + Aksi Cepat bila admin)
│   ├── layout.tsx              ← Root layout: AppHeader, AdminNav, Toaster
│   ├── login/page.tsx          ← Login admin (email + password)
│   └── admin/                  ← Semua route yang butuh autentikasi
│       ├── layout.tsx          ← Auth guard — redirect ke /login jika belum login
│       ├── catat-pemasukan/
│       ├── catat-iuran/        ← Catat Iuran Sekaligus (grid buku catatan)
│       ├── catat-pengeluaran/
│       ├── tambah-anggota/
│       ├── kelola-anggota/
│       └── riwayat-transaksi/
├── components/                 ← Semua komponen UI (bukan di app/)
│   ├── ui/                     ← Primitif: Button, Card, Field, Badge, ChipGroup, InputRupiah, …
│   ├── dashboard/              ← SaldoHero, StatGrid, SumberPemasukan, PanelAdmin
│   ├── forms/                  ← FormPemasukan, FormPengeluaran, FormAnggota
│   └── AppHeader, AdminNav, DataTabs, GrafikBulanan, TombolEkspor, KelolaAnggota, RiwayatTransaksi
├── lib/
│   ├── db.ts                   ← Klien SQL Neon (server-only)
│   ├── queries.ts              ← Semua query baca (server-only)
│   ├── actions/                ← Server Actions: auth.ts, keuangan.ts, anggota.ts
│   ├── auth.ts                 ← getSession / requireAdmin / start/endSession (server-only)
│   ├── session.ts              ← Tanda tangan & verifikasi JWT (dipakai juga oleh proxy.ts)
│   ├── password.ts             ← Hash scrypt
│   ├── ringkasan.ts            ← Perhitungan saldo, per kategori, arus kas bulanan
│   ├── denda.ts · iuran.ts     ← Grid denda per kerja bakti & grid iuran anggota × bulan (murni, diuji)
│   ├── format.ts               ← formatRupiah, formatTanggal, formatPeriode (zona WITA)
│   ├── env.ts · config.ts · schemas.ts · types.ts
├── db/schema.sql               ← Skema database
├── scripts/                    ← db-setup, import-supabase, create-admin
└── proxy.ts                    ← Proteksi route /admin/* (pengganti middleware.ts di Next 16)
```

---

## Aturan Penting

### Database (Neon Postgres)
- Akses database **hanya dari server**: Server Components, Server Actions (`lib/actions/*`), route handlers
- Baca data lewat fungsi di `lib/queries.ts`; jangan import `lib/db.ts` dari komponen `'use client'`
- Gunakan tagged template agar nilai otomatis jadi parameter: ``db()`SELECT … WHERE id = ${id}` ``
- Kolom `numeric`/`date`/`timestamptz` dikonversi di SQL (`::float8`, `to_char`) agar hasilnya string/number biasa
- Perubahan skema: edit `db/schema.sql` (idempoten, `IF NOT EXISTS`) lalu `npm run db:setup`

### Autentikasi
- Admin login dengan **email + password** (tabel `admin_users`, hash scrypt), sesi = JWT di cookie HttpOnly `sdl_session`
- Buat/ganti password admin: `npm run admin:create -- email@contoh.com "password"`
- Route publik: `/`, `/login`. Route admin `/admin/*` dilindungi `proxy.ts` **dan** `app/admin/layout.tsx`
- **Setiap Server Action yang mengubah data wajib memanggil `await requireAdmin()` di baris pertama**
- Login dibatasi 5 percobaan gagal / 15 menit per email (tabel `login_attempts`)

### Validasi Form
- Semua input divalidasi dengan **Zod** di Server Action (sumber kebenaran), schema di `lib/schemas.ts`
- `total_biaya` pengeluaran dihitung di server, bukan dari browser

### Notifikasi
- Gunakan **sonner** (`import { toast } from "sonner"`) untuk semua feedback aksi
- Jangan gunakan `alert()` atau `window.confirm()` — ganti dengan `toast.warning()` + action

### Komponen & Desain
- Semua komponen UI ada di `components/` — **jangan taruh di `app/`**; import dengan alias `@/components/…`
- Font: **Plus Jakarta Sans** (`--font-jakarta`). Ukuran dasar 16px; minimum 12px untuk label mikro
- Warna hanya lewat token di `app/globals.css` (`bg-brand`, `text-income`, `text-ink-muted`, …) — jangan hex mentah di komponen (kecuali Recharts/jsPDF yang butuh nilai langsung)
- Angka uang: `formatRupiah()` dari `lib/format.ts` + utilitas `num` (tabular-nums)
- Ikon: `lucide-react`, ikon dekoratif diberi `aria-hidden`; tombol ikon wajib `aria-label`
- Target sentuh minimal 44px (`size="md"`/`size="icon"` pada Button)

### Konstanta
- Batas anggota: `JUMLAH_ANGGOTA_MAKSIMAL`, kategori: `KATEGORI_PEMASUKAN`, `KATEGORI_BERPERIODE`, `WARNA_KATEGORI`, `KATEGORI_PENGELUARAN`, `WARNA_KATEGORI_PENGELUARAN`, `TANPA_KATEGORI` dari `lib/config.ts`
- Denda dikelompokkan per tanggal kerja bakti (`periode_bulan`), bukan tanggal bayar — lihat `susunGridDenda` di `lib/denda.ts`
- Jangan hardcode nilai-nilai ini langsung di komponen

### Performa
- Query di Server Components dijalankan **paralel** dengan `Promise.all`
- Setelah mutasi, Server Action memanggil `revalidatePath("/", "layout")`
- jsPDF dimuat dinamis hanya saat tombol ekspor ditekan
- Gunakan `next/image` (`<Image>`) — bukan `<img>` biasa

---

## Environment Variables
Salin `.env.example` ke `.env.local`:
```
DATABASE_URL=postgresql://…-pooler….neon.tech/neondb?sslmode=require
AUTH_SECRET=<acak ≥ 32 karakter>
```

---

## Menjalankan Proyek
```bash
npm install
npm run db:setup                     # sekali, buat tabel
npm run admin:create -- email "pw"   # buat akun admin
npm run dev
npm run typecheck                    # cek tipe TypeScript
npm test                             # unit test (Vitest) untuk logika di lib/
npm run db:backfill-kategori         # uji coba isi kategori pengeluaran lama (tambah -- --apply untuk menyimpan)
```
