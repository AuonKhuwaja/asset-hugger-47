import { loadRuns } from "./DepreciationRun";
import { ExportButtons } from "@/components/ExportButtons";
import { TablePagination, usePagination } from "@/components/TablePagination";
import { CheckCircle2, XCircle } from "lucide-react";

export default function DepreciationRunHistory() {
  const runs = loadRuns();
  const pag = usePagination(runs, 10);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">Run History</h2>

      <div className="vision-card overflow-hidden">
        <div className="p-5 border-b border-border/10 flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Depreciation Runs</h3>
          <ExportButtons
            filename="depreciation-run-history"
            title="Depreciation Run History"
            columns={[
              { header: "Run ID", accessor: (r: any) => r.id },
              { header: "Date", accessor: (r: any) => new Date(r.runAt).toLocaleString() },
              { header: "Assets Processed", accessor: (r: any) => r.assetsProcessed },
              { header: "Value Reduced (PKR)", accessor: (r: any) => r.totalReduced },
              { header: "Triggered By", accessor: (r: any) => r.triggeredBy },
              { header: "Status", accessor: (r: any) => r.status },
            ]}
            rows={runs}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-dashed border-border bg-primary text-primary-foreground">
                {["Run ID", "Date & Time", "Assets", "Value Reduced", "Trigger", "Status"].map((h, i) => (
                  <th key={h} className={`px-4 py-3 text-xs font-bold uppercase tracking-wider text-primary-foreground ${i === 0 || i === 1 ? "text-left" : i === 5 ? "text-center" : "text-right"} border-r border-dashed border-primary-foreground/60 last:border-r-0`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {runs.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">No depreciation runs yet. Trigger one from the scheduler.</td></tr>
              )}
              {pag.paged.map((r) => (
                <tr key={r.id} className="border-b border-dashed border-border hover:bg-muted/50">
                  <td className="px-4 py-3 font-mono text-xs border-r border-dashed border-border last:border-r-0">{r.id}</td>
                  <td className="px-4 py-3 border-r border-dashed border-border last:border-r-0">{new Date(r.runAt).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right tabular-data border-r border-dashed border-border last:border-r-0">{r.assetsProcessed}</td>
                  <td className="px-4 py-3 text-right tabular-data border-r border-dashed border-border last:border-r-0">PKR {r.totalReduced.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right capitalize text-muted-foreground border-r border-dashed border-border last:border-r-0">{r.triggeredBy}</td>
                  <td className="px-4 py-3 text-center border-r border-dashed border-border last:border-r-0">
                    {r.status === "success" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-success/15 text-success text-xs font-semibold">
                        <CheckCircle2 className="w-3 h-3" /> Success
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-destructive/15 text-destructive text-xs font-semibold">
                        <XCircle className="w-3 h-3" /> Failed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <TablePagination total={pag.total} page={pag.page} pageSize={pag.pageSize} onPageChange={pag.setPage} onPageSizeChange={pag.setPageSize} />
      </div>
    </div>
  );
}
