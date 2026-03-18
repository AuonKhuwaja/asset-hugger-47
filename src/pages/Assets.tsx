import { useState } from "react";
import { assets, type AssetStatus, type AssetCategory } from "@/lib/mock-data";
import { AssetCard } from "@/components/AssetCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Search, SlidersHorizontal, Grid3X3, List } from "lucide-react";

const statuses: AssetStatus[] = ["available", "in-use", "maintenance", "damaged", "retired"];
const categories: AssetCategory[] = ["Laptop", "Monitor", "Printer", "Mobile", "Server", "Tablet", "Projector", "Network Equipment", "Other"];

export default function Assets() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<AssetStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<AssetCategory | "all">("all");
  const [view, setView] = useState<"grid" | "table">("grid");

  const filtered = assets.filter((a) => {
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    if (categoryFilter !== "all" && a.category !== categoryFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return a.name.toLowerCase().includes(q) || a.serialNumber.toLowerCase().includes(q) || a.id.toLowerCase().includes(q) || a.vendor.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">Asset Management</h2>

      {/* Filters */}
      <div className="vision-card p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search assets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-muted/30 border border-border/30 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as AssetStatus | "all")} className="select-vision">
            <option value="all">All Statuses</option>
            {statuses.map((s) => <option key={s} value={s}>{s.replace("-", " ").replace(/^\w/, c => c.toUpperCase())}</option>)}
          </select>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as AssetCategory | "all")} className="select-vision">
            <option value="all">All Categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="flex items-center gap-1 border border-border/30 rounded-xl p-1">
            <button onClick={() => setView("grid")} className={`p-2 rounded-lg transition ${view === "grid" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button onClick={() => setView("table")} className={`p-2 rounded-lg transition ${view === "table" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
              <List className="w-4 h-4" />
            </button>
          </div>
          <span className="text-xs text-muted-foreground tabular-data">{filtered.length} asset{filtered.length !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {filtered.length > 0 ? (
        view === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((asset) => <AssetCard key={asset.id} asset={asset} />)}
          </div>
        ) : (
          <div className="vision-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/20">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Assignee</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a) => (
                    <tr key={a.id} className="border-b border-border/10 hover:bg-muted/10 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{a.id}</td>
                      <td className="px-4 py-3 font-medium">{a.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{a.category}</td>
                      <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                      <td className="px-4 py-3 text-muted-foreground">{a.assignee || "—"}</td>
                      <td className="px-4 py-3 text-right tabular-data font-medium text-primary">PKR {a.currentValue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground vision-card">
          <SlidersHorizontal className="w-8 h-8 mb-3" />
          <p className="text-sm font-medium">No assets match your filters.</p>
        </div>
      )}
    </div>
  );
}