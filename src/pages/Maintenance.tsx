import { useState, useMemo } from "react";
import { maintenanceRecords as initialRecords, assets, employees } from "@/lib/mock-data";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  Wrench, Search, Plus, Clock, History, CheckCircle, AlertTriangle, DollarSign,
  X, Pencil, Trash2, Mail, Repeat, Send, Users, CalendarDays, ShieldCheck, ChevronDown, Check, CalendarRange,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { ExportButtons } from "@/components/ExportButtons";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";

type Recurrence = "none" | "daily" | "weekly" | "monthly";
type TypeFilter = "all" | "preventive" | "corrective";

export default function Maintenance() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "schedule";

  const [records, setRecords] = useState<any[]>(initialRecords);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [form, setForm] = useState({
    assetId: "", type: "preventive" as "preventive" | "corrective",
    date: "", cost: "", description: "", technician: "",
    recurrence: "none" as Recurrence, notifyEmail: "",
  });

  // Notifier state
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [notifyMessage, setNotifyMessage] = useState("");
  const [employeePickerOpen, setEmployeePickerOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const dateFrom = dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : "";
  const dateTo = dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : "";

  const scheduled = records.filter(m => m.status === "scheduled" || m.status === "in-progress");
  const completed = records.filter(m => m.status === "completed");
  const displayRecords = activeTab === "schedule" ? scheduled : completed;

  const filtered = displayRecords.filter((m) => {
    if (typeFilter !== "all" && m.type !== typeFilter) return false;
    if (dateFrom && m.date < dateFrom) return false;
    if (dateTo && m.date > dateTo) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return m.assetName.toLowerCase().includes(q)
        || m.description.toLowerCase().includes(q)
        || m.technician.toLowerCase().includes(q);
  });

  // ── Due-soon employees (employees whose assigned asset has scheduled maintenance soon) ──
  const dueSoon = useMemo(() => {
    const today = new Date();
    return scheduled
      .map((m) => {
        const asset = assets.find(a => a.id === m.assetId);
        const assignee = asset?.assignee || null;
        const due = new Date(m.date);
        const days = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return { id: m.id, assignee, assetName: m.assetName, date: m.date, type: m.type, daysUntil: days };
      })
      .filter(x => x.assignee)
      .filter(x => {
        if (dateFrom && x.date < dateFrom) return false;
        if (dateTo && x.date > dateTo) return false;
        return true;
      })
      .sort((a, b) => a.daysUntil - b.daysUntil);
  }, [scheduled, dateFrom, dateTo]);

  // Unique employees with maintenance in the selected range (only when range chosen)
  const filteredEmployees = useMemo(() => {
    const set = new Set<string>();
    dueSoon.forEach(d => { if (d.assignee) set.add(d.assignee); });
    return Array.from(set);
  }, [dueSoon]);

  const rangeActive = !!(dateFrom || dateTo);

  const toggleEmployee = (name: string) =>
    setSelectedEmployees(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);

  const sendNotification = () => {
    if (selectedEmployees.length === 0) {
      toast({ title: "No recipients", description: "Select at least one employee.", variant: "destructive" });
      return;
    }
    const cc = user?.email || "you@company.com";
    toast({
      title: "📧 Email sent",
      description: `Maintenance notice delivered to ${selectedEmployees.length} employee(s). CC: ${cc}`,
    });
    setSelectedEmployees([]);
    setNotifyMessage("");
  };

  const resetForm = () => {
    setForm({ assetId: "", type: "preventive", date: "", cost: "", description: "", technician: "", recurrence: "none", notifyEmail: "" });
    setEditing(null);
    setShowForm(false);
  };

  const handleEdit = (id: string) => {
    const m = records.find(x => x.id === id);
    if (!m) return;
    setEditing(m.id);
    setForm({
      assetId: m.assetId, type: m.type, date: m.date, cost: String(m.cost),
      description: m.description, technician: m.technician,
      recurrence: (m.recurrence as Recurrence) || "none", notifyEmail: m.notifyEmail || "",
    });
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
  const isHistory = activeTab === "history";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Maintenance</h2>
        {!isHistory && (
          <Button
            onClick={() => { resetForm(); setShowForm(!showForm); }}
            className={showForm ? "bg-muted hover:bg-muted/80" : "bg-gradient-to-r from-primary to-primary/80 font-bold rounded-xl"}
          >
            <Plus className="w-4 h-4 mr-2" />
            {showForm ? "Cancel" : "Schedule Maintenance"}
          </Button>
        )}
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
            onClick={() => {
              setSearchParams(t.key === "schedule" ? {} : { tab: t.key });
              setShowForm(false); setEditing(null);
            }}
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

      {/* Form — Schedule tab only */}
      {!isHistory && showForm && (
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

      {/* ── Schedule tab: Due-soon notifier ── */}
      {!isHistory && (
        <div className="vision-card p-5 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Maintenance Coming Due</h3>
                <p className="text-xs text-muted-foreground">Select employees and email them an alert</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Popover open={employeePickerOpen} onOpenChange={setEmployeePickerOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="rounded-xl gap-2 min-w-[200px] justify-between">
                    <span className="flex items-center gap-2 truncate">
                      <Users className="w-4 h-4" />
                      {selectedEmployees.length === 0
                        ? "Select employees..."
                        : `${selectedEmployees.length} selected`}
                    </span>
                    <ChevronDown className="w-4 h-4 opacity-60" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-0 bg-popover" align="end">
                  <div className="p-2 border-b border-border/30 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase text-muted-foreground">Employees</span>
                    {selectedEmployees.length > 0 && (
                      <button onClick={() => setSelectedEmployees([])} className="text-xs text-primary hover:underline">Clear</button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto py-1">
                    {employees.map((name) => {
                      const checked = selectedEmployees.includes(name);
                      return (
                        <button
                          key={name}
                          type="button"
                          onClick={() => toggleEmployee(name)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted/50 text-left"
                        >
                          <div className={`w-4 h-4 rounded border flex items-center justify-center ${checked ? "bg-primary border-primary" : "border-border"}`}>
                            {checked && <Check className="w-3 h-3 text-primary-foreground" />}
                          </div>
                          <span className="flex-1 truncate text-foreground">{name}</span>
                        </button>
                      );
                    })}
                  </div>
                </PopoverContent>
              </Popover>
              <Button
                onClick={sendNotification}
                disabled={selectedEmployees.length === 0}
                className="bg-gradient-to-r from-primary to-primary/80 rounded-xl font-bold disabled:opacity-50"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Email {selectedEmployees.length > 0 ? `(${selectedEmployees.length})` : ""}
              </Button>
            </div>
          </div>

          {dueSoon.length === 0 ? (
            <div className="text-sm text-muted-foreground py-6 text-center">No upcoming maintenance with assigned employees.</div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                {dueSoon.map((d) => {
                  const checked = selectedEmployees.includes(d.assignee!);
                  const overdue = d.daysUntil < 0;
                  return (
                    <label
                      key={d.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                        checked ? "bg-primary/10 border-primary/40" : "bg-muted/10 border-border/20 hover:border-border/40"
                      }`}
                    >
                      <Checkbox checked={checked} onCheckedChange={() => toggleEmployee(d.assignee!)} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Users className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-sm font-semibold text-foreground truncate">{d.assignee}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            d.type === "preventive" ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive"
                          }`}>{d.type}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                          <span className="truncate">{d.assetName}</span>
                          <span>·</span>
                          <CalendarDays className="w-3 h-3" />
                          <span className={overdue ? "text-destructive font-semibold" : ""}>
                            {overdue ? `${Math.abs(d.daysUntil)}d overdue` : `in ${d.daysUntil}d`}
                          </span>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="space-y-2 pt-2 border-t border-border/10">
                <Label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Optional message</Label>
                <Textarea
                  value={notifyMessage}
                  onChange={(e) => setNotifyMessage(e.target.value)}
                  placeholder="Add a note for the recipients..."
                  className="border-border/30 rounded-xl min-h-[60px]"
                />
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                  You ({user?.email || "current user"}) will be added on CC automatically.
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── History: clean read-only display ── */}
      {isHistory ? (
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
                filename="maintenance-history"
                title="Maintenance History"
                columns={[
                  { header: "ID", accessor: (m: any) => m.id },
                  { header: "Asset", accessor: (m: any) => m.assetName },
                  { header: "Type", accessor: (m: any) => m.type },
                  { header: "Description", accessor: (m: any) => m.description },
                  { header: "Technician", accessor: (m: any) => m.technician },
                  { header: "Date", accessor: (m: any) => m.date },
                  { header: "Cost (PKR)", accessor: (m: any) => m.cost },
                ]}
                rows={filtered}
              />
              <div className="flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4 text-muted-foreground" />
                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-9 w-[140px] rounded-xl text-xs" title="From" />
                <span className="text-xs text-muted-foreground">→</span>
                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-9 w-[140px] rounded-xl text-xs" title="To" />
                {(dateFrom || dateTo) && (
                  <button onClick={() => { setDateFrom(""); setDateTo(""); }} className="p-1 rounded hover:bg-muted/30 text-muted-foreground" title="Clear date filter"><X className="w-3.5 h-3.5" /></button>
                )}
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="text" placeholder="Search history..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 rounded-xl bg-muted/20 border border-border/20 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground">
              <History className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No completed maintenance records yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
              {filtered.map((m) => (
                <div key={m.id} className="rounded-2xl border border-border/20 bg-muted/5 p-4 hover:border-primary/30 transition-all">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-700/20 border border-emerald-500/30 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{m.assetName}</p>
                        <p className="text-xs text-muted-foreground font-mono">{m.id}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold ${
                      m.type === "preventive" ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive"
                    }`}>{m.type}</span>
                  </div>
                  {m.description && <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{m.description}</p>}
                  <div className="grid grid-cols-3 gap-2 text-xs pt-3 border-t border-border/10">
                    <div>
                      <p className="text-muted-foreground uppercase tracking-wider text-[10px] font-semibold">Date</p>
                      <p className="text-foreground font-medium mt-0.5">{m.date}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground uppercase tracking-wider text-[10px] font-semibold">Technician</p>
                      <p className="text-foreground font-medium mt-0.5 truncate">{m.technician || "—"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-muted-foreground uppercase tracking-wider text-[10px] font-semibold">Cost</p>
                      <p className="text-primary font-bold mt-0.5">PKR {m.cost.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        // ── Schedule tab: editable table ──
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
                filename="maintenance-schedule"
                title="Maintenance Schedule"
                columns={[
                  { header: "ID", accessor: (m: any) => m.id },
                  { header: "Asset", accessor: (m: any) => m.assetName },
                  { header: "Type", accessor: (m: any) => m.type },
                  { header: "Description", accessor: (m: any) => m.description },
                  { header: "Technician", accessor: (m: any) => m.technician },
                  { header: "Date", accessor: (m: any) => m.date },
                  { header: "Recurrence", accessor: (m: any) => m.recurrence || "none" },
                  { header: "Cost (PKR)", accessor: (m: any) => m.cost },
                  { header: "Status", accessor: (m: any) => m.status },
                ]}
                rows={filtered}
              />
              <div className="flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4 text-muted-foreground" />
                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-9 w-[140px] rounded-xl text-xs" title="From" />
                <span className="text-xs text-muted-foreground">→</span>
                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-9 w-[140px] rounded-xl text-xs" title="To" />
                {(dateFrom || dateTo) && (
                  <button onClick={() => { setDateFrom(""); setDateTo(""); }} className="p-1 rounded hover:bg-muted/30 text-muted-foreground" title="Clear date filter"><X className="w-3.5 h-3.5" /></button>
                )}
              </div>
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
                  <tr><td colSpan={10} className="px-4 py-8 text-center text-muted-foreground">No records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
