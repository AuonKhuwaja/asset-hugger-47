import { type AssetStatus } from "@/lib/mock-data";

const statusConfig: Record<AssetStatus, { label: string; className: string }> = {
  available: { label: "Available", className: "bg-success/15 text-success border-success/30" },
  "in-use": { label: "In Use", className: "bg-primary/15 text-primary border-primary/30" },
  maintenance: { label: "Maintenance", className: "bg-warning/15 text-warning border-warning/30" },
  damaged: { label: "Damaged", className: "bg-destructive/15 text-destructive border-destructive/30" },
  retired: { label: "Retired", className: "bg-muted-foreground/15 text-muted-foreground border-muted-foreground/30" },
};

const extraStatusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-warning/15 text-warning border-warning/30" },
  approved: { label: "Approved", className: "bg-info/15 text-info border-info/30" },
  completed: { label: "Completed", className: "bg-success/15 text-success border-success/30" },
  rejected: { label: "Rejected", className: "bg-destructive/15 text-destructive border-destructive/30" },
  scheduled: { label: "Scheduled", className: "bg-info/15 text-info border-info/30" },
  "in-progress": { label: "In Progress", className: "bg-warning/15 text-warning border-warning/30" },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status as AssetStatus] || extraStatusConfig[status] || {
    label: status,
    className: "bg-muted text-muted-foreground border-border",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${config.className}`}>
      {config.label}
    </span>
  );
}