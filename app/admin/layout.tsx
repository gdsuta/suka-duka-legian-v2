import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

// Lapis kedua perlindungan (lapis pertama: proxy.ts). Server Actions juga
// memanggil requireAdmin() sendiri, jadi data tetap aman walau UI dilewati.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await getSession())) redirect("/login");

  return <div className="mx-auto max-w-6xl animate-fade-in px-4 py-5 sm:px-6 sm:py-8">{children}</div>;
}
