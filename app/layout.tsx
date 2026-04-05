import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Suka Duka Legian Finance",
  description: "Sistem Pencatatan Iuran dan Kas Warga",
  manifest: "/manifest.json",
  themeColor: "#4f46e5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.className} flex flex-col min-h-screen bg-gray-50`}>
        <main className="flex-grow">{children}</main>

        <footer className="w-full py-6 text-center bg-gray-100 border-t border-gray-200 mt-auto">
          <p className="text-xs font-medium text-gray-500">
            Developed by{" "}
            <span className="font-bold text-gray-700">Gede Suta Pinatih</span>
          </p>
          <p className="text-[10px] text-gray-400 mt-1">
            Suka Duka Legian Web App v2.0.0
          </p>
        </footer>

        {/* Toast notifications — muncul di bagian bawah layar */}
        <Toaster position="bottom-center" richColors closeButton />
      </body>
    </html>
  );
}
