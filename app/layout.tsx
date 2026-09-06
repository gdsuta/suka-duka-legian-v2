import type { Metadata, Viewport } from "next";
import { Fraunces, Public_Sans } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["500", "600", "700"],
  display: "swap",
});

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-public-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Suka Duka Legian Finance",
  description: "Sistem Pencatatan Iuran dan Kas Warga",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0e6b58",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${fraunces.variable} ${publicSans.variable}`}>
      <body className="flex flex-col min-h-screen bg-bg text-ink antialiased">
        <main className="flex-grow">{children}</main>

        <footer className="w-full py-6 text-center bg-surface-alt border-t border-border mt-auto">
          <p className="text-xs font-medium text-ink-muted">
            Developed by{" "}
            <span className="font-semibold text-ink">Gede Suta Pinatih</span>
          </p>
          <p className="text-[10px] text-ink-faint mt-1">
            Suka Duka Legian Web App v2.0.0
          </p>
        </footer>

        {/* Toast notifications — muncul di bagian bawah layar */}
        <Toaster position="bottom-center" richColors closeButton />
      </body>
    </html>
  );
}
