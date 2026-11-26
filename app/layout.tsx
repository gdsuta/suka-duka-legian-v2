import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import AppHeader from "@/components/AppHeader";
import AdminNav from "@/components/AdminNav";
import { getSession } from "@/lib/auth";
import { cn } from "@/lib/cn";
import "./globals.css";

// Plus Jakarta Sans — tipografi buatan Tokotype (Indonesia), font variabel 200–800
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Suka Duka Legian — Kas Warga",
    template: "%s · Suka Duka Legian",
  },
  description: "Pencatatan iuran dan kas warga Suka Duka Legian yang transparan.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: "Suka Duka", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await getSession();
  const isAdmin = Boolean(session);

  return (
    <html lang="id" className={jakarta.variable}>
      <body className="flex min-h-dvh flex-col bg-bg text-ink antialiased">
        <a
          href="#konten"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2 focus:shadow-raised"
        >
          Lewati ke konten
        </a>

        <AppHeader adminEmail={session?.email ?? null} />

        <main id="konten" className="flex-1">
          {children}
        </main>

        {/* Saat admin, sisakan ruang untuk tab bar bawah di mobile */}
        <footer
          className={cn(
            "border-t border-border",
            isAdmin && "pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0"
          )}
        >
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-1 px-4 py-6 text-center text-xs text-ink-faint sm:flex-row sm:px-6 sm:text-left">
            <p>
              Dikembangkan oleh <span className="font-semibold text-ink-muted">Gede Suta Pinatih</span>
            </p>
            <p>Suka Duka Legian · v3.0.0</p>
          </div>
        </footer>

        {isAdmin && <AdminNav variant="bottom" />}

        <Toaster
          position="top-center"
          richColors
          closeButton
          toastOptions={{ style: { fontFamily: "var(--font-jakarta)" } }}
        />
      </body>
    </html>
  );
}
