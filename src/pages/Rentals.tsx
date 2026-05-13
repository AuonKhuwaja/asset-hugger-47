import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { assets, employees } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { TablePagination, usePagination } from "@/components/TablePagination";
import {
  CalendarRange, Plus, Pencil, Trash2, RotateCcw, Search,
  Clock, AlertTriangle, CheckCircle2, DollarSign, Package,
} from "lucide-react";
import { toast } from "sonner";

type RentalStatus = "active" | "overdue" | "returned" | "reserved";

interface Rental {
  id: string;
  assetId: string;
  assetName: string;
  renter: string;
  renterType: "employee" | "external";
  contact: string;
  startDate: string;
  dueDate: string;
  returnDate?: string;
  dailyRate: number;
  deposit: number;
  status: RentalStatus;
  notes?: string;
}

const STORAGE_KEY = "tv_rentals";

const seed = (): Rental[] => [
  {
    id: "RNT-001", assetId: "AST-008", assetName: "Epson EB-L200SW", renter: "Maria Santos",
    renterType: "employee", contact: "+92 333 1112233",
    startDate: "2026-05-01", dueDate: "2026-05-10", dailyRate: 25, deposit: 200, status: "active",
    notes: "Conference room rental",
  },
  {
    id: "RNT-002", assetId: "AST-002", assetName: "Dell UltraSharp 27\"", renter: "Alex Kim",
    renterType: "employee", contact: "+92 321 4445566",
    startDate: "2026-04-15", dueDate: "2026-05-05", dailyRate: 8, deposit: 100, status: "overdue",
  },
  {
    id: "RNT-003", assetId: "AST-007", assetName: "iPad Pro 12.9\"", renter: "Creative Studio Co.",
    renterType: "external", contact: "studio@creative.io",
    startDate: "2026-03-20", dueDate: "2026-03-30", returnDate: "2026-03-29",
    dailyRate: 30, deposit: 300, status: "returned",
  },
  {
    id: "RNT-004", assetId: "AST-005", assetName: "iPhone 15 Pro", renter: "Tom Wilson",
    renterType: "employee", contact: "+92 300 8889900",
    startDate: "2026-06-01", dueDate: "2026-06-15", dailyRate: 15, deposit: 250, status: "reserved",
  },
];

const statusStyles: Record<RentalStatus, { tone: string; icon: any; label: string }> = {
  active: { tone: "bg-primary/15 text-primary border-primary/30", icon: Clock, label: "Active" },
  overdue: { tone: "bg-destructive/15 text-destructive border-destructive/30", icon: AlertTriangle, label: "Overdue" },
  returned: { tone: "bg-green-500/15 text-green-500 border-green-500/30", icon: CheckCircle2, label: "Returned" },
  reserved: { tone: "bg-secondary/30 text-secondary-foreground border-secondary/30", icon: CalendarRange, label: "Reserved" },
};

const daysBetween = (a: string, b: string) => {
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
};

export default function Rentals() {
  const { isAuthenticated, isAdmin } = useAuth();
  const [rentals, setRentals] = useState<Rental[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : seed();
  });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editing, setEditing] = useState<Rental | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rentals));
  }, [rentals]);

  const filtered = useMemo(
    () =>
      rentals.filter((r) => {
        if (statusFilter !== "all" && r.status !== statusFilter) return false;
        if (
          search &&
          ![r.id, r.assetName, r.renter, r.contact].some((v) =>
            v?.toLowerCase().includes(search.toLowerCase())
          )
        )
          return false;
        return true;
      }),
    [rentals, search, statusFilter]
  );

  const pag = usePagination(filtered, 10);

  if (!isAuthenticated) return <Navigate to="/" replace />;

  const stats = useMemo(() => {
    const active = rentals.filter((r) => r.status === "active").length;
    const overdue = rentals.filter((r) => r.status === "overdue").length;
    const revenue = rentals.reduce((sum, r) => {
      const end = r.returnDate || (r.status === "returned" ? r.dueDate : new Date().toISOString().slice(0, 10));
      return sum + r.dailyRate * daysBetween(r.startDate, end);
    }, 0);
    return { total: rentals.length, active, overdue, revenue };
  }, [rentals]);

  const openCreate = () => {
    const a = assets[0];
    setEditing({
      id: `RNT-${String(Date.now()).slice(-4)}`,
      assetId: a?.id ?? "",
      assetName: a?.name ?? "",
      renter: "",
      renterType: "employee",
      contact: "",
      startDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      dailyRate: 10,
      deposit: 100,
      status: "active",
    });
    setOpen(true);
  };

  const openEdit = (r: Rental) => {
    setEditing({ ...r });
    setOpen(true);
  };

  const save = () => {
    if (!editing) return;
    if (!editing.renter || !editing.assetId) {
      toast.error("Renter and asset are required");
      return;
    }
    setRentals((prev) => {
      const exists = prev.find((p) => p.id === editing.id);
      return exists ? prev.map((p) => (p.id === editing.id ? editing : p)) : [editing, ...prev];
    });
    toast.success("Rental saved");
    setOpen(false);
    setEditing(null);
  };

  const remove = (r: Rental) => {
    setRentals((prev) => prev.filter((p) => p.id !== r.id));
    toast.success("Rental deleted");
  };

  const markReturned = (r: Rental) => {
    setRentals((prev) =>
      prev.map((p) =>
        p.id === r.id
          ? { ...p, status: "returned", returnDate: new Date().toISOString().slice(0, 10) }
          : p
      )
    );
    toast.success(`${r.assetName} marked as returned`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <span className="icon-glow w-9 h-9 flex items-center justify-center">
              <CalendarRange className="w-5 h-5 text-white" />
            </span>
            Rental Equipment
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage rental contracts, due dates, deposits and returns.
          </p>
        </div>
        {isAdmin && (
          <Button onClick={openCreate} className="gap-2">
            <Plus className="w-4 h-4" /> New Rental
          </Button>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi icon={Package} label="Total Rentals" value={stats.total} tint="icon-glow" />
        <Kpi icon={Clock} label="Active" value={stats.active} tint="icon-glow-purple" />
        <Kpi icon={AlertTriangle} label="Overdue" value={stats.overdue} tint="icon-glow-orange" />
        <Kpi icon={DollarSign} label="Revenue" value={`$${stats.revenue.toLocaleString()}`} tint="icon-glow-green" />
      </div>

      {/* Filters */}
      <div className="vision-card p-4 flex flex-wrap items-center gap-3 justify-between">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search renter, asset, ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="reserved">Reserved</SelectItem>
            <SelectItem value="returned">Returned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="vision-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-primary text-primary-foreground">
              <tr>
                {["ID", "Asset", "Renter", "Period", "Rate", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider border-r border-dashed border-primary-foreground/60 last:border-r-0">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pag.paged.map((r) => {
                const s = statusStyles[r.status];
                const SIcon = s.icon;
                const days = daysBetween(r.startDate, r.returnDate || r.dueDate);
                return (
                  <tr key={r.id} className="border-t border-dashed border-border hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs border-r border-dashed border-border">{r.id}</td>
                    <td className="px-4 py-3 border-r border-dashed border-border">
                      <p className="font-semibold text-foreground">{r.assetName}</p>
                      <p className="text-[11px] text-muted-foreground font-mono">{r.assetId}</p>
                    </td>
                    <td className="px-4 py-3 border-r border-dashed border-border">
                      <p className="font-medium text-foreground">{r.renter}</p>
                      <p className="text-[11px] text-muted-foreground">{r.contact}</p>
                      <Badge variant="outline" className="mt-1 text-[10px] capitalize">{r.renterType}</Badge>
                    </td>
                    <td className="px-4 py-3 border-r border-dashed border-border">
                      <p className="text-foreground">{r.startDate} → {r.dueDate}</p>
                      <p className="text-[11px] text-muted-foreground">{days} days</p>
                    </td>
                    <td className="px-4 py-3 tabular-data border-r border-dashed border-border">
                      <p className="text-foreground">${r.dailyRate}/day</p>
                      <p className="text-[11px] text-muted-foreground">Dep: ${r.deposit}</p>
                    </td>
                    <td className="px-4 py-3 border-r border-dashed border-border">
                      <Badge className={`gap-1 ${s.tone}`}>
                        <SIcon className="w-3 h-3" /> {s.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 justify-end">
                        {r.status !== "returned" && isAdmin && (
                          <Button size="icon" variant="ghost" title="Mark returned" onClick={() => markReturned(r)}>
                            <RotateCcw className="w-4 h-4" />
                          </Button>
                        )}
                        {isAdmin && (
                          <>
                            <Button size="icon" variant="ghost" onClick={() => openEdit(r)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="text-destructive" onClick={() => remove(r)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {pag.paged.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-muted-foreground py-12">No rentals found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <TablePagination
          page={pag.page} pageSize={pag.pageSize} total={filtered.length}
          onPageChange={pag.setPage} onPageSizeChange={pag.setPageSize}
        />
      </div>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing && rentals.find((r) => r.id === editing.id) ? "Edit Rental" : "New Rental"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2">
                <Label>Asset</Label>
                <Select
                  value={editing.assetId}
                  onValueChange={(v) => {
                    const a = assets.find((x) => x.id === v);
                    setEditing({ ...editing, assetId: v, assetName: a?.name ?? "" });
                  }}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {assets.map((a) => (
                      <SelectItem key={a.id} value={a.id}>{a.id} — {a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Renter Type</Label>
                <Select value={editing.renterType} onValueChange={(v: any) => setEditing({ ...editing, renterType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="external">External</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Renter Name</Label>
                {editing.renterType === "employee" ? (
                  <Select value={editing.renter} onValueChange={(v) => setEditing({ ...editing, renter: v })}>
                    <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                    <SelectContent>
                      {employees.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input value={editing.renter} onChange={(e) => setEditing({ ...editing, renter: e.target.value })} />
                )}
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label>Contact</Label>
                <Input value={editing.contact} onChange={(e) => setEditing({ ...editing, contact: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Start Date</Label>
                <Input type="date" value={editing.startDate} onChange={(e) => setEditing({ ...editing, startDate: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Due Date</Label>
                <Input type="date" value={editing.dueDate} onChange={(e) => setEditing({ ...editing, dueDate: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Daily Rate ($)</Label>
                <Input type="number" value={editing.dailyRate} onChange={(e) => setEditing({ ...editing, dailyRate: Number(e.target.value) })} />
              </div>
              <div className="space-y-1.5">
                <Label>Deposit ($)</Label>
                <Input type="number" value={editing.deposit} onChange={(e) => setEditing({ ...editing, deposit: Number(e.target.value) })} />
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label>Status</Label>
                <Select value={editing.status} onValueChange={(v: any) => setEditing({ ...editing, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reserved">Reserved</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="returned">Returned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label>Notes</Label>
                <Textarea value={editing.notes ?? ""} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} rows={2} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Kpi({ icon: Icon, label, value, tint }: { icon: any; label: string; value: string | number; tint: string }) {
  return (
    <div className="vision-card vision-card-hover p-4 flex items-center gap-3">
      <div className={`${tint} w-11 h-11 flex items-center justify-center shrink-0`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-xl font-bold text-foreground tabular-data">{value}</p>
      </div>
    </div>
  );
}
