import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { KpiCard } from "@/components/KpiCard";
import { ExportButtons } from "@/components/ExportButtons";
import { useToast } from "@/hooks/use-toast";
import { assets, categories as assetCategories } from "@/lib/mock-data";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { TrendingDown, Play, History as HistoryIcon, Calculator, Layers, Package } from "lucide-react";

type Mode = "category" | "asset";
type Method = "Straight Line" | "Declining Balance";

interface DepreciationLogEntry {
  id: string;
  date: string;
  assetId: string;
  assetName: string;
  method: Method;
  depreciationAmount: number;
  newBookValue: number;
}

const LOG_KEY = "tv_depreciation_log";

function loadLog(): DepreciationLogEntry[] {
  try { return JSON.parse(localStorage.getItem(LOG_KEY) || "[]"); } catch { return []; }
}
function saveLog(log: DepreciationLogEntry[]) {
  localStorage.setItem(LOG_KEY, JSON.stringify(log));
}

// Defaults applied when an asset has no depreciation metadata yet
const DEFAULT_USEFUL_LIFE = 5;
const DEFAULT_SALVAGE_PCT = 0.1; // 10% of purchase cost

interface Row {
  id: string;
  name: string;
  cost: number;
  bookValue: number;
  depreciationAmount: number;
  newBookValue: number;
}

function computeRow(assetId: string, method: Method, log: DepreciationLogEntry[]): Row | null {
  const a = assets.find((x) => x.id === assetId);
  if (!a) return null;
  // Latest book value = last log entry for this asset, else currentValue
  const latestForAsset = log.find((l) => l.assetId === assetId);
  const bookValue = latestForAsset ? latestForAsset.newBookValue : a.currentValue;
  const cost = a.purchaseCost;
  const salvage = Math.round(cost * DEFAULT_SALVAGE_PCT);
  const usefulLife = DEFAULT_USEFUL_LIFE;

  let depAmount = 0;
  if (method === "Straight Line") {
    depAmount = Math.max(0, Math.round((cost - salvage) / usefulLife));
  } else {
    // Declining Balance: BookValue × (1 / usefulLife × 2)
    depAmount = Math.max(0, Math.round(bookValue * (1 / usefulLife) * 2));
  }
  // Don't depreciate below salvage
  const newBookValue = Math.max(salvage, bookValue - depAmount);
  const actualDep = bookValue - newBookValue;

  return {
    id: a.id, name: a.name, cost,
    bookValue, depreciationAmount: actualDep, newBookValue,
  };
}

export default function Depreciation() {
  const { toast } = useToast();
  const [mode, setMode] = useState<Mode>("category");
  const [method, setMethod] = useState<Method>("Straight Line");
  const [selectedCategory, setSelectedCategory] = useState<string>(assetCategories[0]?.name || "");
  const [selectedAsset, setSelectedAsset] = useState<string>(assets[0]?.id || "");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [log, setLog] = useState<DepreciationLogEntry[]>(loadLog());

  const targetAssetIds = useMemo(() => {
    if (mode === "category") {
      return assets.filter((a) => a.category === selectedCategory).map((a) => a.id);
    }
    return selectedAsset ? [selectedAsset] : [];
  }, [mode, selectedCategory, selectedAsset]);

  const previewRows = useMemo(() => {
    return targetAssetIds
      .map((id) => computeRow(id, method, log))
      .filter((r): r is Row => !!r);
  }, [targetAssetIds, method, log]);

  const totalDep = previewRows.reduce((s, r) => s + r.depreciationAmount, 0);

  const runDepreciation = () => {
    if (previewRows.length === 0) {
      toast({ title: "Nothing to depreciate", description: "No assets in selection.", variant: "destructive" });
      return;
    }
    const date = new Date().toISOString();
    const newEntries: DepreciationLogEntry[] = previewRows.map((r) => ({
      id: `DEP-${Date.now()}-${r.id}`,
      date, assetId: r.id, assetName: r.name, method,
      depreciationAmount: r.depreciationAmount,
      newBookValue: r.newBookValue,
    }));
    const next = [...newEntries, ...log];
    setLog(next); saveLog(next);
    setPreviewOpen(false);
    toast({
      title: "Depreciation Run Complete",
      description: `${previewRows.length} asset(s) · PKR ${totalDep.toLocaleString()} depreciated using ${method}.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-bold text-foreground">Depreciation</h2>
        <Button
          onClick={() => setPreviewOpen(true)}
          disabled={previewRows.length === 0}
          className="bg-gradient-to-r from-primary to-primary/80 font-bold rounded-xl"
        >
          <Play className="w-4 h-4 mr-2" /> Preview & Run
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard title="Mode" value={mode === "category" ? "Category Wise" : "Asset Wise"} icon={mode === "category" ? Layers : Package}
          gradient="linear-gradient(135deg, #1a237e 0%, #0d47a1 50%, #1565c0 100%)" />
        <KpiCard title="Method" value={method} icon={Calculator}
          gradient="linear-gradient(135deg, #4a148c 0%, #6a1b9a 50%, #7b1fa2 100%)" />
        <KpiCard title="Assets in Selection" value={String(previewRows.length)} subtitle={`PKR ${totalDep.toLocaleString()} to deduct`} icon={TrendingDown}
          gradient="linear-gradient(135deg, #b71c1c 0%, #c62828 50%, #d32f2f 100%)" />
      </div>

      {/* Selection */}
      <div className="vision-card p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Mode</Label>
            <select className="select-vision" value={mode} onChange={(e) => setMode(e.target.value as Mode)}>
              <option value="category">Category Wise</option>
              <option value="asset">Asset Wise</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Depreciation Method</Label>
            <select className="select-vision" value={method} onChange={(e) => setMethod(e.target.value as Method)}>
              <option value="Straight Line">Straight Line</option>
              <option value="Declining Balance">Declining Balance</option>
            </select>
          </div>
          {mode === "category" ? (
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Category</Label>
              <select className="select-vision" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                {assetCategories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Asset</Label>
              <select className="select-vision" value={selectedAsset} onChange={(e) => setSelectedAsset(e.target.value)}>
                {assets.map((a) => <option key={a.id} value={a.id}>{a.name} ({a.id})</option>)}
              </select>
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Formula — <span className="font-semibold text-foreground">Straight Line</span>: (Cost − Salvage) ÷ Useful Life ·
          {" "}<span className="font-semibold text-foreground">Declining Balance</span>: Book Value × (1 ÷ Useful Life × 2)
        </p>
      </div>

      {/* Preview Table (always visible) */}
      <div className="vision-card overflow-hidden">
        <div className="p-5 border-b border-border/10 flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Depreciation Preview</h3>
          <ExportButtons
            filename="depreciation-preview"
            title="Depreciation Preview"
            columns={[
              { header: "Asset", accessor: (r: Row) => `${r.name} (${r.id})` },
              { header: "Cost (PKR)", accessor: (r: Row) => r.cost },
              { header: "Book Value (PKR)", accessor: (r: Row) => r.bookValue },
              { header: "Depreciation (PKR)", accessor: (r: Row) => r.depreciationAmount },
              { header: "New Book Value (PKR)", accessor: (r: Row) => r.newBookValue },
            ]}
            rows={previewRows}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-dashed border-border bg-muted/40">
                {["Asset", "Cost", "Book Value", "Depreciation Amount", "New Book Value"].map((h, i) => (
                  <th key={h} className={`px-4 py-3 text-xs font-bold uppercase tracking-wider text-foreground ${i === 0 ? "text-left" : "text-right"} border-r border-dashed border-border/60 last:border-r-0`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewRows.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">No assets in selection.</td></tr>
              ) : previewRows.map((r) => (
                <tr key={r.id} className="border-b border-border/10 hover:bg-muted/10">
                  <td className="px-4 py-3 border-r border-dashed border-border/40 last:border-r-0"><span className="font-medium text-foreground">{r.name}</span> <span className="text-xs text-muted-foreground font-mono ml-1">{r.id}</span></td>
                  <td className="px-4 py-3 text-right tabular-data border-r border-dashed border-border/40 last:border-r-0">PKR {r.cost.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right tabular-data border-r border-dashed border-border/40 last:border-r-0">PKR {r.bookValue.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right tabular-data text-destructive font-semibold border-r border-dashed border-border/40 last:border-r-0">− PKR {r.depreciationAmount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right tabular-data text-primary font-bold border-r border-dashed border-border/40 last:border-r-0">PKR {r.newBookValue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* History Log */}
      <div className="vision-card overflow-hidden">
        <div className="p-5 border-b border-border/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HistoryIcon className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Depreciation History Log</h3>
          </div>
          <ExportButtons
            filename="depreciation-history"
            title="Depreciation History"
            columns={[
              { header: "Date", accessor: (l: DepreciationLogEntry) => new Date(l.date).toLocaleString() },
              { header: "Asset", accessor: (l: DepreciationLogEntry) => `${l.assetName} (${l.assetId})` },
              { header: "Method", accessor: (l: DepreciationLogEntry) => l.method },
              { header: "Amount (PKR)", accessor: (l: DepreciationLogEntry) => l.depreciationAmount },
              { header: "New Book Value (PKR)", accessor: (l: DepreciationLogEntry) => l.newBookValue },
            ]}
            rows={log}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-dashed border-border bg-muted/40">
                {["Date", "Asset", "Method", "Amount", "New Book Value"].map((h, i) => (
                  <th key={h} className={`px-4 py-3 text-xs font-bold uppercase tracking-wider text-foreground ${i <= 2 ? "text-left" : "text-right"} border-r border-dashed border-border/60 last:border-r-0`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {log.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">No depreciation runs yet.</td></tr>
              ) : log.map((l) => (
                <tr key={l.id} className="border-b border-border/10 hover:bg-muted/10">
                  <td className="px-4 py-3 text-muted-foreground border-r border-dashed border-border/40 last:border-r-0">{new Date(l.date).toLocaleString()}</td>
                  <td className="px-4 py-3 border-r border-dashed border-border/40 last:border-r-0"><span className="font-medium text-foreground">{l.assetName}</span> <span className="text-xs text-muted-foreground font-mono ml-1">{l.assetId}</span></td>
                  <td className="px-4 py-3 border-r border-dashed border-border/40 last:border-r-0"><span className="px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-primary/15 text-primary">{l.method}</span></td>
                  <td className="px-4 py-3 text-right tabular-data text-destructive font-semibold border-r border-dashed border-border/40 last:border-r-0">− PKR {l.depreciationAmount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right tabular-data text-primary font-bold border-r border-dashed border-border/40 last:border-r-0">PKR {l.newBookValue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl bg-background border-border/40">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><TrendingDown className="w-5 h-5 text-primary" /> Confirm Depreciation Run</DialogTitle>
            <DialogDescription>
              Method: <span className="text-foreground font-semibold">{method}</span> · Assets: <span className="text-foreground font-semibold">{previewRows.length}</span> ·
              {" "}Total deduction: <span className="text-destructive font-semibold">PKR {totalDep.toLocaleString()}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-72 overflow-y-auto rounded-xl border border-border/20">
            <table className="w-full text-xs">
              <thead className="bg-muted/30 sticky top-0 border-r border-dashed border-border/60 last:border-r-0">
                <tr>{["Asset", "Book Value", "Depreciation", "New Book Value"].map((h, i) => (
                  <th key={h} className={`px-3 py-2 ${i === 0 ? "text-left" : "text-right"} text-foreground font-bold uppercase border-r border-dashed border-border/60 last:border-r-0`}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {previewRows.map((r) => (
                  <tr key={r.id} className="border-t border-border/10">
                    <td className="px-3 py-2">{r.name}</td>
                    <td className="px-3 py-2 text-right tabular-data">PKR {r.bookValue.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right tabular-data text-destructive">− PKR {r.depreciationAmount.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right tabular-data text-primary font-semibold">PKR {r.newBookValue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setPreviewOpen(false)}>Cancel</Button>
            <Button className="bg-gradient-to-r from-primary to-primary/80 font-bold rounded-xl" onClick={runDepreciation}>
              <Play className="w-4 h-4 mr-2" /> Confirm & Run
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
