import { type LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean };
  iconGlow?: string;
  gradient?: string;
}

export function KpiCard({ title, value, subtitle, icon: Icon, trend, iconGlow = "icon-glow", gradient }: KpiCardProps) {
  return (
    <div className={`relative overflow-hidden rounded-[1.25rem] p-5 animate-scale-in transition-all duration-300 hover:-translate-y-0.5 ${gradient ? '' : 'vision-card vision-card-hover'}`}
      style={gradient ? {
        background: gradient,
        border: '1.5px solid rgba(255,255,255,0.08)',
      } : undefined}
    >
      {/* Subtle shine overlay */}
      {gradient && (
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.07] via-transparent to-transparent pointer-events-none" />
      )}
      <div className="relative flex items-start justify-between">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/60">{title}</p>
          <p className="text-[28px] font-bold tabular-data text-white leading-none">{value}</p>
          {subtitle && <p className="text-xs text-white/50 mt-1">{subtitle}</p>}
          {trend && (
            <div className={`flex items-center gap-1 text-xs font-semibold mt-1 ${trend.positive ? "text-emerald-300" : "text-red-300"}`}>
              {trend.positive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>{trend.value}</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 flex items-center justify-center rounded-xl ${gradient ? 'bg-white/15 backdrop-blur-sm' : iconGlow}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
}
