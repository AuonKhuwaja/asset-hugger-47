import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean };
}

export function KpiCard({ title, value, subtitle, icon: Icon, trend }: KpiCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15, ease: [0.2, 0, 0, 1] }}
      className="bg-card border border-border border-top-highlight rounded-lg p-4 shadow-industrial"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
            {title}
          </p>
          <p className="text-2xl font-bold tracking-tighter-custom tabular-data">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <p
              className={`text-xs font-medium tabular-data ${
                trend.positive ? "text-success" : "text-destructive"
              }`}
            >
              {trend.value}
            </p>
          )}
        </div>
        <div className="p-2 rounded-md bg-secondary">
          <Icon className="w-5 h-5 text-muted-foreground" />
        </div>
      </div>
    </motion.div>
  );
}
