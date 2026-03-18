import { type Asset } from "@/lib/mock-data";
import { StatusBadge } from "./StatusBadge";
import { QrCode, User, Building2 } from "lucide-react";

export function AssetCard({ asset }: { asset: Asset }) {
  return (
    <div className="glass-card glass-card-hover rounded-xl p-4 shadow-glass group">
      <div className="flex items-start justify-between mb-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{asset.name}</p>
          <p className="text-xs text-muted-foreground font-mono">{asset.id}</p>
        </div>
        <StatusBadge status={asset.status} />
      </div>

      <div className="space-y-2 text-xs text-muted-foreground">
        <div className="flex items-center justify-between">
          <span>Model</span>
          <span className="text-foreground font-medium">{asset.model}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Serial</span>
          <span className="text-foreground font-mono text-[11px]">{asset.serialNumber}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Category</span>
          <span className="text-foreground">{asset.category}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Value</span>
          <span className="text-foreground tabular-data font-semibold">
            PKR {asset.currentValue.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-border/30 flex items-center justify-between text-xs">
        {asset.assignee ? (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <User className="w-3.5 h-3.5" />
            <span className="truncate">{asset.assignee}</span>
          </div>
        ) : (
          <span className="text-muted-foreground italic">Unassigned</span>
        )}
        {asset.department && (
          <div className="flex items-center gap-1 text-muted-foreground">
            <Building2 className="w-3.5 h-3.5" />
            <span>{asset.department}</span>
          </div>
        )}
      </div>

      <div className="mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground/60">
        <QrCode className="w-3 h-3" />
        <span className="font-mono">{asset.qrCode}</span>
      </div>
    </div>
  );
}