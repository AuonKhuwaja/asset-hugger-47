import { useState } from "react";
import { departments as initialDepartments } from "@/lib/mock-data";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Search, Building2, X, Users } from "lucide-react";

interface Department {
  id: string;
  name: string;
  description: string;
  employeeCount: number;
  createdAt: string;
}

const seedDepartments: Department[] = initialDepartments.map((name, i) => ({
  id: `DEP-${String(i + 1).padStart(3, "0")}`,
  name,
  description: `${name} department`,
  employeeCount: Math.floor(Math.random() * 30) + 5,
  createdAt: "2024-01-10",
}));

export default function Departments() {
  const { isViewer, isAdmin } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<Department[]>(seedDepartments);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });

  const filtered = items.filter(d => {
    if (!search) return true;
    const q = search.toLowerCase();
    return d.name.toLowerCase().includes(q) || d.description.toLowerCase().includes(q);
  });

  const resetForm = () => {
    setForm({ name: "", description: "" });
    setEditing(null);
    setShowForm(false);
  };

  const handleEdit = (dept: Department) => {
    setEditing(dept);
    setForm({ name: dept.name, description: dept.description });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setItems(prev => prev.filter(d => d.id !== id));
    toast({ title: "Department deleted", description: "The department has been removed." });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast({ title: "Validation Error", description: "Department name is required.", variant: "destructive" });
      return;
    }
    if (editing) {
      setItems(prev => prev.map(d => d.id === editing.id ? { ...d, name: form.name, description: form.description } : d));
      toast({ title: "Department updated", description: `"${form.name}" has been updated.` });
    } else {
      const newDept: Department = {
        id: `DEP-${String(items.length + 1).padStart(3, "0")}`,
        name: form.name,
        description: form.description,
        employeeCount: 0,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setItems(prev => [...prev, newDept]);
      toast({ title: "Department created", description: `"${form.name}" has been added.` });
    }
    resetForm();
  };

  const canEdit = isAdmin && !isViewer;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Departments</h2>
        {canEdit && (
          <Button onClick={() => { resetForm(); setShowForm(true); }} className="bg-gradient-to-r from-primary to-primary/80 font-bold rounded-xl">
            <Plus className="w-4 h-4 mr-2" /> Add Department
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="vision-card p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{items.length}</p>
            <p className="text-xs text-muted-foreground">Total Departments</p>
          </div>
        </div>
        <div className="vision-card p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10">
            <Users className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{items.reduce((s, d) => s + d.employeeCount, 0)}</p>
            <p className="text-xs text-muted-foreground">Total Employees</p>
          </div>
        </div>
        <div className="vision-card p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <Building2 className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{Math.round(items.reduce((s, d) => s + d.employeeCount, 0) / (items.length || 1))}</p>
            <p className="text-xs text-muted-foreground">Avg per Department</p>
          </div>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="vision-card p-6 animate-scale-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              {editing ? "Edit Department" : "New Department"}
            </h3>
            <button onClick={resetForm} className="p-1 rounded-lg hover:bg-muted/30 text-muted-foreground"><X className="w-4 h-4" /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Name</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Department name" className="rounded-xl" />
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
        <div className="p-5 border-b border-border/10 flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">All Departments</h3>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-muted/20 border border-border/20 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/10">
                {["ID", "Name", "Description", "Employees", "Created", ...(canEdit ? ["Actions"] : [])].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(dept => (
                <tr key={dept.id} className="border-b border-border/10 hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{dept.id}</td>
                  <td className="px-4 py-3 font-medium flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-primary" /> {dept.name}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{dept.description}</td>
                  <td className="px-4 py-3 tabular-data">{dept.employeeCount}</td>
                  <td className="px-4 py-3 tabular-data text-muted-foreground">{dept.createdAt}</td>
                  {canEdit && (
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => handleEdit(dept)} className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(dept.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No departments found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
