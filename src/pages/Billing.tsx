import { departmentCosts } from "@/lib/mock-data";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const chartData = departmentCosts.map((d) => ({
  name: d.department,
  maintenance: d.maintenanceCost,
  depreciation: d.depreciationCost,
}));

const totalMaintenance = departmentCosts.reduce((s, d) => s + d.maintenanceCost, 0);
const totalDepreciation = departmentCosts.reduce((s, d) => s + d.depreciationCost, 0);
const grandTotal = departmentCosts.reduce((s, d) => s + d.totalCost, 0);

export default function Billing() {
  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Maintenance", value: totalMaintenance },
          { label: "Total Depreciation", value: totalDepreciation },
          { label: "Grand Total", value: grandTotal },
        ].map((item) => (
          <div key={item.label} className="bg-card border border-border border-top-highlight rounded-lg p-4 shadow-industrial">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{item.label}</p>
            <p className="text-2xl font-bold tracking-tighter-custom tabular-data mt-1">
              ${item.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-card border border-border rounded-lg p-4 shadow-industrial">
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">
          Cost by Department
        </h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 14% 22%)" />
              <XAxis dataKey="name" stroke="hsl(220 10% 55%)" fontSize={12} />
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
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg shadow-industrial overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
            Monthly Cost Summary
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-widest">Department</th>
                <th className="px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-widest text-right">Assets</th>
                <th className="px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-widest text-right">Maintenance</th>
                <th className="px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-widest text-right">Depreciation</th>
                <th className="px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-widest text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {departmentCosts.map((d) => (
                <tr key={d.department} className="border-b border-border/50 hover:bg-secondary/30 transition-colors duration-150">
                  <td className="px-4 py-3 font-medium">{d.department}</td>
                  <td className="px-4 py-3 text-right tabular-data">{d.assetCount}</td>
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
