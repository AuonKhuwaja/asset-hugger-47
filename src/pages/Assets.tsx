import { useState } from "react";
import { assets, type AssetStatus, type AssetCategory } from "@/lib/mock-data";
import { AssetCard } from "@/components/AssetCard";
import { Search, SlidersHorizontal } from "lucide-react";

const statuses: AssetStatus[] = ["available", "in-use", "maintenance", "damaged", "retired"];
const categories: AssetCategory[] = ["Laptop", "Monitor", "Printer", "Phone", "Server", "Tablet", "Projector", "Network Equipment"];

export default function Assets() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<AssetStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<AssetCategory | "all">("all");

  const filtered = assets.filter((a) => {
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    if (categoryFilter !== "all" && a.category !== categoryFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        a.name.toLowerCase().includes(q) ||
        a.serialNumber.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, ID, serial..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-secondary border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as AssetStatus | "all")}
          className="bg-secondary border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="all">All Statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>{s.replace("-", " ").toUpperCase()}</option>
          ))}
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as AssetCategory | "all")}
          className="bg-secondary border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <span className="text-xs text-muted-foreground tabular-data">
          {filtered.length} asset{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((asset) => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <SlidersHorizontal className="w-8 h-8 mb-3" />
          <p className="text-sm font-medium">No assets match your filters.</p>
          <p className="text-xs">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
}
