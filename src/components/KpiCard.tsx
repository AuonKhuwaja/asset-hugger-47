import { type LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean };
  iconColor?: string;
}

export function KpiCard({ title, value, subtitle, icon: Icon, trend, iconColor }: KpiCardProps) {
  return (
    <div className="glass-card glass-card-hover rounded-xl p-5 shadow-glass">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold tabular-data text-foreground">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          {trend && (
            <div className={`flex items-center gap-1 text-xs font-medium ${trend.positive ? "text-success" : "text-destructive"}`}>
              {trend.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{trend.value}</span>
            </div>
          )}
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconColor || "bg-primary/15 text-primary"}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}