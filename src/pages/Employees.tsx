import { useState, useRef } from "react";
import { employees as initialEmployees, departments } from "@/lib/mock-data";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Search, Users, UserCog, X, Mail, Phone, Upload, FileSpreadsheet } from "lucide-react";

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  status: "active" | "inactive";
  joinDate: string;
}

const seedEmployees: Employee[] = initialEmployees.map((name, i) => ({
  id: `EMP-${String(i + 1).padStart(3, "0")}`,
  name,
  email: `${name.toLowerCase().replace(/\s+/g, ".")}@company.com`,
  phone: `+92 3${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)} ${String(Math.floor(Math.random() * 9000000) + 1000000)}`,
  department: departments[i % departments.length],
  designation: ["Software Engineer", "Manager", "Analyst", "Designer", "Team Lead", "Executive", "Coordinator", "Specialist", "Director", "Associate"][i % 10],
  status: Math.random() > 0.15 ? "active" : "inactive",
  joinDate: `2024-0${(i % 9) + 1}-${String((i % 28) + 1).padStart(2, "0")}`,
}));

export default function Employees() {
  const { isViewer, isAdmin } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<Employee[]>(seedEmployees);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", department: "", designation: "", status: "active" as "active" | "inactive" });

  const filtered = items.filter((e) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q) || e.department.toLowerCase().includes(q) || e.designation.toLowerCase().includes(q);
  });

  const resetForm = () => {
    setForm({ name: "", email: "", phone: "", department: "", designation: "", status: "active" });
    setEditing(null);
    setShowForm(false);
  };

  const handleEdit = (emp: Employee) => {
    setEditing(emp);
    setForm({ name: emp.name, email: emp.email, phone: emp.phone, department: emp.department, designation: emp.designation, status: emp.status });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((e) => e.id !== id));
    toast({ title: "Employee deleted", description: "The employee has been removed." });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toast({ title: "Validation Error", description: "Name and Email are required.", variant: "destructive" });
      return;
    }
    if (editing) {
      setItems((prev) => prev.map((emp) => (emp.id === editing.id ? { ...emp, ...form } : emp)));
      toast({ title: "Employee updated", description: `"${form.name}" has been updated.` });
    } else {
      const newEmp: Employee = {
        id: `EMP-${String(items.length + 1).padStart(3, "0")}`,
        name: form.name,
        email: form.email,
        phone: form.phone,
        department: form.department,
        designation: form.designation,
        status: form.status,
        joinDate: new Date().toISOString().split("T")[0],
      };
      setItems((prev) => [...prev, newEmp]);
      toast({ title: "Employee created", description: `"${form.name}" has been added.` });
    }
    resetForm();
  };

  const canEdit = isAdmin && !isViewer;
  const activeCount = items.filter((e) => e.status === "active").length;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseCSV = (text: string): Employee[] => {
    const lines = text.trim().split("\n");
    if (lines.length < 2) return [];
    const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
    const nameIdx = headers.findIndex(h => h.includes("name"));
    const emailIdx = headers.findIndex(h => h.includes("email"));
    const phoneIdx = headers.findIndex(h => h.includes("phone"));
    const deptIdx = headers.findIndex(h => h.includes("department") || h.includes("dept"));
    const desigIdx = headers.findIndex(h => h.includes("designation") || h.includes("title") || h.includes("role"));

    if (nameIdx === -1 || emailIdx === -1) {
      toast({ title: "Invalid file", description: "CSV must have 'Name' and 'Email' columns", variant: "destructive" });
      return [];
    }

    const newEmployees: Employee[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map(c => c.trim().replace(/^"|"$/g, ""));
      if (!cols[nameIdx] || !cols[emailIdx]) continue;
      newEmployees.push({
        id: `EMP-${String(items.length + newEmployees.length + 1).padStart(3, "0")}`,
        name: cols[nameIdx],
        email: cols[emailIdx],
        phone: phoneIdx >= 0 ? cols[phoneIdx] || "" : "",
        department: deptIdx >= 0 ? cols[deptIdx] || "" : "",
        designation: desigIdx >= 0 ? cols[desigIdx] || "" : "",
        status: "active",
        joinDate: new Date().toISOString().split("T")[0],
      });
    }
    return newEmployees;
  };

  const handleBulkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "csv" && ext !== "xlsx" && ext !== "xls") {
      toast({ title: "Unsupported format", description: "Please upload a CSV or Excel (.xlsx/.xls) file", variant: "destructive" });
      return;
    }

    if (ext === "csv") {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        const newEmps = parseCSV(text);
        if (newEmps.length > 0) {
          setItems(prev => [...prev, ...newEmps]);
          toast({ title: "Bulk upload complete", description: `${newEmps.length} employee(s) imported successfully.` });
        }
      };
      reader.readAsText(file);
    } else {
      // For Excel files, parse as CSV-like using basic binary read
      toast({ title: "Excel support", description: "For Excel files, please save as CSV first and re-upload.", variant: "destructive" });
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-xl font-bold text-foreground">Employees</h2>
        {canEdit && (
          <div className="flex items-center gap-2">
            <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleBulkUpload} />
            <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="rounded-xl">
              <Upload className="w-4 h-4 mr-2" /> Bulk Upload
            </Button>
            <Button onClick={() => { resetForm(); setShowForm(true); }} className="bg-gradient-to-r from-primary to-primary/80 font-bold rounded-xl">
              <Plus className="w-4 h-4 mr-2" /> Add Employee
            </Button>
          </div>
        )}
      </div>

      {/* Bulk upload hint */}
      {canEdit && (
        <div className="p-3 rounded-xl border border-primary/20 bg-primary/5 flex items-center gap-3">
          <FileSpreadsheet className="w-5 h-5 text-primary shrink-0" />
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Bulk Upload:</span> Upload a CSV file with columns: Name, Email, Phone, Department, Designation
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Employees", value: items.length, icon: Users, gradient: "linear-gradient(135deg, #1a237e 0%, #0d47a1 50%, #1565c0 100%)" },
          { label: "Active", value: activeCount, icon: UserCog, gradient: "linear-gradient(135deg, #1b5e20 0%, #2e7d32 50%, #388e3c 100%)" },
          { label: "Inactive", value: items.length - activeCount, icon: Users, gradient: "linear-gradient(135deg, #e65100 0%, #ef6c00 50%, #f57c00 100%)" },
          { label: "Departments", value: new Set(items.map((e) => e.department)).size, icon: Mail, gradient: "linear-gradient(135deg, #4a148c 0%, #6a1b9a 50%, #7b1fa2 100%)" },
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
              {editing ? "Edit Employee" : "New Employee"}
            </h3>
            <button onClick={resetForm} className="p-1 rounded-lg hover:bg-muted/30 text-muted-foreground"><X className="w-4 h-4" /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Full Name *</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Employee name" className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Email *</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="email@company.com" className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+92 300 1234567" className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Department</Label>
              <select value={form.department} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))} className="select-vision">
                <option value="">Choose department...</option>
                {departments.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Designation</Label>
              <Input value={form.designation} onChange={(e) => setForm((f) => ({ ...f, designation: e.target.value }))} placeholder="Job title" className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Status</Label>
              <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as "active" | "inactive" }))} className="select-vision">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="md:col-span-3 flex gap-2">
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
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">All Employees</h3>
          <div className="flex items-center gap-3">
            <ExportButtons
              filename="employees"
              title="Employees"
              columns={[
                { header: "ID", accessor: (e: Employee) => e.id },
                { header: "Name", accessor: (e: Employee) => e.name },
                { header: "Email", accessor: (e: Employee) => e.email },
                { header: "Phone", accessor: (e: Employee) => e.phone },
                { header: "Department", accessor: (e: Employee) => e.department },
                { header: "Designation", accessor: (e: Employee) => e.designation },
                { header: "Status", accessor: (e: Employee) => e.status },
                { header: "Join Date", accessor: (e: Employee) => e.joinDate },
              ]}
              rows={filtered}
            />
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-muted/20 border border-border/20 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/10">
                {["ID", "Name", "Email", "Phone", "Department", "Designation", "Status", ...(canEdit ? ["Actions"] : [])].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp) => (
                <tr key={emp.id} className="border-b border-border/10 hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{emp.id}</td>
                  <td className="px-4 py-3 font-medium flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                      {emp.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    {emp.name}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{emp.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">{emp.phone}</td>
                  <td className="px-4 py-3 text-muted-foreground">{emp.department}</td>
                  <td className="px-4 py-3 text-muted-foreground">{emp.designation}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${emp.status === "active" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
                      {emp.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </td>
                  {canEdit && (
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => handleEdit(emp)} className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(emp.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={canEdit ? 8 : 7} className="px-4 py-8 text-center text-muted-foreground">No employees found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
