import { useState, useMemo, useEffect } from "react";
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
  X, Pencil, Trash2, Mail, Repeat, Send, Users, CalendarDays, ShieldCheck, ChevronDown, Check, CalendarRange, MailCheck, MailX, MailWarning,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { ExportButtons } from "@/components/ExportButtons";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";

const EMAIL_LOG_KEY = "tv_maintenance_email_log";
type EmailLog = Record<string, string>; // recordId -> ISO timestamp
function loadEmailLog(): EmailLog {
  try { return JSON.parse(localStorage.getItem(EMAIL_LOG_KEY) || "{}"); } catch { return {}; }
}
function saveEmailLog(log: EmailLog) {
  localStorage.setItem(EMAIL_LOG_KEY, JSON.stringify(log));
}


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
  const [sendToTechnicians, setSendToTechnicians] = useState(true);
  const [sendToManager, setSendToManager] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [emailLog, setEmailLog] = useState<EmailLog>(loadEmailLog());
  const dateFrom = dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : "";
  const dateTo = dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : "";

  useEffect(() => { saveEmailLog(emailLog); }, [emailLog]);

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

  // Selected due-soon rows for the chosen employees
  const selectedRecords = useMemo(
    () => dueSoon.filter(d => d.assignee && selectedEmployees.includes(d.assignee)),
    [dueSoon, selectedEmployees]
  );

  const ccUser = user?.email || "you@company.com";
  const companyName = localStorage.getItem("companyName") || "Company";
  const companyAdmin = `admin@${(localStorage.getItem("selectedCompany") || "company").toLowerCase()}.com`;

  const recipientList = useMemo(() => {
    const list: string[] = [];
    if (sendToTechnicians) selectedEmployees.forEach(n => list.push(n));
    if (sendToManager) list.push(`${companyAdmin} (Manager/${companyName} Admin)`);
    return list;
  }, [sendToTechnicians, sendToManager, selectedEmployees, companyAdmin, companyName]);

  const openEmailPreview = () => {
    if (selectedEmployees.length === 0) {
      toast({ title: "No recipients", description: "Select at least one employee.", variant: "destructive" });
      return;
    }
    if (!sendToTechnicians && !sendToManager) {
      toast({ title: "No recipient group", description: "Pick Technicians and/or Manager.", variant: "destructive" });
      return;
    }
    setPreviewOpen(true);
  };

  const confirmSend = () => {
    // Mock send — fail randomly ~5%
    const success = Math.random() > 0.05;
    if (!success) {
      toast({ title: "Email failed", description: "Mock send failure. Please retry.", variant: "destructive" });
      setPreviewOpen(false);
      return;
    }
    const now = new Date().toISOString();
    const updates: EmailLog = { ...emailLog };
    selectedRecords.forEach(r => { updates[r.id] = now; });
    setEmailLog(updates);
    toast({
      title: "📧 Email sent",
      description: `Sent to ${recipientList.length} recipient(s). CC: ${ccUser}`,
    });
    setSelectedEmployees([]);
    setNotifyMessage("");
    setPreviewOpen(false);
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
              {/* Single date-range calendar */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("rounded-xl gap-2 min-w-[240px] justify-start font-normal", !dateRange && "text-muted-foreground")}>
                    <CalendarRange className="w-4 h-4" />
                    {dateRange?.from ? (
                      dateRange.to
                        ? `${format(dateRange.from, "MMM d")} – ${format(dateRange.to, "MMM d, yyyy")}`
                        : format(dateRange.from, "MMM d, yyyy")
                    ) : "Filter by date range"}
                    {dateRange && (
                      <X
                        className="w-3.5 h-3.5 ml-auto opacity-60 hover:opacity-100"
                        onClick={(e) => { e.stopPropagation(); setDateRange(undefined); setSelectedEmployees([]); }}
                      />
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-popover" align="end">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={(r) => { setDateRange(r); setSelectedEmployees([]); }}
                    numberOfMonths={2}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>

              <Popover open={employeePickerOpen} onOpenChange={setEmployeePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={!rangeActive || filteredEmployees.length === 0}
                    className="rounded-xl gap-2 min-w-[200px] justify-between disabled:opacity-50"
                  >
                    <span className="flex items-center gap-2 truncate">
                      <Users className="w-4 h-4" />
                      {!rangeActive
                        ? "Select date range first"
                        : filteredEmployees.length === 0
                          ? "No employees in range"
                          : selectedEmployees.length === 0
                            ? `Select from ${filteredEmployees.length} employee(s)`
                            : `${selectedEmployees.length} selected`}
                    </span>
                    <ChevronDown className="w-4 h-4 opacity-60" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-0 bg-popover" align="end">
                  <div className="p-2 border-b border-border/30 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase text-muted-foreground">Due in range</span>
                    {selectedEmployees.length > 0 && (
                      <button onClick={() => setSelectedEmployees([])} className="text-xs text-primary hover:underline">Clear</button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto py-1">
                    {filteredEmployees.length === 0 ? (
                      <div className="px-3 py-4 text-center text-xs text-muted-foreground">No employees with maintenance in this range.</div>
                    ) : filteredEmployees.map((name) => {
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
                onClick={openEmailPreview}
                disabled={selectedEmployees.length === 0 || (!sendToTechnicians && !sendToManager)}
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
                  const lastSent = emailLog[d.id];
                  // Email status: Overdue if maintenance overdue & no email, Sent if log exists, Not Sent otherwise
                  const status = lastSent ? "sent" : overdue ? "overdue" : "not-sent";
                  return (
                    <label
                      key={d.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                        checked ? "bg-primary/10 border-primary/40" : "bg-muted/10 border-border/20 hover:border-border/40"
                      }`}
                    >
                      <Checkbox checked={checked} onCheckedChange={() => toggleEmployee(d.assignee!)} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Users className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-sm font-semibold text-foreground truncate">{d.assignee}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            d.type === "preventive" ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive"
                          }`}>{d.type}</span>
                          {/* Email status badge */}
                          {status === "sent" && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400">
                              <MailCheck className="w-3 h-3" /> Sent
                            </span>
                          )}
                          {status === "overdue" && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-destructive/15 text-destructive">
                              <MailWarning className="w-3 h-3" /> Overdue
                            </span>
                          )}
                          {status === "not-sent" && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-muted/40 text-muted-foreground">
                              <MailX className="w-3 h-3" /> Not Sent
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground flex-wrap">
                          <span className="truncate">{d.assetName}</span>
                          <span>·</span>
                          <CalendarDays className="w-3 h-3" />
                          <span className={overdue ? "text-destructive font-semibold" : ""}>
                            {overdue ? `${Math.abs(d.daysUntil)}d overdue` : `in ${d.daysUntil}d`}
                          </span>
                          {lastSent && (
                            <>
                              <span>·</span>
                              <span className="text-emerald-400/80">Sent {new Date(lastSent).toLocaleString()}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="space-y-3 pt-2 border-t border-border/10">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Send to:</span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox checked={sendToTechnicians} onCheckedChange={(v) => setSendToTechnicians(!!v)} />
                    <span className="text-sm text-foreground">Assigned Technicians</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox checked={sendToManager} onCheckedChange={(v) => setSendToManager(!!v)} />
                    <span className="text-sm text-foreground">Manager / Admin</span>
                  </label>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Optional message</Label>
                  <Textarea
                    value={notifyMessage}
                    onChange={(e) => setNotifyMessage(e.target.value)}
                    placeholder="Add a note for the recipients..."
                    className="border-border/30 rounded-xl min-h-[60px]"
                  />
                </div>
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
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("h-9 rounded-xl gap-2 text-xs justify-start font-normal", !dateRange && "text-muted-foreground")}>
                    <CalendarRange className="w-3.5 h-3.5" />
                    {dateRange?.from ? (
                      dateRange.to
                        ? `${format(dateRange.from, "MMM d")} – ${format(dateRange.to, "MMM d, yyyy")}`
                        : format(dateRange.from, "MMM d, yyyy")
                    ) : "Date range"}
                    {dateRange && (
                      <X className="w-3 h-3 ml-1 opacity-60 hover:opacity-100" onClick={(e) => { e.stopPropagation(); setDateRange(undefined); }} />
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-popover" align="end">
                  <Calendar mode="range" selected={dateRange} onSelect={setDateRange} numberOfMonths={2} initialFocus className={cn("p-3 pointer-events-auto")} />
                </PopoverContent>
              </Popover>
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
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("h-9 rounded-xl gap-2 text-xs justify-start font-normal", !dateRange && "text-muted-foreground")}>
                    <CalendarRange className="w-3.5 h-3.5" />
                    {dateRange?.from ? (
                      dateRange.to
                        ? `${format(dateRange.from, "MMM d")} – ${format(dateRange.to, "MMM d, yyyy")}`
                        : format(dateRange.from, "MMM d, yyyy")
                    ) : "Date range"}
                    {dateRange && (
                      <X className="w-3 h-3 ml-1 opacity-60 hover:opacity-100" onClick={(e) => { e.stopPropagation(); setDateRange(undefined); }} />
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-popover" align="end">
                  <Calendar mode="range" selected={dateRange} onSelect={setDateRange} numberOfMonths={2} initialFocus className={cn("p-3 pointer-events-auto")} />
                </PopoverContent>
              </Popover>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 rounded-xl bg-muted/20 border border-border/20 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-dashed border-border bg-muted/40">
                  {["ID", "Asset", "Type", "Description", "Technician", "Date", "Recurrence", "Cost", "Status", "Actions"].map((h) => (
                    <th key={h} className={`px-4 py-3 text-xs font-bold uppercase tracking-wider text-foreground ${h === "Cost" ? "text-right" : "text-left"} border-r border-dashed border-border/60 last:border-r-0`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <tr key={m.id} className="border-b border-dashed border-border/70 transition-colors hover:bg-muted/50">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground border-r border-dashed border-border/40 last:border-r-0">{m.id}</td>
                    <td className="px-4 py-3 font-medium border-r border-dashed border-border/40 last:border-r-0">{m.assetName}</td>
                    <td className="px-4 py-3 border-r border-dashed border-border/40 last:border-r-0">
                      <span className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold ${m.type === "preventive" ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive"}`}>
                        {m.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate border-r border-dashed border-border/40 last:border-r-0">{m.description}</td>
                    <td className="px-4 py-3 text-muted-foreground border-r border-dashed border-border/40 last:border-r-0">{m.technician}</td>
                    <td className="px-4 py-3 tabular-data text-muted-foreground border-r border-dashed border-border/40 last:border-r-0">{m.date}</td>
                    <td className="px-4 py-3 border-r border-dashed border-border/40 last:border-r-0">
                      {m.recurrence && m.recurrence !== "none" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-secondary/20 text-secondary-foreground border border-border/30">
                          <Repeat className="w-3 h-3" /> {m.recurrence}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right tabular-data font-medium text-primary border-r border-dashed border-border/40 last:border-r-0">PKR {m.cost.toLocaleString()}</td>
                    <td className="px-4 py-3 border-r border-dashed border-border/40 last:border-r-0"><StatusBadge status={m.status} /></td>
                    <td className="px-4 py-3 border-r border-dashed border-border/40 last:border-r-0">
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

      {/* Email Preview Modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl bg-background border-border/40 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Mail className="w-5 h-5 text-primary" /> Email Preview</DialogTitle>
            <DialogDescription>Review recipients and content before sending.</DialogDescription>
          </DialogHeader>

          {/* Recipients */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recipients ({recipientList.length})</p>
            <div className="rounded-xl border border-border/30 bg-muted/10 p-3 space-y-1 max-h-32 overflow-y-auto">
              {recipientList.map((r) => (
                <div key={r} className="text-sm text-foreground flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-muted-foreground" /> {r}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" /> CC: {ccUser}
            </p>
          </div>

          {/* Technician email preview */}
          {sendToTechnicians && selectedRecords.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Technician Email (sample for {selectedRecords[0].assignee})</p>
              <div className="rounded-xl border border-border/30 bg-muted/10 p-4 space-y-2 text-sm">
                <p className="font-bold text-foreground">
                  Subject: Maintenance Due — {selectedRecords[0].assetName} | {selectedRecords[0].daysUntil < 0 ? `${Math.abs(selectedRecords[0].daysUntil)} Days Overdue` : `${selectedRecords[0].daysUntil} Days Left`}
                </p>
                <div className="text-muted-foreground space-y-1 text-xs">
                  <p><span className="text-foreground font-semibold">Asset:</span> {selectedRecords[0].assetName}</p>
                  <p><span className="text-foreground font-semibold">Task:</span> {records.find(r => r.id === selectedRecords[0].id)?.description || "—"}</p>
                  <p><span className="text-foreground font-semibold">Due Date:</span> {selectedRecords[0].date}</p>
                  <p><span className="text-foreground font-semibold">Priority:</span> {selectedRecords[0].type === "corrective" ? "High" : "Medium"}</p>
                  <p><span className="text-foreground font-semibold">Location:</span> {assets.find(a => a.id === selectedRecords[0].id?.replace(/^MNT-/, ""))?.department || assets.find(a => a.id === records.find(r => r.id === selectedRecords[0].id)?.assetId)?.department || "—"}</p>
                </div>
                {notifyMessage && (
                  <div className="pt-2 border-t border-border/20 text-xs text-foreground italic">"{notifyMessage}"</div>
                )}
              </div>
            </div>
          )}

          {/* Manager email preview */}
          {sendToManager && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Manager Email</p>
              <div className="rounded-xl border border-border/30 bg-muted/10 p-4 space-y-2 text-sm">
                {(() => {
                  const overdueTasks = selectedRecords.filter(r => r.daysUntil < 0);
                  const upcomingTasks = selectedRecords.filter(r => r.daysUntil >= 0);
                  const completedTasks = records.filter(r => r.status === "completed");
                  const fromLabel = dateFrom || "—";
                  const toLabel = dateTo || "—";
                  return (
                    <>
                      <p className="font-bold text-foreground">Subject: Maintenance Summary — {fromLabel} to {toLabel}</p>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-2 text-center">
                          <p className="text-lg font-bold text-destructive">{overdueTasks.length}</p>
                          <p className="text-muted-foreground">Overdue</p>
                        </div>
                        <div className="rounded-lg bg-primary/10 border border-primary/30 p-2 text-center">
                          <p className="text-lg font-bold text-primary">{upcomingTasks.length}</p>
                          <p className="text-muted-foreground">Upcoming</p>
                        </div>
                        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-2 text-center">
                          <p className="text-lg font-bold text-emerald-400">{completedTasks.length}</p>
                          <p className="text-muted-foreground">Completed</p>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <p className="text-foreground font-semibold mt-2">Overdue:</p>
                        {overdueTasks.length === 0 ? <p>— None</p> : overdueTasks.map(t => <p key={t.id}>• {t.assetName} ({t.assignee}) — {Math.abs(t.daysUntil)}d overdue</p>)}
                        <p className="text-foreground font-semibold mt-2">Upcoming:</p>
                        {upcomingTasks.length === 0 ? <p>— None</p> : upcomingTasks.map(t => <p key={t.id}>• {t.assetName} ({t.assignee}) — in {t.daysUntil}d</p>)}
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setPreviewOpen(false)}>Cancel</Button>
            <Button className="bg-gradient-to-r from-primary to-primary/80 font-bold rounded-xl" onClick={confirmSend}>
              <Send className="w-4 h-4 mr-2" /> Confirm & Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
