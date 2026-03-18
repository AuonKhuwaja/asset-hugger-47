import { type AssetStatus } from "@/lib/mock-data";

const statusConfig: Record<AssetStatus, { label: string; className: string }> = {
  available: {
    label: "AVAILABLE",
    className: "bg-success/15 text-success border-success/30",
  },
  "in-use": {
    label: "IN USE",
    className: "bg-info/15 text-info border-info/30",
  },
  maintenance: {
    label: "MAINTENANCE",
    className: "bg-warning/15 text-warning border-warning/30",
  },
  damaged: {
    label: "DAMAGED",
    className: "bg-destructive/15 text-destructive border-destructive/30",
  },
  retired: {
    label: "RETIRED",
    className: "bg-muted text-muted-foreground border-border",
  },
};

export function StatusBadge({ status }: { status: AssetStatus }) {
  const config = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] uppercase tracking-widest font-bold border ${config.className}`}
    >
      {config.label}
    </span>
  );
}
