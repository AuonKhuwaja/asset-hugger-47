import { assets, departmentCosts, monthlyData } from "@/lib/mock-data";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from "recharts";

const statusCounts = [
  { name: "In Use", value: assets.filter((a) => a.status === "in-use").length, color: "hsl(210 70% 55%)" },
  { name: "Available", value: assets.filter((a) => a.status === "available").length, color: "hsl(150 60% 45%)" },
  { name: "Maintenance", value: assets.filter((a) => a.status === "maintenance").length, color: "hsl(40 90% 55%)" },
  { name: "Damaged", value: assets.filter((a) => a.status === "damaged").length, color: "hsl(25 80% 50%)" },
  { name: "Retired", value: assets.filter((a) => a.status === "retired").length, color: "hsl(220 10% 40%)" },
];

const totalValue = assets.reduce((s, a) => s + a.currentValue, 0);
const totalPurchase = assets.reduce((s, a) => s + a.purchaseCost, 0);
const utilizationRate = Math.round((assets.filter((a) => a.status === "in-use").length / assets.length) * 100);

export default function Reports() {
  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Purchase Cost", value: `$${totalPurchase.toLocaleString()}` },
          { label: "Current Total Value", value: `$${totalValue.toLocaleString()}` },
          { label: "Utilization Rate", value: `${utilizationRate}%` },
        ].map((item) => (
          <div key={item.label} className="bg-card border border-border border-top-highlight rounded-lg p-4 shadow-industrial">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{item.label}</p>
            <p className="text-2xl font-bold tracking-tighter-custom tabular-data mt-1">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Asset Status Distribution */}
        <div className="bg-card border border-border rounded-lg p-4 shadow-industrial">
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">
            Asset Status Distribution
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusCounts}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  stroke="hsl(220 14% 10%)"
                  strokeWidth={2}
                >
                  {statusCounts.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(220 14% 13%)",
                    border: "1px solid hsl(220 14% 22%)",
                    borderRadius: 8,
                    color: "hsl(220 10% 90%)",
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="bg-card border border-border rounded-lg p-4 shadow-industrial">
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">
            Monthly Cost Trend
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
                <Bar dataKey="maintenance" fill="hsl(150 60% 45%)" name="Maintenance" radius={[4, 4, 0, 0]} stackId="a" />
                <Bar dataKey="repairs" fill="hsl(25 80% 50%)" name="Repairs" radius={[4, 4, 0, 0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Department table */}
      <div className="bg-card border border-border rounded-lg shadow-industrial overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
            Audit-Ready Department Report
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
    </div>
  );
}
