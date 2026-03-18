import { type AssetStatus } from "@/lib/mock-data";

const statusConfig: Record<AssetStatus, { label: string; className: string }> = {
  available: { label: "Available", className: "bg-success/20 text-success border-success/30" },
  "in-use": { label: "In Use", className: "bg-primary/20 text-primary border-primary/30" },
  maintenance: { label: "Maintenance", className: "bg-warning/20 text-warning border-warning/30" },
  damaged: { label: "Damaged", className: "bg-destructive/20 text-destructive border-destructive/30" },
  retired: { label: "Retired", className: "bg-muted-foreground/20 text-muted-foreground border-muted-foreground/30" },
};

const transferStatusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-warning/20 text-warning border-warning/30" },
  approved: { label: "Approved", className: "bg-info/20 text-info border-info/30" },
  completed: { label: "Completed", className: "bg-success/20 text-success border-success/30" },
  rejected: { label: "Rejected", className: "bg-destructive/20 text-destructive border-destructive/30" },
  scheduled: { label: "Scheduled", className: "bg-info/20 text-info border-info/30" },
  "in-progress": { label: "In Progress", className: "bg-warning/20 text-warning border-warning/30" },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status as AssetStatus] || transferStatusConfig[status] || {
    label: status,
    className: "bg-muted text-muted-foreground border-border",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}>
      {config.label}
    </span>
  );
}