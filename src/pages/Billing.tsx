import { useState } from "react";
import { departmentCosts, depreciationData, assets } from "@/lib/mock-data";
import { KpiCard } from "@/components/KpiCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Receipt, FileText, Plus, Search, DollarSign, TrendingDown, Wrench } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const chartData = departmentCosts.map((d) => ({
  name: d.department,
  maintenance: d.maintenanceCost,
  depreciation: d.depreciationCost,
  repairs: d.repairCost,
}));

const totalMaintenance = departmentCosts.reduce((s, d) => s + d.maintenanceCost, 0);
const totalDepreciation = departmentCosts.reduce((s, d) => s + d.depreciationCost, 0);
const grandTotal = departmentCosts.reduce((s, d) => s + d.totalCost, 0);

const tooltipStyle = {
  backgroundColor: "rgba(6, 11, 40, 0.9)",
  border: "1px solid rgba(226, 232, 240, 0.08)",
  borderRadius: 16,
  color: "#e2e8f0",
  fontSize: 12,
};

export default function Billing() {
  const { toast } = useToast();
  const [showRepairForm, setShowRepairForm] = useState(false);
  const [search, setSearch] = useState("");

  const filteredDepts = departmentCosts.filter((d) => !search || d.department.toLowerCase().includes(search.toLowerCase()));

  const handleRepairSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Repair Cost Logged" });
    setShowRepairForm(false);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">Billing & Charging</h2>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KpiCard
                    title="Total Maintenance" 
                   value={`PKR ${totalMaintenance.toLocaleString()}`}
                   icon={Wrench}
                  
                               gradient="linear-gradient(135deg, #4a148c 0%, #6a1b9a 50%, #7b1fa2 100%)"
                  />
                   <KpiCard
                  title="Total Depreciation"
                   value={`PKR ${totalDepreciation.toLocaleString()}`}
                   icon={TrendingDown}
                  
                    gradient="linear-gradient(135deg, #1a237e 0%, #0d47a1 50%, #1565c0 100%)"
                  />
                    <KpiCard
                  title="Grand Total Cost"
                   value={`PKR ${totalDepreciation.toLocaleString()}`}
                   icon={TrendingDown}
                  

                                gradient="linear-gradient(135deg, #e65100 0%, #ef6c00 50%, #f57c00 100%)"
                  />
        {/* <KpiCard title="Total Maintenance" value={`PKR ${totalMaintenance.toLoca  String()}`} icon={Wrench} />
        <KpiCard title="Total Depreciation" value={`PKR ${totalDepreciation.toLocaleString()}`} icon={TrendingDown} iconGlow="icon-glow-orange" /> */}
        {/* <KpiCard title="Grand Total Cost" value={`PKR ${grandTotal.toLocaleString()}`} icon={DollarSign} iconGlow="icon-glow-purple" /> */}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => setShowRepairForm(!showRepairForm)} className={showRepairForm ? "bg-muted hover:bg-muted/80" : "bg-gradient-to-r from-primary to-primary/80 font-bold rounded-xl"}>
          <Plus className="w-4 h-4 mr-2" />
          {showRepairForm ? "Cancel" : "Log Repair Cost"}
        </Button>
        <Button variant="outline" className="rounded-xl border-border/30" onClick={() => toast({ title: "Invoice Generated" })}>
          <FileText className="w-4 h-4 mr-2" />
          Generate Invoice
        </Button>
      </div>

      {showRepairForm && (
        <form onSubmit={handleRepairSubmit} className="vision-card p-6 space-y-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 icon-glow flex items-center justify-center">
              <Receipt className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-base font-bold text-foreground">Log Repair Cost</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Asset</Label>
              <select className="select-vision">
                <option value="">Select...</option>
                {assets.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Cost (PKR)</Label>
              <Input type="number" placeholder="0" className="input-dark border-border/30 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Date</Label>
              <Input type="date" className="input-dark border-border/30 rounded-xl" />
            </div>
          </div>
          <Button type="submit" className="bg-gradient-to-r from-primary to-primary/80 font-bold rounded-xl">Save</Button>
        </form>
      )}

      {/* Chart */}
      <div className="vision-card p-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Cost by Department</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(226,232,240,0.06)" />
              <XAxis dataKey="name" stroke="#718096" fontSize={12} />
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

      {/* Department Cost Table */}
      <div className="vision-card overflow-hidden">
        <div className="p-5 border-b border-border/10 flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Department Cost Allocation</h3>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 rounded-xl bg-muted/20 border border-border/20 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/10">
                {["Department", "Assets", "Value", "Maintenance", "Repairs", "Depreciation", "Total"].map((h) => (
                  <th key={h} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground ${h !== "Department" ? "text-right" : "text-left"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredDepts.map((d) => (
                <tr key={d.department} className="border-b border-border/10 hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-3 font-medium">{d.department}</td>
                  <td className="px-4 py-3 text-right tabular-data">{d.assetCount}</td>
                  <td className="px-4 py-3 text-right tabular-data">PKR {d.totalValue.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right tabular-data">PKR {d.maintenanceCost.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right tabular-data">PKR {d.repairCost.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right tabular-data">PKR {d.depreciationCost.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right tabular-data font-bold text-primary">PKR {d.totalCost.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Depreciation Tracking */}
      <div className="vision-card overflow-hidden">
        <div className="p-5 border-b border-border/10">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Depreciation Tracking</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/10">
                {["Asset", "Purchase Cost", "Current Value", "Depreciation", "Rate"].map((h) => (
                  <th key={h} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground ${h !== "Asset" ? "text-right" : "text-left"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {depreciationData.map((d) => (
                <tr key={d.id} className="border-b border-border/10 hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-3 font-medium">{d.name}</td>
                  <td className="px-4 py-3 text-right tabular-data">PKR {d.purchaseCost.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right tabular-data">PKR {d.currentValue.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right tabular-data text-destructive">-PKR {d.depreciation.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">
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