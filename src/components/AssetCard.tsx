import { motion } from "framer-motion";
import { Asset } from "@/lib/mock-data";
import { StatusBadge } from "@/components/StatusBadge";

export function AssetCard({ asset }: { asset: Asset }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15, ease: [0.2, 0, 0, 1] }}
      className="bg-card border border-border border-top-highlight p-4 rounded-lg shadow-industrial flex flex-col gap-4 cursor-pointer hover:shadow-card-hover transition-shadow duration-150"
    >
      <div className="flex justify-between items-start">
        <div className="space-y-1 min-w-0">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
            {asset.category}
          </span>
          <h3 className="text-base font-semibold tracking-tighter-custom leading-none truncate">
            {asset.name}
          </h3>
          <code className="text-xs tabular-data text-primary">
            ID: {asset.serialNumber}
          </code>
        </div>
        <StatusBadge status={asset.status} />
      </div>

      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border/50">
        <div className="text-xs">
          <p className="text-muted-foreground">Current Value</p>
          <p className="font-medium tabular-data">
            ${asset.currentValue.toLocaleString()}
          </p>
        </div>
        <div className="text-xs">
          <p className="text-muted-foreground">Assigned To</p>
          <p className="font-medium truncate">
            {asset.assignee || "Unassigned"}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
