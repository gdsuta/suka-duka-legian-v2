# 💰 Suka Duka Legian — Finance Web App

A community finance management web application for **Suka Duka Legian**, a neighborhood mutual-aid community at Perumahan Bali Erfina, Jalan Legian, Desa Bungkulan, Kecamatan Sawan, Kabupaten Buleleng, Bali, Indonesia. This app tracks member dues, community income, and expenses — making financial data transparent and accessible to all community members.

Built entirely on free-tier services as a voluntary project.

---

## 🌐 Live App

**[https://suka-duka-legian.vercel.app](https://suka-duka-legian.vercel.app)**

---

## ✨ Features

### Public (All Members)
- 📊 **Live Dashboard** — Cash balance, income/expense totals, this month's dues compliance, income-source breakdown
- 👥 **Member Directory** — Full list of all community members and their addresses
- 📈 **Monthly Cash Flow Chart** — Bar chart comparing income vs. expenses per month
- 📋 **Data Tabs** — Organized views for monthly dues, mandatory donations, and expenses
- ✅ **Fines per Kerja Bakti** — Members × kerja bakti dates grid; tap an amount to see when it was paid
- 🧾 **Where the Money Went** — Spending summarised by purpose (lighting, cleaning, facilities, refreshments, …)
- 🔎 **Search & Totals** — Every data tab is searchable with a running total
- 📱 **PWA Support** — Installable as a mobile app on Android and iOS

### Admin Only (Authenticated)
- 🔐 **Email + Password Login** — Hashed (scrypt) admin accounts, HttpOnly session cookie, brute-force throttling
- ➕ **Record Income** — Category chips, month picker, suggested amounts, duplicate-payment warning
- 📒 **Batch Iuran Entry** — Logbook-style members × months grid: tick paid months, check the running total, save the whole page at once (already-recorded months are locked and never duplicated)
- ➕ **Record Expenses** — Required category, live total, volume stepper, buyer suggestions (total computed server-side)
- ➕ **Add Members** — Register new community members
- ✏️ **Manage Members** — Search, inline edit, delete with full payment history (single transaction)
- 🗑️ **Transaction History** — Filter by type/category, search, delete
- 📄 **PDF Export** — Cash report with spending per category, and member report (Lunas/Belum Bayar + fines grid for the last 6 kerja bakti)

---

## 🛠️ Tech Stack

| Layer | Technology | Cost |
|---|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router, Server Actions) | Free |
| UI Library | [React 19](https://react.dev) | Free |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) + [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) | Free |
| Database | [Neon](https://neon.tech) serverless Postgres (Free plan — scales to zero, never paused) | Free |
| Auth | Built-in: scrypt password hashes + signed JWT cookie ([jose](https://github.com/panva/jose)) | Free |
| Hosting | [Vercel](https://vercel.com) (Free tier) | Free |
| Charts | [Recharts](https://recharts.org) | Free |
| Icons | [Lucide](https://lucide.dev) | Free |
| PDF Export | [jsPDF](https://github.com/parallax/jsPDF) + [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable) | Free |
| Toasts | [Sonner](https://sonner.emilkowal.ski) | Free |
| Validation | [Zod](https://zod.dev) | Free |
| PWA | [@ducanh2912/next-pwa](https://github.com/DuCanhGH/next-pwa) | Free |

**Total monthly cost: Rp 0**

> **Why Neon instead of Supabase?** Supabase free projects are paused after 7 days without activity and must be restored by hand. Neon's free compute only *idles* after 5 minutes and wakes automatically on the next request (≈0.5 s), so the app never goes offline.

---

## 🗄️ Database Schema

See [`db/schema.sql`](db/schema.sql). Tables: `anggota` (members), `pemasukan` (income), `pengeluaran` (expenses), `admin_users`, `login_attempts`.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org) v20.6 or higher
- A [Neon](https://neon.tech) database (free) — easiest via Vercel → Storage → Neon
- A [Vercel](https://vercel.com) account (free)

### 1. Clone & install

```bash
git clone https://github.com/gdsuta/suka-duka-legian-v2.git
cd suka-duka-legian-v2
npm install
```

### 2. Environment variables

```bash
cp .env.example .env.local
```

Fill in `DATABASE_URL` (Neon pooled connection string) and `AUTH_SECRET` (random, ≥ 32 characters):

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

### 3. Create tables, (optionally) import data, create an admin

```bash
npm run db:setup
npm run db:import          # only when migrating: imports db/backup/*.json (not committed)
npm run admin:create -- you@example.com "a-strong-password"
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 🔐 Authentication Flow

1. Admin taps **Masuk Admin** in the header
2. Enters email + password on `/login` (5 failed attempts per 15 minutes per email are blocked)
3. Server verifies the scrypt hash and sets a signed, HttpOnly session cookie (7 days)
4. Dashboard shows **Aksi Cepat** and the admin navigation (bottom tab bar on mobile)
5. **Keluar** clears the session

`/admin/*` is protected by `proxy.ts` and `app/admin/layout.tsx`, and every Server Action that writes data re-checks the session with `requireAdmin()`.

---

## 🚢 Deployment

Deployed on **Vercel** with automatic deployments on every push to `main`.

1. Vercel Dashboard → your project → **Storage** → **Create Database** → **Neon** → connect it to the project (this sets `DATABASE_URL`)
2. **Settings → Environment Variables** → add `AUTH_SECRET`
3. Run `npm run db:setup` and `npm run admin:create` once against that database (with the same `DATABASE_URL` in `.env.local`)
4. Push to `main`

---

## 📱 PWA Installation

The app is installable as a standalone mobile app:

- **Android (Chrome):** Tap the browser menu → *Add to Home Screen*
- **iOS (Safari):** Tap the Share button → *Add to Home Screen*

Once installed, the app runs in standalone mode without browser UI, similar to a native app.

---

## 📊 Income Categories

| Category (Bahasa) | Description |
|---|---|
| Iuran Bulanan | Monthly member dues |
| Sumbangan Wajib | Mandatory one-time donation |
| Donasi Sukarela | Voluntary donation |
| Denda Gotong-Royong | Fine for missing community work day |
| Sumbangan Awal | Initial joining contribution |

## 🧾 Expense Categories

Penerangan Jalan · Kebersihan Lingkungan · Fasilitas Umum · Konsumsi · Acara & Perayaan · Sosial & Duka · Administrasi & Lainnya — defined in `lib/config.ts` (`KATEGORI_PENGELUARAN`).

---

## 🤝 Contributing

This is a voluntary community project. If you'd like to contribute or report issues, please open an issue or pull request on GitHub.

---

## 👨‍💻 Developer

**Gede Suta Pinatih**
Voluntary community developer, Nusa Penida, Bali 🌴

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
