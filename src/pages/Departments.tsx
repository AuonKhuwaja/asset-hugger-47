import { useState } from "react";
import { departments as initialDepartments } from "@/lib/mock-data";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Search, Building2, X, Users } from "lucide-react";
import { ExportButtons } from "@/components/ExportButtons";

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
        {[
          { label: "Total Departments", value: items.length, icon: Building2, gradient: "linear-gradient(135deg, #1a237e 0%, #0d47a1 50%, #1565c0 100%)" },
          { label: "Total Employees", value: items.reduce((s, d) => s + d.employeeCount, 0), icon: Users, gradient: "linear-gradient(135deg, #1b5e20 0%, #2e7d32 50%, #388e3c 100%)" },
          { label: "Avg per Department", value: Math.round(items.reduce((s, d) => s + d.employeeCount, 0) / (items.length || 1)), icon: Building2, gradient: "linear-gradient(135deg, #4a148c 0%, #6a1b9a 50%, #7b1fa2 100%)" },
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
        <div className="p-5 border-b border-border/10 flex items-center justify-between gap-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">All Departments</h3>
          <div className="flex items-center gap-3">
            <ExportButtons
              filename="departments"
              title="Departments"
              columns={[
                { header: "ID", accessor: (d: Department) => d.id },
                { header: "Name", accessor: (d: Department) => d.name },
                { header: "Description", accessor: (d: Department) => d.description },
                { header: "Employees", accessor: (d: Department) => d.employeeCount },
                { header: "Created", accessor: (d: Department) => d.createdAt },
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
              <tr className="border-b-2 border-dashed border-border bg-muted/40">
                {["ID", "Name", "Description", "Employees", "Created", ...(canEdit ? ["Actions"] : [])].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-foreground border-r border-dashed border-border/60 last:border-r-0">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(dept => (
                <tr key={dept.id} className="border-b border-border/10 hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground border-r border-dashed border-border/40 last:border-r-0">{dept.id}</td>
                  <td className="px-4 py-3 font-medium flex items-center gap-2 border-r border-dashed border-border/40 last:border-r-0">
                    <Building2 className="w-4 h-4 text-primary" /> {dept.name}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground border-r border-dashed border-border/40 last:border-r-0">{dept.description}</td>
                  <td className="px-4 py-3 tabular-data border-r border-dashed border-border/40 last:border-r-0">{dept.employeeCount}</td>
                  <td className="px-4 py-3 tabular-data text-muted-foreground border-r border-dashed border-border/40 last:border-r-0">{dept.createdAt}</td>
                  {canEdit && (
                    <td className="px-4 py-3 border-r border-dashed border-border/40 last:border-r-0">
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
