import { type LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean };
  iconGlow?: string;
}

export function KpiCard({ title, value, subtitle, icon: Icon, trend, iconGlow = "icon-glow" }: KpiCardProps) {
  return (
    <div className="vision-card vision-card-hover p-5 animate-scale-in">
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
          <p className="text-[28px] font-bold tabular-data text-foreground leading-none">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          {trend && (
            <div className={`flex items-center gap-1 text-xs font-semibold mt-1 ${trend.positive ? "text-success" : "text-destructive"}`}>
              {trend.positive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>{trend.value}</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 flex items-center justify-center ${iconGlow}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
}