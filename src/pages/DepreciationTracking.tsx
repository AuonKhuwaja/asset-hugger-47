import { useState } from "react";
import { depreciationData, assets } from "@/lib/mock-data";
import { KpiCard } from "@/components/KpiCard";
import { ExportButtons } from "@/components/ExportButtons";
import { TrendingDown, DollarSign, Package, Search } from "lucide-react";

const totalPurchase = depreciationData.reduce((s, d) => s + d.purchaseCost, 0);
const totalCurrent = depreciationData.reduce((s, d) => s + d.currentValue, 0);
const totalDepreciation = totalPurchase - totalCurrent;

export default function DepreciationTracking() {
  const [search, setSearch] = useState("");
  const rows = depreciationData
    .map((d) => ({ ...d, category: assets.find((a) => a.id === d.id)?.category || "—" }))
    .filter((d) => !search || d.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">Depreciation Tracking</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard title="Total Purchase Cost" value={`PKR ${totalPurchase.toLocaleString()}`} icon={DollarSign}
          gradient="linear-gradient(135deg, #1a237e 0%, #0d47a1 50%, #1565c0 100%)" />
        <KpiCard title="Current Book Value" value={`PKR ${totalCurrent.toLocaleString()}`} icon={Package}
          gradient="linear-gradient(135deg, #1b5e20 0%, #2e7d32 50%, #388e3c 100%)" />
        <KpiCard title="Total Depreciation" value={`PKR ${totalDepreciation.toLocaleString()}`} icon={TrendingDown}
          gradient="linear-gradient(135deg, #e65100 0%, #ef6c00 50%, #f57c00 100%)" />
      </div>

      <div className="vision-card overflow-hidden">
        <div className="p-5 border-b border-border/10 flex items-center justify-between gap-3 flex-wrap">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Asset-wise Depreciation</h3>
          <div className="flex items-center gap-3">
            <ExportButtons
              filename="depreciation-tracking"
              title="Asset-wise Depreciation"
              columns={[
                { header: "Asset ID", accessor: (d: any) => d.id },
                { header: "Name", accessor: (d: any) => d.name },
                { header: "Category", accessor: (d: any) => d.category },
                { header: "Purchase Cost", accessor: (d: any) => d.purchaseCost },
                { header: "Current Value", accessor: (d: any) => d.currentValue },
                { header: "Depreciation", accessor: (d: any) => d.depreciation },
                { header: "Rate %", accessor: (d: any) => d.depreciationRate },
              ]}
              rows={rows}
            />
            <div className="relative w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search asset..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-muted/20 border border-border/20 text-sm" />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-dashed border-border bg-primary text-primary-foreground">
                {["Asset", "Category", "Purchase", "Current Value", "Depreciation", "Rate"].map((h, i) => (
                  <th key={h} className={`px-4 py-3 text-xs font-bold uppercase tracking-wider text-foreground ${i === 0 ? "text-left" : "text-right"} border-r border-dashed border-border/60 last:border-r-0`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((d) => (
                <tr key={d.id} className="border-b border-dashed border-border/70 hover:bg-muted/50">
                  <td className="px-4 py-3 font-medium border-r border-dashed border-border/40 last:border-r-0">{d.name}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground border-r border-dashed border-border/40 last:border-r-0">{d.category}</td>
                  <td className="px-4 py-3 text-right tabular-data border-r border-dashed border-border/40 last:border-r-0">PKR {d.purchaseCost.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right tabular-data border-r border-dashed border-border/40 last:border-r-0">PKR {d.currentValue.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right tabular-data text-destructive border-r border-dashed border-border/40 last:border-r-0">-PKR {d.depreciation.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right border-r border-dashed border-border/40 last:border-r-0">
                    <span className={`tabular-data font-semibold ${d.depreciationRate > 50 ? "text-destructive" : d.depreciationRate > 20 ? "text-warning" : "text-success"}`}>
                      {d.depreciationRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
