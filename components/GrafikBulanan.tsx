"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface GrafikBulananProps {
  pemasukan: any[];
  pengeluaran: any[];
}

function formatRupiah(value: number) {
  if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(1)}jt`;
  if (value >= 1_000) return `Rp ${(value / 1_000).toFixed(0)}rb`;
  return `Rp ${value}`;
}

export default function GrafikBulanan({
  pemasukan,
  pengeluaran,
}: GrafikBulananProps) {
  // Kelompokkan transaksi per bulan
  const grouped: Record<
    string,
    { bulan: string; sortKey: string; pemasukan: number; pengeluaran: number }
  > = {};

  pemasukan.forEach((p) => {
    const date = new Date(p.tanggal_bayar || p.created_at);
    if (isNaN(date.getTime())) return;
    const sortKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const bulan = date.toLocaleDateString("id-ID", {
      month: "short",
      year: "2-digit",
    });
    if (!grouped[sortKey]) {
      grouped[sortKey] = { bulan, sortKey, pemasukan: 0, pengeluaran: 0 };
    }
    grouped[sortKey].pemasukan += Number(p.jumlah);
  });

  pengeluaran.forEach((p) => {
    const date = new Date(p.tanggal);
    if (isNaN(date.getTime())) return;
    const sortKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const bulan = date.toLocaleDateString("id-ID", {
      month: "short",
      year: "2-digit",
    });
    if (!grouped[sortKey]) {
      grouped[sortKey] = { bulan, sortKey, pemasukan: 0, pengeluaran: 0 };
    }
    grouped[sortKey].pengeluaran += Number(p.total_biaya);
  });

  const data = Object.values(grouped).sort((a, b) =>
    a.sortKey.localeCompare(b.sortKey)
  );

  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-ink-faint text-sm">
        Belum ada data transaksi untuk ditampilkan.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart
        data={data}
        margin={{ top: 5, right: 4, left: 0, bottom: 5 }}
        barCategoryGap="28%"
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e7ddc9" vertical={false} />
        <XAxis
          dataKey="bulan"
          tick={{ fontSize: 12, fill: "#6d6353" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={formatRupiah}
          tick={{ fontSize: 11, fill: "#6d6353" }}
          axisLine={false}
          tickLine={false}
          width={64}
        />
        <Tooltip
          formatter={(value: number) =>
            `Rp ${value.toLocaleString("id-ID")}`
          }
          contentStyle={{
            borderRadius: "8px",
            border: "1px solid #e7ddc9",
            fontSize: "13px",
            fontFamily: "var(--font-public-sans)",
          }}
        />
        <Legend
          wrapperStyle={{ fontSize: "13px", paddingTop: "12px" }}
        />
        <Bar
          dataKey="pemasukan"
          name="Pemasukan"
          fill="#0e6b58"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="pengeluaran"
          name="Pengeluaran"
          fill="#b1461f"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
