import {
  Package,
  DollarSign,
  AlertTriangle,
  Activity,
  Wrench,
  ArrowLeftRight,
  PackagePlus,
  ArrowRight,
  Users,
  TrendingUp,
} from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { assets, departmentCosts, monthlyData, recentActivity } from "@/lib/mock-data";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell, AreaChart, Area, LineChart, Line, RadialBarChart, RadialBar,
} from "recharts";

const totalValue = assets.reduce((s, a) => s + a.currentValue, 0);
const totalPurchase = assets.reduce((s, a) => s + a.purchaseCost, 0);
const inUseCount = assets.filter((a) => a.status === "in-use").length;
const maintenanceCount = assets.filter((a) => a.status === "maintenance").length;
const damagedCount = assets.filter((a) => a.status === "damaged").length;

const pieData = departmentCosts.map((d) => ({ name: d.department, value: d.assetCount }));

// Asset value trend
const valueTrend = (() => {
  let running = totalPurchase;
  return monthlyData.map((m) => {
    running -= m.depreciation;
    return { month: m.month, value: running, depreciation: m.depreciation };
  });
})();

// Status mix for radial
const statusMix = [
  { name: "In Use", value: inUseCount, fill: "hsl(var(--primary))" },
  { name: "Maintenance", value: maintenanceCount, fill: "hsl(var(--warning))" },
  { name: "Damaged", value: damagedCount, fill: "hsl(var(--destructive))" },
  { name: "Available", value: assets.filter(a => a.status === "available").length, fill: "hsl(var(--success))" },
];

// Theme-driven palette using semantic tokens
const PIE_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "hsl(var(--success))",
  "hsl(var(--warning))",
  "hsl(var(--destructive))",
  "hsl(var(--accent))",
  "hsl(var(--info))",
  "hsl(var(--muted-foreground))",
];

const activityIcons: Record<string, React.ElementType> = {
  registration: PackagePlus, assignment: Users, maintenance: Wrench,
  transfer: ArrowLeftRight, return: ArrowRight,
};

const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 12,
  color: "hsl(var(--foreground))",
  fontSize: 12,
  boxShadow: "0 8px 24px -8px hsl(var(--primary) / 0.15)",
};

interface KpiTileProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  trend?: { value: string; positive: boolean };
  accent: "primary" | "secondary" | "success" | "warning";
}

function KpiTile({ title, value, subtitle, icon: Icon, trend, accent }: KpiTileProps) {
  const accentMap = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
  };
  return (
    <div className="rounded-2xl bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accentMap[accent]}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${trend.positive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
            {trend.value}
          </span>
        )}
      </div>
      <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{title}</p>
      <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
      {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
    </div>
  );
}

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header strip */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Overview</h2>
          <p className="text-sm text-muted-foreground">Real-time snapshot of your asset portfolio</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          Live · Last sync just now
        </div>
      </div>

      {/* KPI row — clean, no heavy borders */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiTile title="Total Asset Value" value={`PKR ${(totalValue / 1000).toFixed(1)}k`} subtitle={`of PKR ${(totalPurchase / 1000).toFixed(1)}k purchase`} icon={DollarSign} trend={{ value: "-12.4%", positive: false }} accent="primary" />
        <KpiTile title="Assets Assigned" value={String(inUseCount)} subtitle={`${assets.length} total`} icon={Package} accent="secondary" />
        <KpiTile title="Maintenance" value={String(maintenanceCount + damagedCount)} subtitle={`${maintenanceCount} active · ${damagedCount} damaged`} icon={AlertTriangle} accent="warning" />
        <KpiTile title="Utilization" value={`${Math.round((inUseCount / assets.length) * 100)}%`} subtitle="active fleet" icon={Activity} trend={{ value: "+3.2%", positive: true }} accent="success" />
      </div>

      {/* Asset value trend — large feature chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-foreground">Asset Value Trend</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Book value vs monthly depreciation</p>
            </div>
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={valueTrend}>
                <defs>
                  <linearGradient id="valGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="depGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--secondary))" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`PKR ${v.toLocaleString()}`, undefined]} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="value" name="Asset Value" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#valGrad)" />
                <Area type="monotone" dataKey="depreciation" name="Depreciation" stroke="hsl(var(--secondary))" strokeWidth={2} fill="url(#depGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status radial */}
        <div className="rounded-2xl bg-card p-6 shadow-sm">
          <h3 className="text-sm font-bold text-foreground mb-1">Asset Status Mix</h3>
          <p className="text-xs text-muted-foreground mb-4">Current portfolio health</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart innerRadius="30%" outerRadius="100%" data={statusMix} startAngle={90} endAngle={-270}>
                <RadialBar background dataKey="value" cornerRadius={6} />
                <Tooltip contentStyle={tooltipStyle} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 mt-2">
            {statusMix.map((s) => (
              <div key={s.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.fill }} />
                  <span className="text-muted-foreground">{s.name}</span>
                </div>
                <span className="font-semibold text-foreground">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cost analysis + category */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl bg-card p-6 shadow-sm">
          <h3 className="text-sm font-bold text-foreground mb-1">Monthly Cost Breakdown</h3>
          <p className="text-xs text-muted-foreground mb-4">Maintenance, depreciation & repairs</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`PKR ${value.toLocaleString()}`, undefined]} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="maintenance" fill="hsl(var(--primary))" name="Maintenance" radius={[6, 6, 0, 0]} />
                <Bar dataKey="depreciation" fill="hsl(var(--secondary))" name="Depreciation" radius={[6, 6, 0, 0]} />
                <Bar dataKey="repairs" fill="hsl(var(--warning))" name="Repairs" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl bg-card p-6 shadow-sm">
          <h3 className="text-sm font-bold text-foreground mb-1">By Department</h3>
          <p className="text-xs text-muted-foreground mb-4">Asset distribution</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(value: number, name: string) => [`${value} assets`, name]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-1.5 mt-3">
            {pieData.slice(0, 6).map((d, i) => (
              <div key={d.name} className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i] }} />
                <span className="truncate">{d.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Depreciation line trend */}
      <div className="rounded-2xl bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-foreground">Depreciation Impact</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Monthly cost trend across categories</p>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`PKR ${v.toLocaleString()}`, undefined]} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="depreciation" name="Depreciation" stroke="hsl(var(--secondary))" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="maintenance" name="Maintenance" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="repairs" name="Repairs" stroke="hsl(var(--warning))" strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity — clean list */}
      <div className="rounded-2xl bg-card p-6 shadow-sm">
        <h3 className="text-sm font-bold text-foreground mb-4">Recent Activity</h3>
        <div className="space-y-2">
          {recentActivity.map((item) => {
            const Icon = activityIcons[item.type] || Activity;
            return (
              <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/30 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{item.action}</p>
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
