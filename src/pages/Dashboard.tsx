import {
  Package,
  DollarSign,
  AlertTriangle,
  Wrench,
  TrendingDown,
  Users,
} from "lucide-react";
import { KpiCard } from "@/components/KpiCard";
import { AssetCard } from "@/components/AssetCard";
import { StatusBadge } from "@/components/StatusBadge";
import { assets, departmentCosts, monthlyData, maintenanceRecords } from "@/lib/mock-data";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const totalValue = assets.reduce((s, a) => s + a.currentValue, 0);
const inUseCount = assets.filter((a) => a.status === "in-use").length;
const maintenanceCount = assets.filter((a) => a.status === "maintenance").length;
const damagedCount = assets.filter((a) => a.status === "damaged").length;
const utilizationRate = Math.round((inUseCount / assets.length) * 100);

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Asset Value"
          value={`$${totalValue.toLocaleString()}`}
          icon={DollarSign}
          trend={{ value: "-12.4% YTD depreciation", positive: false }}
        />
        <KpiCard
          title="Total Assets"
          value={String(assets.length)}
          subtitle={`${inUseCount} in use`}
          icon={Package}
        />
        <KpiCard
          title="Utilization Rate"
          value={`${utilizationRate}%`}
          subtitle={`${assets.length - inUseCount} idle`}
          icon={Users}
          trend={{ value: "+3.2% vs last month", positive: true }}
        />
        <KpiCard
          title="Alerts"
          value={String(maintenanceCount + damagedCount)}
          subtitle={`${maintenanceCount} maintenance · ${damagedCount} damaged`}
          icon={AlertTriangle}
        />
      </div>

      {/* Charts + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Monthly Cost Chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-lg p-4 shadow-industrial">
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">
            Monthly Cost Analysis
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 14% 22%)" />
                <XAxis dataKey="month" stroke="hsl(220 10% 55%)" fontSize={12} />
                <YAxis stroke="hsl(220 10% 55%)" fontSize={12} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(220 14% 13%)",
                    border: "1px solid hsl(220 14% 22%)",
                    borderRadius: 8,
                    color: "hsl(220 10% 90%)",
                    fontSize: 12,
                  }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, undefined]}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="maintenance" fill="hsl(150 60% 45%)" name="Maintenance" radius={[4, 4, 0, 0]} />
                <Bar dataKey="depreciation" fill="hsl(210 70% 55%)" name="Depreciation" radius={[4, 4, 0, 0]} />
                <Bar dataKey="repairs" fill="hsl(25 80% 50%)" name="Repairs" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Upcoming Maintenance */}
        <div className="bg-card border border-border rounded-lg p-4 shadow-industrial">
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">
            Upcoming Maintenance
          </h2>
          <div className="space-y-3">
            {maintenanceRecords
              .filter((m) => m.status !== "completed")
              .slice(0, 4)
              .map((m) => (
                <div
                  key={m.id}
                  className="flex items-start gap-3 p-2.5 rounded-md bg-secondary/50 border border-border/50"
                >
                  <Wrench className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-sm font-medium truncate">{m.assetName}</p>
                    <p className="text-xs text-muted-foreground">{m.description}</p>
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="tabular-data text-muted-foreground">{m.date}</span>
                      <span className="tabular-data font-medium">${m.cost}</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Department Cost Breakdown */}
      <div className="bg-card border border-border rounded-lg shadow-industrial overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
            Department Cost Breakdown
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-widest">Department</th>
                <th className="px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-widest text-right">Assets</th>
                <th className="px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-widest text-right">Total Value</th>
                <th className="px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-widest text-right">Maintenance</th>
                <th className="px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-widest text-right">Depreciation</th>
                <th className="px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-widest text-right">Total Cost</th>
              </tr>
            </thead>
            <tbody>
              {departmentCosts.map((d) => (
                <tr key={d.department} className="border-b border-border/50 hover:bg-secondary/30 transition-colors duration-150">
                  <td className="px-4 py-3 font-medium">{d.department}</td>
                  <td className="px-4 py-3 text-right tabular-data">{d.assetCount}</td>
                  <td className="px-4 py-3 text-right tabular-data">${d.totalValue.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right tabular-data">${d.maintenanceCost.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right tabular-data">${d.depreciationCost.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right tabular-data font-bold">${d.totalCost.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Assets */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">
          Recently Registered Assets
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {assets.slice(0, 6).map((asset) => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      </div>
    </div>
  );
}
