import { useState } from "react";
import { maintenanceRecords as initialRecords, assets } from "@/lib/mock-data";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Wrench, Search, Plus, Clock, History, CheckCircle, AlertTriangle, DollarSign, X, Pencil, Trash2, Mail, Repeat } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { ExportButtons } from "@/components/ExportButtons";

type Recurrence = "none" | "daily" | "weekly" | "monthly";

export default function Maintenance() {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "schedule";

  const [records, setRecords] = useState<any[]>(initialRecords);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "preventive" | "corrective">("all");
  const [form, setForm] = useState({ assetId: "", type: "preventive" as "preventive" | "corrective", date: "", cost: "", description: "", technician: "", recurrence: "none" as Recurrence, notifyEmail: "" });

  const scheduled = records.filter(m => m.status === "scheduled" || m.status === "in-progress");
  const completed = records.filter(m => m.status === "completed");
  const displayRecords = activeTab === "schedule" ? scheduled : completed;

  const filtered = displayRecords.filter((m) => {
    if (typeFilter !== "all" && m.type !== typeFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return m.assetName.toLowerCase().includes(q) || m.description.toLowerCase().includes(q) || m.technician.toLowerCase().includes(q);
  });

  const resetForm = () => { setForm({ assetId: "", type: "preventive", date: "", cost: "", description: "", technician: "", recurrence: "none", notifyEmail: "" }); setEditing(null); setShowForm(false); };

  const handleEdit = (id: string) => {
    const m = records.find(x => x.id === id);
    if (!m) return;
    setEditing(m.id);
    setForm({ assetId: m.assetId, type: m.type, date: m.date, cost: String(m.cost), description: m.description, technician: m.technician, recurrence: (m.recurrence as Recurrence) || "none", notifyEmail: m.notifyEmail || "" });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setRecords(prev => prev.filter(m => m.id !== id));
    toast({ title: "Record deleted", description: "Maintenance record has been removed." });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.assetId || !form.date) {
      toast({ title: "Validation Error", description: "Asset and date are required.", variant: "destructive" });
      return;
    }
    if (form.notifyEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.notifyEmail)) {
      toast({ title: "Invalid email", description: "Enter a valid notification email.", variant: "destructive" });
      return;
    }
    const selectedAsset = assets.find(a => a.id === form.assetId);
    const payload = {
      assetId: form.assetId, assetName: selectedAsset?.name || "Unknown",
      type: form.type, date: form.date, cost: Number(form.cost) || 0,
      description: form.description, technician: form.technician,
      recurrence: form.recurrence, notifyEmail: form.notifyEmail,
    };
    if (editing) {
      setRecords(prev => prev.map(m => m.id === editing ? { ...m, ...payload } : m));
      toast({ title: "Record updated", description: "Maintenance record has been updated." });
    } else {
      const newRecord = { id: `MNT-${String(records.length + 1).padStart(3, "0")}`, ...payload, status: "scheduled" as const };
      setRecords(prev => [...prev, newRecord]);
      toast({
        title: "Maintenance Scheduled",
        description: form.notifyEmail
          ? `Record saved. Email alert will be sent to ${form.notifyEmail}${form.recurrence !== "none" ? ` (recurs ${form.recurrence})` : ""}.`
          : `Record created${form.recurrence !== "none" ? ` (recurs ${form.recurrence})` : ""}.`,
      });
    }
    resetForm();
  };

  const totalCost = records.reduce((s, m) => s + m.cost, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Maintenance</h2>
        <Button onClick={() => { resetForm(); setShowForm(!showForm); }} className={showForm ? "bg-muted hover:bg-muted/80" : "bg-gradient-to-r from-primary to-primary/80 font-bold rounded-xl"}>
          <Plus className="w-4 h-4 mr-2" />
          {showForm ? "Cancel" : "Schedule Maintenance"}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Records", value: records.length, icon: Wrench, gradient: "linear-gradient(135deg, #1a237e 0%, #0d47a1 50%, #1565c0 100%)" },
          { label: "Scheduled", value: scheduled.length, icon: Clock, gradient: "linear-gradient(135deg, #e65100 0%, #ef6c00 50%, #f57c00 100%)" },
          { label: "Completed", value: completed.length, icon: CheckCircle, gradient: "linear-gradient(135deg, #1b5e20 0%, #2e7d32 50%, #388e3c 100%)" },
          { label: "Total Cost", value: `PKR ${totalCost.toLocaleString()}`, icon: DollarSign, gradient: "linear-gradient(135deg, #4a148c 0%, #6a1b9a 50%, #7b1fa2 100%)" },
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

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { key: "schedule", label: "Schedule", icon: Clock },
          { key: "history", label: "History", icon: History },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setSearchParams(t.key === "schedule" ? {} : { tab: t.key })}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === t.key
                ? "bg-gradient-to-r from-primary/20 to-primary/10 text-primary border border-primary/30"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/20"
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
            <span className="ml-1 text-xs opacity-60">({t.key === "schedule" ? scheduled.length : completed.length})</span>
          </button>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="vision-card p-6 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                <Wrench className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-base font-bold text-foreground">{editing ? "Edit Record" : "Schedule Maintenance"}</h3>
            </div>
            <button type="button" onClick={resetForm} className="p-1 rounded-lg hover:bg-muted/30 text-muted-foreground"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Asset *</Label>
              <select value={form.assetId} onChange={e => setForm(f => ({ ...f, assetId: e.target.value }))} className="select-vision">
                <option value="">Select asset...</option>
                {assets.map((a) => <option key={a.id} value={a.id}>{a.name} ({a.id})</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Type</Label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as any }))} className="select-vision">
                <option value="preventive">Preventive</option>
                <option value="corrective">Corrective</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Date *</Label>
              <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="border-border/30 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Cost (PKR)</Label>
              <Input type="number" value={form.cost} onChange={e => setForm(f => ({ ...f, cost: e.target.value }))} placeholder="0" className="border-border/30 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Technician</Label>
              <Input value={form.technician} onChange={e => setForm(f => ({ ...f, technician: e.target.value }))} placeholder="Name" className="border-border/30 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5"><Repeat className="w-3.5 h-3.5" /> Recurrence</Label>
              <select value={form.recurrence} onChange={e => setForm(f => ({ ...f, recurrence: e.target.value as Recurrence }))} className="select-vision">
                <option value="none">One-time</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Notify Email</Label>
              <Input type="email" value={form.notifyEmail} onChange={e => setForm(f => ({ ...f, notifyEmail: e.target.value }))} placeholder="alerts@company.com" className="border-border/30 rounded-xl" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Description</Label>
            <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe the work..." className="border-border/30 rounded-xl min-h-[80px]" />
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="bg-gradient-to-r from-primary to-primary/80 font-bold rounded-xl">{editing ? "Update Record" : "Save Record"}</Button>
            <Button type="button" variant="outline" onClick={resetForm} className="rounded-xl">Cancel</Button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="vision-card overflow-hidden">
        <div className="p-5 border-b border-border/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            {(["all", "preventive", "corrective"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  typeFilter === t ? "bg-primary/20 text-primary border border-primary/30" : "text-muted-foreground hover:text-foreground hover:bg-muted/20"
                }`}
              >
                {t === "all" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <ExportButtons
              filename="maintenance-records"
              title="Maintenance Records"
              columns={[
                { header: "ID", accessor: (m: any) => m.id },
                { header: "Asset", accessor: (m: any) => m.assetName },
                { header: "Type", accessor: (m: any) => m.type },
                { header: "Description", accessor: (m: any) => m.description },
                { header: "Technician", accessor: (m: any) => m.technician },
                { header: "Date", accessor: (m: any) => m.date },
                { header: "Recurrence", accessor: (m: any) => m.recurrence || "none" },
                { header: "Notify Email", accessor: (m: any) => m.notifyEmail || "" },
                { header: "Cost (PKR)", accessor: (m: any) => m.cost },
                { header: "Status", accessor: (m: any) => m.status },
              ]}
              rows={filtered}
            />
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 rounded-xl bg-muted/20 border border-border/20 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/10">
                {["ID", "Asset", "Type", "Description", "Technician", "Date", "Recurrence", "Cost", "Status", "Actions"].map((h) => (
                  <th key={h} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground ${h === "Cost" ? "text-right" : "text-left"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id} className="border-b border-border/10 hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{m.id}</td>
                  <td className="px-4 py-3 font-medium">{m.assetName}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold ${m.type === "preventive" ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive"}`}>
                      {m.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate">{m.description}</td>
                  <td className="px-4 py-3 text-muted-foreground">{m.technician}</td>
                  <td className="px-4 py-3 tabular-data text-muted-foreground">{m.date}</td>
                  <td className="px-4 py-3">
                    {m.recurrence && m.recurrence !== "none" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-secondary/20 text-secondary-foreground border border-border/30">
                        <Repeat className="w-3 h-3" /> {m.recurrence}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right tabular-data font-medium text-primary">PKR {m.cost.toLocaleString()}</td>
                  <td className="px-4 py-3"><StatusBadge status={m.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => handleEdit(m.id)} className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(m.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">No records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
