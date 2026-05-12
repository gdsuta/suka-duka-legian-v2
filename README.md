# 💰 Suka Duka Legian — Finance Web App

A community finance management web application for **Suka Duka Legian**, a neighborhood mutual-aid community in Legian, Bali, Indonesia. This app tracks member dues, community income, and expenses — making financial data transparent and accessible to all 40 members.

Built entirely on free-tier services as a voluntary project.

---

## 🌐 Live App

**[https://suka-duka-legian.vercel.app](https://suka-duka-legian.vercel.app)**

---

## ✨ Features

### Public (All Members)
- 📊 **Live Dashboard** — Real-time view of current cash balance, total income, and total expenses
- 👥 **Member Directory** — Full list of all 40 community members and their addresses
- 📈 **Monthly Cash Flow Chart** — Bar chart comparing income vs. expenses per month
- 📋 **Data Tabs** — Organized views for monthly dues, gotong-royong fines, mandatory donations, and expenses
- 📱 **PWA Support** — Installable as a mobile app on Android and iOS

### Admin Only (Authenticated)
- 🔐 **Magic Link Login** — Passwordless authentication via email (Supabase Auth)
- ➕ **Record Income** — Log member payments by category (monthly dues, donations, fines, etc.)
- ➕ **Record Expenses** — Log community purchases with vendor, quantity, and unit price
- ➕ **Add Members** — Register new community members
- ✏️ **Manage Members** — Edit or delete existing members (with smart FK-safe deletion)
- 🗑️ **Transaction History** — View and delete income/expense records
- 📄 **PDF Export** — Generate two report types:
  - Cash summary report (landscape, with expense breakdown)
  - Member payment compliance report (landscape, color-coded Lunas/Belum Bayar)

---

## 🛠️ Tech Stack

| Layer | Technology | Cost |
|---|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router) | Free |
| UI Library | [React 19](https://react.dev) | Free |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) | Free |
| Database & Auth | [Supabase](https://supabase.com) (Free tier) | Free |
| Hosting | [Vercel](https://vercel.com) (Free tier) | Free |
| Charts | [Recharts](https://recharts.org) | Free |
| PDF Export | [jsPDF](https://github.com/parallax/jsPDF) + [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable) | Free |
| Toasts | [Sonner](https://sonner.emilkowal.ski) | Free |
| Validation | [Zod](https://zod.dev) | Free |
| PWA | [@ducanh2912/next-pwa](https://github.com/DuCanhGH/next-pwa) | Free |

**Total monthly cost: Rp 0**

---

## 🗄️ Database Schema

Built on Supabase (PostgreSQL). Three main tables:

```sql
-- Community members
CREATE TABLE public.anggota (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama_lengkap text NOT NULL,
  alamat       text,
  created_at   timestamp DEFAULT now()
);

-- Income records (dues, donations, fines)
CREATE TABLE public.pemasukan (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  anggota_id   uuid REFERENCES public.anggota(id),
  kategori     text NOT NULL,
  jumlah       numeric NOT NULL,
  periode_bulan date,
  tanggal_bayar timestamp DEFAULT now()
);

-- Expense records (purchases, operational costs)
CREATE TABLE public.pengeluaran (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_barang  text NOT NULL,
  tanggal      date,
  vendor       text,
  harga_satuan numeric,
  volume       integer DEFAULT 1,
  total_biaya  numeric NOT NULL,
  pembeli      text
);
```

---

## 📁 Project Structure

```
suka-duka-legian-v2/
├── app/                              # Next.js App Router — routes only
│   ├── page.tsx                      # Public dashboard
│   ├── layout.tsx                    # Root layout with Toaster
│   ├── loading.tsx                   # Dashboard skeleton loader
│   ├── error.tsx                     # Global error boundary
│   ├── login/
│   │   └── page.tsx                  # Admin magic link login
│   ├── auth/
│   │   └── callback/route.ts         # Supabase auth callback handler
│   └── admin/                        # Protected routes (auth required)
│       ├── layout.tsx                # Server-side auth guard
│       ├── catat-pemasukan/          # Record income
│       ├── catat-pengeluaran/        # Record expenses
│       ├── tambah-anggota/           # Add new member
│       ├── kelola-anggota/           # Edit / delete members
│       └── riwayat-transaksi/        # Transaction history
├── components/                       # Reusable UI components
│   ├── ControlPanel.tsx              # Top navigation bar (admin/public mode)
│   ├── DataTabs.tsx                  # Tabbed data tables
│   ├── GrafikBulanan.tsx             # Monthly bar chart
│   └── TombolEkspor.tsx             # PDF export buttons
├── lib/
│   ├── supabase/
│   │   ├── server.ts                 # Server-side Supabase client (SSR)
│   │   └── client.ts                 # Browser-side Supabase client
│   ├── env.ts                        # Runtime environment variable validation
│   ├── config.ts                     # App constants (member cap, categories)
│   └── schemas.ts                    # Zod validation schemas
├── middleware.ts                     # Route protection for /admin/*
├── public/
│   ├── logo.png                      # Community logo
│   ├── icon-192.png                  # PWA icon (192×192)
│   ├── icon-512.png                  # PWA icon (512×512)
│   └── manifest.json                 # PWA manifest
├── CLAUDE.md                         # AI assistant conventions for this project
└── .env.local.example                # Environment variable template
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org) v18 or higher
- A [Supabase](https://supabase.com) account (free)
- A [Vercel](https://vercel.com) account (free)

### 1. Clone the repository

```bash
git clone https://github.com/gdsuta/suka-duka-legian-v2.git
cd suka-duka-legian-v2
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the example file and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
```

Open `.env.local` and add your values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE
```

Find these values in your Supabase Dashboard under **Project Settings → API**.

### 4. Set up the database

Run the SQL statements from the [Database Schema](#️-database-schema) section above in your Supabase SQL Editor (**Database → SQL Editor → New Query**).

### 5. Configure Supabase Auth

In your Supabase Dashboard:
1. Go to **Authentication → Providers → Email** → Enable **Magic Links**
2. Go to **Authentication → URL Configuration**:
   - Set **Site URL** to `http://localhost:3000` (for local dev) or your Vercel URL (for production)
   - Add `http://localhost:3000/**` to **Redirect URLs**
3. Go to **Authentication → Users → Invite User** → invite your admin email

### 6. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Authentication Flow

This app uses **Supabase Magic Link** (passwordless email OTP):

1. Admin clicks **Mode Admin** on the dashboard
2. Admin enters their email on the `/login` page
3. Supabase sends a one-click login link to that email
4. Admin clicks the link → redirected to `/auth/callback` → session created
5. Dashboard reloads in **Admin Mode** with full write access
6. Admin clicks **🔒 Kunci** to log out

All routes under `/admin/*` are protected by both `middleware.ts` (edge-level) and `app/admin/layout.tsx` (server-level), providing double-layer protection.

---

## 🚢 Deployment

This app is deployed on **Vercel** with automatic deployments on every push to `main`.

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → Import your GitHub repo
3. Add environment variables in Vercel Dashboard → **Settings → Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

### After deploying, update Supabase:

In **Authentication → URL Configuration**:
- Update **Site URL** to `https://your-app.vercel.app`
- Add `https://your-app.vercel.app/**` to **Redirect URLs**

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

---

## 🤝 Contributing

This is a voluntary community project. If you'd like to contribute or report issues, please open an issue or pull request on GitHub.

---

## 👨‍💻 Developer

**Gede Suta Pinatih**
Voluntary community developer, Legian, Bali 🌴

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
