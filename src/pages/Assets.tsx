import { useState } from "react";
import { assets as initialAssets, type AssetStatus, type AssetCategory, departments } from "@/lib/mock-data";
import { AssetCard } from "@/components/AssetCard";
import { StatusBadge } from "@/components/StatusBadge";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Search, SlidersHorizontal, Grid3X3, List, Plus, Pencil, Trash2, X, Package, DollarSign, AlertTriangle, CheckCircle } from "lucide-react";

const statuses: AssetStatus[] = ["available", "in-use", "maintenance", "damaged", "retired"];
const categories: AssetCategory[] = ["Laptop", "Monitor", "Printer", "Mobile", "Server", "Tablet", "Projector", "Network Equipment", "Other"];
const conditions = ["New", "Excellent", "Good", "Fair", "Poor", "Damaged"] as const;

interface AssetForm {
  name: string;
  model: string;
  serialNumber: string;
  category: AssetCategory;
  status: AssetStatus;
  purchaseDate: string;
  purchaseCost: string;
  currentValue: string;
  vendor: string;
  assignee: string;
  department: string;
  condition: string;
  description: string;
}

const emptyForm: AssetForm = {
  name: "", model: "", serialNumber: "", category: "Laptop", status: "available",
  purchaseDate: "", purchaseCost: "", currentValue: "", vendor: "", assignee: "",
  department: "", condition: "New", description: "",
};

export default function Assets() {
  const { isAdmin, isViewer } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState(initialAssets);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<AssetStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<AssetCategory | "all">("all");
  const [view, setView] = useState<"grid" | "table">("table");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<AssetForm>(emptyForm);

  const canEdit = isAdmin && !isViewer;

  const filtered = items.filter((a) => {
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    if (categoryFilter !== "all" && a.category !== categoryFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return a.name.toLowerCase().includes(q) || a.serialNumber.toLowerCase().includes(q) || a.id.toLowerCase().includes(q) || a.vendor.toLowerCase().includes(q);
    }
    return true;
  });

  const resetForm = () => { setForm(emptyForm); setEditing(null); setShowForm(false); };

  const handleEdit = (id: string) => {
    const a = items.find(x => x.id === id);
    if (!a) return;
    setEditing(a.id);
    setForm({
      name: a.name, model: a.model, serialNumber: a.serialNumber, category: a.category,
      status: a.status, purchaseDate: a.purchaseDate, purchaseCost: String(a.purchaseCost),
      currentValue: String(a.currentValue), vendor: a.vendor, assignee: a.assignee || "",
      department: a.department || "", condition: a.condition, description: a.description || "",
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setItems(prev => prev.filter(a => a.id !== id));
    toast({ title: "Asset deleted", description: "The asset has been removed." });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.serialNumber.trim()) {
      toast({ title: "Validation Error", description: "Name and Serial Number are required.", variant: "destructive" });
      return;
    }
    if (editing) {
      setItems(prev => prev.map(a => a.id === editing ? {
        ...a, name: form.name, model: form.model, serialNumber: form.serialNumber,
        category: form.category, status: form.status, purchaseDate: form.purchaseDate,
        purchaseCost: Number(form.purchaseCost) || 0, currentValue: Number(form.currentValue) || 0,
        vendor: form.vendor, assignee: form.assignee || null, department: form.department || null,
        condition: form.condition as any, description: form.description,
      } : a));
      toast({ title: "Asset updated", description: `"${form.name}" has been updated.` });
    } else {
      const newAsset = {
        id: `AST-${String(items.length + 1).padStart(3, "0")}`,
        name: form.name, model: form.model, serialNumber: form.serialNumber,
        category: form.category, status: form.status, purchaseDate: form.purchaseDate || new Date().toISOString().split("T")[0],
        purchaseCost: Number(form.purchaseCost) || 0, currentValue: Number(form.currentValue) || 0,
        vendor: form.vendor, assignee: form.assignee || null, department: form.department || null,
        condition: (form.condition || "New") as any, lastMaintenance: null, nextMaintenance: null,
        qrCode: `QR-AST-${String(items.length + 1).padStart(3, "0")}`, description: form.description,
      };
      setItems(prev => [...prev, newAsset]);
      toast({ title: "Asset created", description: `"${form.name}" has been added.` });
    }
    resetForm();
  };

  const totalValue = items.reduce((s, a) => s + a.currentValue, 0);
  const inUseCount = items.filter(a => a.status === "in-use").length;
  const maintenanceCount = items.filter(a => a.status === "maintenance" || a.status === "damaged").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Asset Management</h2>
        {canEdit && (
          <Button onClick={() => { resetForm(); setShowForm(true); }} className="bg-gradient-to-r from-primary to-primary/80 font-bold rounded-xl">
            <Plus className="w-4 h-4 mr-2" /> Add Asset
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Assets", value: items.length, icon: Package, gradient: "linear-gradient(135deg, #1a237e 0%, #0d47a1 50%, #1565c0 100%)" },
          { label: "Total Value", value: `PKR ${totalValue.toLocaleString()}`, icon: DollarSign, gradient: "linear-gradient(135deg, #1b5e20 0%, #2e7d32 50%, #388e3c 100%)" },
          { label: "In Use", value: inUseCount, icon: CheckCircle, gradient: "linear-gradient(135deg, #4a148c 0%, #6a1b9a 50%, #7b1fa2 100%)" },
          { label: "Needs Attention", value: maintenanceCount, icon: AlertTriangle, gradient: "linear-gradient(135deg, #e65100 0%, #ef6c00 50%, #f57c00 100%)" },
        ].map((s) => (
          <div key={s.label} className="relative overflow-hidden rounded-[1.25rem] p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl" style={{ background: s.gradient, border: '1.5px solid rgba(255,255,255,0.1)' }}>
            <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-white/[0.06] pointer-events-none" />
            <div className="absolute -bottom-5 -left-5 w-20 h-20 rounded-full bg-white/[0.05] pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent pointer-events-none" />
            <div className="relative flex items-center gap-3">
              <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm shadow-lg">
                <s.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-xs font-semibold uppercase tracking-wider text-white/60">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <div className="vision-card p-6 animate-scale-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              {editing ? "Edit Asset" : "New Asset"}
            </h3>
            <button onClick={resetForm} className="p-1 rounded-lg hover:bg-muted/30 text-muted-foreground"><X className="w-4 h-4" /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Name *</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Asset name" className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Model</Label>
              <Input value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} placeholder="Model number" className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Serial Number *</Label>
              <Input value={form.serialNumber} onChange={e => setForm(f => ({ ...f, serialNumber: e.target.value }))} placeholder="Serial number" className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Category</Label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as AssetCategory }))} className="select-vision">
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Status</Label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as AssetStatus }))} className="select-vision">
                {statuses.map(s => <option key={s} value={s}>{s.replace("-", " ").replace(/^\w/, c => c.toUpperCase())}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Condition</Label>
              <select value={form.condition} onChange={e => setForm(f => ({ ...f, condition: e.target.value }))} className="select-vision">
                {conditions.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Purchase Date</Label>
              <Input type="date" value={form.purchaseDate} onChange={e => setForm(f => ({ ...f, purchaseDate: e.target.value }))} className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Purchase Cost (PKR)</Label>
              <Input type="number" value={form.purchaseCost} onChange={e => setForm(f => ({ ...f, purchaseCost: e.target.value }))} placeholder="0" className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Current Value (PKR)</Label>
              <Input type="number" value={form.currentValue} onChange={e => setForm(f => ({ ...f, currentValue: e.target.value }))} placeholder="0" className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Vendor</Label>
              <Input value={form.vendor} onChange={e => setForm(f => ({ ...f, vendor: e.target.value }))} placeholder="Vendor name" className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Department</Label>
              <select value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} className="select-vision">
                <option value="">None</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Assignee</Label>
              <Input value={form.assignee} onChange={e => setForm(f => ({ ...f, assignee: e.target.value }))} placeholder="Assigned to" className="rounded-xl" />
            </div>
            <div className="md:col-span-3 space-y-1.5">
              <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Description</Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Notes..." className="rounded-xl min-h-[60px]" />
            </div>
            <div className="md:col-span-3 flex gap-2">
              <Button type="submit" className="bg-gradient-to-r from-primary to-primary/80 font-bold rounded-xl">
                {editing ? "Update Asset" : "Create Asset"}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm} className="rounded-xl">Cancel</Button>
            </div>
          </form>
        </div>
      )}

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
                    {canEdit && <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>}
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
                      {canEdit && (
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button onClick={() => handleEdit(a.id)} className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors"><Pencil className="w-4 h-4" /></button>
                            <button onClick={() => handleDelete(a.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      )}
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
