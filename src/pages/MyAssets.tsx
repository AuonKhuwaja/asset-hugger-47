import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { assets } from "@/lib/mock-data";
import { Package, Search, Monitor, Laptop, Smartphone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { TablePagination, usePagination } from "@/components/TablePagination";

export default function MyAssets() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");

  const myAssets = assets.filter(a => user?.assignedAssets?.includes(a.id));
  const filtered = myAssets.filter(a => {
    if (!search) return true;
    const q = search.toLowerCase();
    return a.name.toLowerCase().includes(q) || a.serialNumber.toLowerCase().includes(q) || a.category.toLowerCase().includes(q);
  });
  const pag = usePagination(filtered, 12);

  const getCategoryIcon = (cat: string) => {
    if (cat.includes("Laptop")) return Laptop;
    if (cat.includes("Monitor")) return Monitor;
    if (cat.includes("Mobile") || cat.includes("Phone")) return Smartphone;
    return Package;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">My Assets</h2>
        <span className="text-sm text-muted-foreground">{myAssets.length} asset(s) assigned</span>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search assets..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 rounded-xl" />
      </div>

      {filtered.length === 0 ? (
        <div className="vision-card p-12 text-center">
          <Package className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground">No assets assigned to you yet.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pag.paged.map(asset => {
              const Icon = getCategoryIcon(asset.category);
              return (
                <div key={asset.id} className="vision-card p-5 space-y-3 animate-fade-in">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      asset.status === "in-use" ? "bg-emerald-500/15 text-emerald-400" :
                      asset.status === "maintenance" ? "bg-amber-500/15 text-amber-400" :
                      "bg-muted text-muted-foreground"
                    }`}>{asset.status}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{asset.name}</h3>
                    <p className="text-xs text-muted-foreground">{asset.model} · {asset.serialNumber}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Category</span>
                      <p className="font-medium text-foreground">{asset.category}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Condition</span>
                      <p className="font-medium text-foreground">{asset.condition}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Value</span>
                      <p className="font-medium text-foreground">PKR {asset.currentValue.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Purchased</span>
                      <p className="font-medium text-foreground">{asset.purchaseDate}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="vision-card overflow-hidden">
            <TablePagination total={pag.total} page={pag.page} pageSize={pag.pageSize} onPageChange={pag.setPage} onPageSizeChange={pag.setPageSize} pageSizeOptions={[12, 24, 48, 96]} />
          </div>
        </>
      )}
    </div>
  );
}