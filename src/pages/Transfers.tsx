import { transferRecords } from "@/lib/mock-data";
import { ArrowRight, CheckCircle2, Clock, XCircle } from "lucide-react";

const statusIcon = {
  pending: <Clock className="w-4 h-4 text-warning" />,
  approved: <CheckCircle2 className="w-4 h-4 text-info" />,
  completed: <CheckCircle2 className="w-4 h-4 text-success" />,
  rejected: <XCircle className="w-4 h-4 text-destructive" />,
};

const statusClass = {
  pending: "bg-warning/15 text-warning border-warning/30",
  approved: "bg-info/15 text-info border-info/30",
  completed: "bg-success/15 text-success border-success/30",
  rejected: "bg-destructive/15 text-destructive border-destructive/30",
};

export default function Transfers() {
  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-lg shadow-industrial overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-widest">ID</th>
                <th className="px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-widest">Asset</th>
                <th className="px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-widest">Transfer</th>
                <th className="px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-widest">Date</th>
                <th className="px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-widest">Approved By</th>
                <th className="px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody>
              {transferRecords.map((t) => (
                <tr key={t.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors duration-150">
                  <td className="px-4 py-3 tabular-data text-xs text-primary font-medium">{t.id}</td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{t.assetName}</p>
                      <p className="text-xs text-muted-foreground tabular-data">{t.assetId}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground">{t.fromEmployee}</span>
                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                      <span className="font-medium">{t.toEmployee}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 tabular-data text-xs text-muted-foreground">{t.date}</td>
                  <td className="px-4 py-3 text-xs">{t.approvedBy || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] uppercase tracking-widest font-bold border ${statusClass[t.status]}`}>
                      {statusIcon[t.status]}
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
