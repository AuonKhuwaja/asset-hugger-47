import { maintenanceRecords } from "@/lib/mock-data";
import { Wrench, Calendar, CheckCircle2, Clock, Loader2 } from "lucide-react";

const statusConfig = {
  scheduled: { icon: <Calendar className="w-4 h-4" />, className: "bg-info/15 text-info border-info/30" },
  "in-progress": { icon: <Loader2 className="w-4 h-4 animate-spin" />, className: "bg-warning/15 text-warning border-warning/30" },
  completed: { icon: <CheckCircle2 className="w-4 h-4" />, className: "bg-success/15 text-success border-success/30" },
};

const typeLabel = { preventive: "PREVENTIVE", corrective: "CORRECTIVE" };
const typeClass = {
  preventive: "bg-primary/15 text-primary border-primary/30",
  corrective: "bg-destructive/15 text-destructive border-destructive/30",
};

export default function Maintenance() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {maintenanceRecords.map((m) => {
          const sc = statusConfig[m.status];
          return (
            <div
              key={m.id}
              className="bg-card border border-border border-top-highlight rounded-lg p-4 shadow-industrial space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] uppercase tracking-widest font-bold border ${typeClass[m.type]}`}>
                    {typeLabel[m.type]}
                  </span>
                  <h3 className="text-sm font-semibold tracking-tighter-custom">{m.assetName}</h3>
                  <p className="text-xs text-muted-foreground tabular-data">{m.assetId}</p>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] uppercase tracking-widest font-bold border ${sc.className}`}>
                  {sc.icon}
                  {m.status.replace("-", " ")}
                </span>
              </div>

              <p className="text-xs text-muted-foreground">{m.description}</p>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/50 text-xs">
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="tabular-data font-medium">{m.date}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Cost</p>
                  <p className="tabular-data font-medium">${m.cost}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Technician</p>
                  <p className="font-medium truncate">{m.technician}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
