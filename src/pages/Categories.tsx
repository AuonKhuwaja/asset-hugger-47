import { useState } from "react";
import { categories as initialCategories, type Category } from "@/lib/mock-data";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Search, FolderOpen, X } from "lucide-react";
import { ExportButtons } from "@/components/ExportButtons";

export default function Categories() {
  const { isViewer } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<Category[]>(initialCategories);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });

  const filtered = items.filter(c => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q);
  });

  const resetForm = () => {
    setForm({ name: "", description: "" });
    setEditing(null);
    setShowForm(false);
  };

  const handleEdit = (cat: Category) => {
    setEditing(cat);
    setForm({ name: cat.name, description: cat.description });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setItems(prev => prev.filter(c => c.id !== id));
    toast({ title: "Category deleted", description: "The category has been removed." });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast({ title: "Validation Error", description: "Category name is required.", variant: "destructive" });
      return;
    }
    if (editing) {
      setItems(prev => prev.map(c => c.id === editing.id ? { ...c, name: form.name, description: form.description } : c));
      toast({ title: "Category updated", description: `"${form.name}" has been updated.` });
    } else {
      const newCat: Category = {
        id: `CAT-${String(items.length + 1).padStart(3, "0")}`,
        name: form.name,
        description: form.description,
        assetCount: 0,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setItems(prev => [...prev, newCat]);
      toast({ title: "Category created", description: `"${form.name}" has been added.` });
    }
    resetForm();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Categories</h2>
        {!isViewer && (
          <Button onClick={() => { resetForm(); setShowForm(true); }} className="bg-gradient-to-r from-primary to-primary/80 font-bold rounded-xl">
            <Plus className="w-4 h-4 mr-2" /> Add Category
          </Button>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="vision-card p-6 animate-scale-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              {editing ? "Edit Category" : "New Category"}
            </h3>
            <button onClick={resetForm} className="p-1 rounded-lg hover:bg-muted/30 text-muted-foreground"><X className="w-4 h-4" /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Name</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Category name" className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Description</Label>
              <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Short description" className="rounded-xl" />
            </div>
            <div className="md:col-span-2 flex gap-2">
              <Button type="submit" className="bg-gradient-to-r from-primary to-primary/80 font-bold rounded-xl">
                {editing ? "Update" : "Create"}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm} className="rounded-xl">Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="vision-card overflow-hidden">
        <div className="p-5 border-b border-border/10 flex items-center justify-between gap-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">All Categories</h3>
          <div className="flex items-center gap-3">
            <ExportButtons
              filename="categories"
              title="Categories"
              columns={[
                { header: "ID", accessor: (c: Category) => c.id },
                { header: "Name", accessor: (c: Category) => c.name },
                { header: "Description", accessor: (c: Category) => c.description },
                { header: "Asset Count", accessor: (c: Category) => c.assetCount },
                { header: "Created", accessor: (c: Category) => c.createdAt },
              ]}
              rows={filtered}
            />
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-muted/20 border border-border/20 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-dashed border-border bg-primary/15 dark:bg-primary/20">
                {["ID", "Name", "Description", "Assets", "Created", ...(isViewer ? [] : ["Actions"])].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-foreground border-r border-dashed border-border/60 last:border-r-0">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(cat => (
                <tr key={cat.id} className="border-b border-dashed border-border/70 transition-colors hover:bg-muted/50">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground border-r border-dashed border-border/40 last:border-r-0">{cat.id}</td>
                  <td className="px-4 py-3 font-medium flex items-center gap-2 border-r border-dashed border-border/40 last:border-r-0">
                    <FolderOpen className="w-4 h-4 text-primary" /> {cat.name}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground border-r border-dashed border-border/40 last:border-r-0">{cat.description}</td>
                  <td className="px-4 py-3 tabular-data border-r border-dashed border-border/40 last:border-r-0">{cat.assetCount}</td>
                  <td className="px-4 py-3 tabular-data text-muted-foreground border-r border-dashed border-border/40 last:border-r-0">{cat.createdAt}</td>
                  {!isViewer && (
                    <td className="px-4 py-3 border-r border-dashed border-border/40 last:border-r-0">
                      <div className="flex gap-1">
                        <button onClick={() => handleEdit(cat)} className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(cat.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No categories found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
