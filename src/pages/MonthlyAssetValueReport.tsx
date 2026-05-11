import { useMemo, useState } from "react";
import { assets, depreciationData, monthlyData } from "@/lib/mock-data";
import { KpiCard } from "@/components/KpiCard";
import { Button } from "@/components/ui/button";
import { ExportButtons } from "@/components/ExportButtons";
import { exportToPdf } from "@/lib/export-utils";
import { TrendingDown, DollarSign, Package, Download } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from "recharts";
import { useToast } from "@/hooks/use-toast";

const tooltipStyle = {
  backgroundColor: "rgba(6, 11, 40, 0.9)",
  border: "1px solid rgba(226, 232, 240, 0.08)",
  borderRadius: 16,
  color: "#e2e8f0",
  fontSize: 12,
};

export default function MonthlyAssetValueReport() {
  const { toast } = useToast();
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));

  const totalCurrent = assets.reduce((s, a) => s + a.currentValue, 0);
  const totalPurchase = assets.reduce((s, a) => s + a.purchaseCost, 0);
  const totalDepreciation = totalPurchase - totalCurrent;

  const trend = useMemo(() => {
    let running = totalPurchase;
    return monthlyData.map((m) => {
      running -= m.depreciation;
      return { month: m.month, value: running, depreciation: m.depreciation };
    });
  }, [totalPurchase]);

  const handleDownloadPdf = () => {
    exportToPdf(
      `monthly-asset-value-${month}`,
      `Monthly Asset Value Report — ${month}`,
      [
        { header: "Asset ID", accessor: (d: any) => d.id },
        { header: "Asset", accessor: (d: any) => d.name },
        { header: "Purchase Cost", accessor: (d: any) => `PKR ${d.purchaseCost.toLocaleString()}` },
        { header: "Current Value", accessor: (d: any) => `PKR ${d.currentValue.toLocaleString()}` },
        { header: "Depreciation", accessor: (d: any) => `PKR ${d.depreciation.toLocaleString()}` },
        { header: "Rate %", accessor: (d: any) => `${d.depreciationRate}%` },
      ],
      depreciationData,
    );
    toast({ title: "PDF Downloaded", description: `Monthly report for ${month}` });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-bold text-foreground">Monthly Asset Value Report</h2>
        <div className="flex items-center gap-2">
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)}
            className="px-3 py-2 rounded-xl bg-muted/20 border border-border/20 text-sm" />
          <Button onClick={handleDownloadPdf} className="bg-gradient-to-r from-primary to-primary/80 font-bold rounded-xl">
            <Download className="w-4 h-4 mr-2" /> Download PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard title="Purchase Cost" value={`PKR ${totalPurchase.toLocaleString()}`} icon={DollarSign}
          gradient="linear-gradient(135deg, #1a237e 0%, #0d47a1 50%, #1565c0 100%)" />
        <KpiCard title="Current Book Value" value={`PKR ${totalCurrent.toLocaleString()}`} icon={Package}
          gradient="linear-gradient(135deg, #1b5e20 0%, #2e7d32 50%, #388e3c 100%)" />
        <KpiCard title="Total Depreciation" value={`PKR ${totalDepreciation.toLocaleString()}`} icon={TrendingDown}
          gradient="linear-gradient(135deg, #e65100 0%, #ef6c00 50%, #f57c00 100%)" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="vision-card p-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Asset Value Trend</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="valGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(213, 80%, 57%)" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="hsl(213, 80%, 57%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(226,232,240,0.06)" />
                <XAxis dataKey="month" stroke="#718096" fontSize={12} />
                <YAxis stroke="#718096" fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`PKR ${v.toLocaleString()}`, "Value"]} />
                <Area type="monotone" dataKey="value" stroke="hsl(213, 80%, 57%)" strokeWidth={2} fill="url(#valGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="vision-card p-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Monthly Depreciation</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(226,232,240,0.06)" />
                <XAxis dataKey="month" stroke="#718096" fontSize={12} />
                <YAxis stroke="#718096" fontSize={12} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`PKR ${v.toLocaleString()}`, "Depreciation"]} />
                <Bar dataKey="depreciation" fill="hsl(258, 100%, 67%)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="vision-card overflow-hidden">
        <div className="p-5 border-b border-border/10 flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Asset-wise Detail</h3>
          <ExportButtons
            filename={`monthly-asset-value-${month}`}
            title={`Monthly Asset Value — ${month}`}
            columns={[
              { header: "Asset ID", accessor: (d: any) => d.id },
              { header: "Name", accessor: (d: any) => d.name },
              { header: "Purchase Cost", accessor: (d: any) => d.purchaseCost },
              { header: "Current Value", accessor: (d: any) => d.currentValue },
              { header: "Depreciation", accessor: (d: any) => d.depreciation },
              { header: "Rate %", accessor: (d: any) => d.depreciationRate },
            ]}
            rows={depreciationData}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-dashed border-border bg-primary text-primary-foreground">
                {["Asset", "Purchase", "Current Value", "Depreciation", "Rate"].map((h, i) => (
                  <th key={h} className={`px-4 py-3 text-xs font-bold uppercase tracking-wider text-primary-foreground ${i === 0 ? "text-left" : "text-right"} border-r border-dashed border-primary-foreground/60 last:border-r-0`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {depreciationData.map((d) => (
                <tr key={d.id} className="border-b border-dashed border-border hover:bg-muted/50">
                  <td className="px-4 py-3 font-medium border-r border-dashed border-border last:border-r-0">{d.name}</td>
                  <td className="px-4 py-3 text-right tabular-data border-r border-dashed border-border last:border-r-0">PKR {d.purchaseCost.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right tabular-data border-r border-dashed border-border last:border-r-0">PKR {d.currentValue.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right tabular-data text-destructive border-r border-dashed border-border last:border-r-0">-PKR {d.depreciation.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right tabular-data font-semibold border-r border-dashed border-border last:border-r-0">{d.depreciationRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
