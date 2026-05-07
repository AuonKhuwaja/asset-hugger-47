import {
  Package, DollarSign, AlertTriangle, Activity, Wrench, ArrowLeftRight,
  PackagePlus, ArrowRight, Users,
} from "lucide-react";
import { KpiCard } from "@/components/KpiCard";
import { AssetTrackerCanvas } from "@/components/AssetTrackerCanvas";
import { assets, departmentCosts, monthlyData, recentActivity } from "@/lib/mock-data";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell, AreaChart, Area, LineChart, Line, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, ComposedChart,
} from "recharts";

const totalValue = assets.reduce((s, a) => s + a.currentValue, 0);
const inUseCount = assets.filter((a) => a.status === "in-use").length;
const maintenanceCount = assets.filter((a) => a.status === "maintenance").length;
const damagedCount = assets.filter((a) => a.status === "damaged").length;

const pieData = departmentCosts.map((d) => ({ name: d.department, value: d.assetCount }));

// Asset value trend (purchase value depreciating month over month)
const totalPurchaseAll = assets.reduce((s, a) => s + a.purchaseCost, 0);
const valueTrend = (() => {
  let running = totalPurchaseAll;
  return monthlyData.map((m) => {
    running -= m.depreciation;
    return { month: m.month, value: running, depreciation: m.depreciation };
  });
})();
const PIE_COLORS = [
  "hsl(213, 80%, 57%)", "hsl(258, 100%, 67%)", "hsl(142, 76%, 36%)",
  "hsl(38, 92%, 50%)", "hsl(0, 84%, 60%)", "hsl(280, 67%, 55%)",
  "hsl(180, 60%, 50%)", "hsl(320, 70%, 55%)",
];

const activityIcons: Record<string, React.ElementType> = {
  registration: PackagePlus, assignment: Users, maintenance: Wrench,
  transfer: ArrowLeftRight, return: ArrowRight,
};

const tooltipStyle = {
  backgroundColor: "rgba(6, 11, 40, 0.9)",
  border: "1px solid rgba(226, 232, 240, 0.08)",
  borderRadius: 16,
  color: "#e2e8f0",
  fontSize: 12,
  backdropFilter: "blur(16px)",
};

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Page title */}
      <h2 className="text-xl font-bold text-foreground">General Statistics</h2>

      {/* KPI row + Globe */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <KpiCard
            title="Total Asset Value"
            value={`PKR ${totalValue.toLocaleString()}`}
            icon={DollarSign}
            trend={{ value: "-12.4% YTD", positive: false }}
            gradient="linear-gradient(135deg, #1a237e 0%, #0d47a1 50%, #1565c0 100%)"
          />
          <KpiCard
            title="Assets Assigned"
            value={String(inUseCount)}
            subtitle={`of ${assets.length} total`}
            icon={Package}
            gradient="linear-gradient(135deg, #4a148c 0%, #6a1b9a 50%, #7b1fa2 100%)"
          />
          <KpiCard
            title="Under Maintenance"
            value={String(maintenanceCount + damagedCount)}
            subtitle={`${maintenanceCount} maint · ${damagedCount} damaged`}
            icon={AlertTriangle}
            gradient="linear-gradient(135deg, #e65100 0%, #ef6c00 50%, #f57c00 100%)"
          />
          <KpiCard
            title="Total Assets"
            value={String(assets.length)}
            subtitle={`${Math.round((inUseCount / assets.length) * 100)}% utilization`}
            icon={Activity}
            trend={{ value: "+3.2% vs last month", positive: true }}
            gradient="linear-gradient(135deg, #1b5e20 0%, #2e7d32 50%, #388e3c 100%)"
          />
        </div>

        {/* Asset Tracker Animation */}
        <div className="hidden lg:block relative">
          <div className="globe-glow top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          <div className="w-full h-[300px]">
            <AssetTrackerCanvas />
          </div>
        </div>
      </div>

      {/* Assets by Department — Composed Chart (replaces grid table) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="vision-card p-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Assets by Department</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={departmentCosts}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(226,232,240,0.06)" />
                <XAxis dataKey="department" stroke="#718096" fontSize={11} />
                <YAxis yAxisId="left" stroke="#718096" fontSize={11} />
                <YAxis yAxisId="right" orientation="right" stroke="#718096" fontSize={11} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar yAxisId="left" dataKey="assetCount" name="Assets" fill="hsl(213, 80%, 57%)" radius={[6, 6, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="totalValue" name="Total Value (PKR)" stroke="hsl(258, 100%, 67%)" strokeWidth={2.5} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Maintenance vs Repairs Trend */}
        <div className="vision-card p-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Maintenance vs Repairs Trend</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(226,232,240,0.06)" />
                <XAxis dataKey="month" stroke="#718096" fontSize={12} />
                <YAxis stroke="#718096" fontSize={12} tickFormatter={(v) => `${v/1000}k`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`PKR ${v.toLocaleString()}`, undefined]} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="maintenance" name="Maintenance" stroke="hsl(213, 80%, 57%)" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="repairs" name="Repairs" stroke="hsl(38, 92%, 50%)" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Department Cost Radar */}
      <div className="vision-card p-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Department Cost Radar</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={departmentCosts}>
              <PolarGrid stroke="rgba(226,232,240,0.12)" />
              <PolarAngleAxis dataKey="department" stroke="#718096" fontSize={11} />
              <PolarRadiusAxis stroke="#718096" fontSize={10} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Radar name="Maintenance" dataKey="maintenanceCost" stroke="hsl(213, 80%, 57%)" fill="hsl(213, 80%, 57%)" fillOpacity={0.35} />
              <Radar name="Depreciation" dataKey="depreciationCost" stroke="hsl(258, 100%, 67%)" fill="hsl(258, 100%, 67%)" fillOpacity={0.3} />
              <Radar name="Repairs" dataKey="repairCost" stroke="hsl(38, 92%, 50%)" fill="hsl(38, 92%, 50%)" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Asset Value Trend */}
      <div className="vision-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Asset Value Trend</h3>
          <span className="text-xs text-muted-foreground">Depreciation impact over time</span>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={valueTrend}>
              <defs>
                <linearGradient id="dashValGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(213, 80%, 57%)" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="hsl(213, 80%, 57%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="dashDepGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(258, 100%, 67%)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="hsl(258, 100%, 67%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(226,232,240,0.06)" />
              <XAxis dataKey="month" stroke="#718096" fontSize={12} />
              <YAxis stroke="#718096" fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`PKR ${v.toLocaleString()}`, undefined]} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="value" name="Asset Value" stroke="hsl(213, 80%, 57%)" strokeWidth={2} fill="url(#dashValGrad)" />
              <Area type="monotone" dataKey="depreciation" name="Monthly Depreciation" stroke="hsl(258, 100%, 67%)" strokeWidth={2} fill="url(#dashDepGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <div className="lg:col-span-2 vision-card p-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Monthly Cost Analysis</h3>
          <div className="h-72">
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

        {/* Pie Chart */}
        <div className="vision-card p-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Category Distribution</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(value: number, name: string) => [`${value} assets`, name]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-1.5 mt-3">
            {pieData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i] }} />
                <span className="truncate">{d.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="vision-card p-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {recentActivity.map((item) => {
            const Icon = activityIcons[item.type] || Activity;
            return (
              <div key={item.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/10 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{item.action}</p>
                  <p className="text-xs text-muted-foreground">{item.asset} · {item.user}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{item.time}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}