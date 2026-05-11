import { assets, departmentCosts, monthlyData, depreciationData } from "@/lib/mock-data";
import { KpiCard } from "@/components/KpiCard";
import { Button } from "@/components/ui/button";
import { DollarSign, Package, BarChart3, Download, TrendingDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";
import { useToast } from "@/hooks/use-toast";

const totalValue = assets.reduce((s, a) => s + a.currentValue, 0);
const totalPurchase = assets.reduce((s, a) => s + a.purchaseCost, 0);
const totalDepreciation = totalPurchase - totalValue;
const totalMaintenance = departmentCosts.reduce((s, d) => s + d.maintenanceCost, 0);

const statusCounts = [
  { name: "In Use", value: assets.filter((a) => a.status === "in-use").length, color: "hsl(213, 80%, 57%)" },
  { name: "Available", value: assets.filter((a) => a.status === "available").length, color: "hsl(142, 76%, 36%)" },
  { name: "Maintenance", value: assets.filter((a) => a.status === "maintenance").length, color: "hsl(38, 92%, 50%)" },
  { name: "Damaged", value: assets.filter((a) => a.status === "damaged").length, color: "hsl(0, 84%, 60%)" },
  { name: "Retired", value: assets.filter((a) => a.status === "retired").length, color: "hsl(258, 100%, 67%)" },
];

const tooltipStyle = {
  backgroundColor: "rgba(6, 11, 40, 0.9)",
  border: "1px solid rgba(226, 232, 240, 0.08)",
  borderRadius: 16,
  color: "#e2e8f0",
  fontSize: 12,
};

export default function Reports() {
  const { toast } = useToast();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Reports</h2>
        <Button onClick={() => toast({ title: "Export Started", description: "Generating PDF..." })} className="bg-gradient-to-r from-primary to-primary/80 font-bold rounded-xl">
          <Download className="w-4 h-4 mr-2" />
          Export to PDF
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
         <KpiCard
                          title="Total Asset Value"
                           value={`PKR ${totalValue.toLocaleString()}`}
                           icon={DollarSign}
                          
                            gradient="linear-gradient(135deg, #1a237e 0%, #0d47a1 50%, #1565c0 100%)"
                          />
       
        <KpiCard title="Purchase Cost" value={`PKR ${totalPurchase.toLocaleString()}`} icon={Package} iconGlow="icon-glow-purple"
         gradient="linear-gradient(135deg, #4a148c 0%, #6a1b9a 50%, #7b1fa2 100%)" />
        <KpiCard title="Depreciation" value={`PKR ${totalDepreciation.toLocaleString()}`} icon={TrendingDown} iconGlow="icon-glow-orange" 
         gradient="linear-gradient(135deg, #e65100 0%, #ef6c00 50%, #f57c00 100%)"/>
        <KpiCard title="Maintenance Cost" value={`PKR ${totalMaintenance.toLocaleString()}`} icon={BarChart3} iconGlow="icon-glow-green"
       gradient="linear-gradient(135deg, #1b5e20 0%, #2e7d32 50%, #388e3c 100%)"/>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Breakdown */}
        <div className="vision-card p-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Monthly Cost Breakdown</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(226,232,240,0.06)" />
                <XAxis dataKey="month" stroke="#718096" fontSize={12} />
                <YAxis stroke="#718096" fontSize={12} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`PKR ${value.toLocaleString()}`, undefined]} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="maintenance" fill="hsl(213, 80%, 57%)" name="Maintenance" radius={[8, 8, 0, 0]} />
                <Bar dataKey="depreciation" fill="hsl(258, 100%, 67%)" name="Depreciation" radius={[8, 8, 0, 0]} />
                <Bar dataKey="repairs" fill="hsl(38, 92%, 50%)" name="Repairs" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="vision-card p-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Asset Status Distribution</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusCounts} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" stroke="transparent">
                  {statusCounts.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {statusCounts.map((s) => (
              <div key={s.name} className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                <span>{s.name} ({s.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Asset Status Cards */}
      <div className="vision-card p-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Asset Utilization</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {(["available", "in-use", "maintenance", "damaged", "retired"] as const).map((status) => {
            const count = assets.filter((a) => a.status === status).length;
            const pct = Math.round((count / assets.length) * 100);
            return (
              <div key={status} className="p-4 rounded-xl bg-muted/10 border border-border/10 text-center">
                <p className="text-2xl font-bold tabular-data text-foreground">{count}</p>
                <p className="text-xs text-muted-foreground capitalize mt-1">{status.replace("-", " ")}</p>
                <div className="mt-2 w-full bg-muted/20 rounded-full h-1.5">
                  <div className="bg-gradient-to-r from-primary to-primary/60 rounded-full h-1.5" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Department Table */}
      <div className="vision-card overflow-hidden">
        <div className="p-5 border-b border-border/10">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Department-wise Cost Report</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-dashed border-border bg-primary text-primary-foreground">
                {["Department", "Assets", "Value", "Maintenance", "Repairs", "Depreciation", "Total"].map((h) => (
                  <th key={h} className={`px-4 py-3 text-xs font-bold uppercase tracking-wider text-primary-foreground ${h !== "Department" ? "text-right" : "text-left"} border-r border-dashed border-primary-foreground/60 last:border-r-0`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {departmentCosts.map((d) => (
                <tr key={d.department} className="border-b border-dashed border-border transition-colors hover:bg-muted/50">
                  <td className="px-4 py-3 font-medium border-r border-dashed border-border last:border-r-0">{d.department}</td>
                  <td className="px-4 py-3 text-right tabular-data border-r border-dashed border-border last:border-r-0">{d.assetCount}</td>
                  <td className="px-4 py-3 text-right tabular-data border-r border-dashed border-border last:border-r-0">PKR {d.totalValue.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right tabular-data border-r border-dashed border-border last:border-r-0">PKR {d.maintenanceCost.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right tabular-data border-r border-dashed border-border last:border-r-0">PKR {d.repairCost.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right tabular-data border-r border-dashed border-border last:border-r-0">PKR {d.depreciationCost.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right tabular-data font-bold text-primary border-r border-dashed border-border last:border-r-0">PKR {d.totalCost.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}