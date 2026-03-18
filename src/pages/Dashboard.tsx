import {
  Package,
  DollarSign,
  AlertTriangle,
  Users,
  Activity,
  Wrench,
  ArrowLeftRight,
  PackagePlus,
  ArrowRight,
} from "lucide-react";
import { KpiCard } from "@/components/KpiCard";
import { StatusBadge } from "@/components/StatusBadge";
import { assets, departmentCosts, monthlyData, recentActivity } from "@/lib/mock-data";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const totalValue = assets.reduce((s, a) => s + a.currentValue, 0);
const inUseCount = assets.filter((a) => a.status === "in-use").length;
const maintenanceCount = assets.filter((a) => a.status === "maintenance").length;
const damagedCount = assets.filter((a) => a.status === "damaged").length;
const utilizationRate = Math.round((inUseCount / assets.length) * 100);

const pieData = departmentCosts.map((d) => ({
  name: d.department,
  value: d.assetCount,
}));
const PIE_COLORS = [
  "hsl(187, 92%, 41%)", // cyan
  "hsl(239, 84%, 67%)", // indigo
  "hsl(142, 76%, 36%)", // green
  "hsl(38, 92%, 50%)", // amber
  "hsl(0, 84%, 60%)", // red
  "hsl(280, 67%, 55%)", // purple
  "hsl(187, 60%, 60%)", // light cyan
  "hsl(215, 70%, 55%)", // blue
];

const activityIcons: Record<string, React.ElementType> = {
  registration: PackagePlus,
  assignment: Users,
  maintenance: Wrench,
  transfer: ArrowLeftRight,
  return: ArrowRight,
};

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Asset Value"
          value={`PKR ${totalValue.toLocaleString()}`}
          icon={DollarSign}
          trend={{ value: "-12.4% YTD depreciation", positive: false }}
        />
        <KpiCard
          title="Total Assets"
          value={String(assets.length)}
          subtitle={`${inUseCount} currently assigned`}
          icon={Package}
          iconColor="bg-secondary/20 text-secondary"
        />
        <KpiCard
          title="Under Maintenance"
          value={String(maintenanceCount + damagedCount)}
          subtitle={`${maintenanceCount} maintenance · ${damagedCount} damaged`}
          icon={AlertTriangle}
          iconColor="bg-warning/20 text-warning"
        />
        <KpiCard
          title="Utilization Rate"
          value={`${utilizationRate}%`}
          subtitle={`${assets.length - inUseCount} idle`}
          icon={Activity}
          trend={{ value: "+3.2% vs last month", positive: true }}
          iconColor="bg-success/20 text-success"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar Chart */}
        <div className="lg:col-span-2 glass-card rounded-xl p-5 shadow-glass">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Monthly Cost Analysis
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 25%)" />
                <XAxis dataKey="month" stroke="hsl(215, 20%, 55%)" fontSize={12} />
                <YAxis stroke="hsl(215, 20%, 55%)" fontSize={12} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(217, 33%, 17%)",
                    border: "1px solid hsl(217, 33%, 30%)",
                    borderRadius: 12,
                    color: "hsl(210, 40%, 98%)",
                    fontSize: 12,
                    backdropFilter: "blur(12px)",
                  }}
                  formatter={(value: number) => [`PKR ${value.toLocaleString()}`, undefined]}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="maintenance" fill="hsl(187, 92%, 41%)" name="Maintenance" radius={[6, 6, 0, 0]} />
                <Bar dataKey="depreciation" fill="hsl(239, 84%, 67%)" name="Depreciation" radius={[6, 6, 0, 0]} />
                <Bar dataKey="repairs" fill="hsl(38, 92%, 50%)" name="Repairs" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="glass-card rounded-xl p-5 shadow-glass">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Department Distribution
          </h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((_, idx) => (
                    <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(217, 33%, 17%)",
                    border: "1px solid hsl(217, 33%, 30%)",
                    borderRadius: 12,
                    color: "hsl(210, 40%, 98%)",
                    fontSize: 12,
                  }}
                  formatter={(value: number, name: string) => [`${value} assets`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-1.5 mt-2">
            {pieData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i] }} />
                <span className="truncate">{d.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-card rounded-xl p-5 shadow-glass">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
          Recent Activity
        </h2>
        <div className="space-y-3">
          {recentActivity.map((item) => {
            const Icon = activityIcons[item.type] || Activity;
            return (
              <div key={item.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{item.action}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.asset} · by {item.user}
                  </p>
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