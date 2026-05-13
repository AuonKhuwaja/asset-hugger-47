import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { appUsers, type AppUser, type UserRole } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { TablePagination, usePagination } from "@/components/TablePagination";
import {
  Pencil, Trash2, UserPlus, Shield, Search, Users,
  UserCheck, UserX, Crown, Download, KeyRound,
} from "lucide-react";
import { toast } from "sonner";

interface ManagedUser extends AppUser {
  id: string;
  active: boolean;
}

const STORAGE_KEY = "tv_managed_users";

const seedUsers = (): ManagedUser[] =>
  appUsers.map((u, i) => ({ ...u, id: `USR-${String(i + 1).padStart(3, "0")}`, active: true }));

const roleStyles: Record<UserRole, { tone: string; icon: any }> = {
  super_admin: { tone: "bg-destructive/15 text-destructive border-destructive/30", icon: Crown },
  admin: { tone: "bg-primary/15 text-primary border-primary/30", icon: Shield },
  viewer: { tone: "bg-secondary/30 text-secondary-foreground border-secondary/30", icon: UserCheck },
  employee: { tone: "bg-accent/20 text-accent-foreground border-accent/30", icon: Users },
};

export default function UserManagement() {
  const { isAuthenticated, isAdmin, isSuperAdmin, user: currentUser } = useAuth();
  const [users, setUsers] = useState<ManagedUser[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : seedUsers();
  });
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editing, setEditing] = useState<ManagedUser | null>(null);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  }, [users]);

  const visibleUsers = useMemo(
    () =>
      users.filter((u) => {
        if (!isSuperAdmin && u.role === "super_admin") return false;
        if (roleFilter !== "all" && u.role !== roleFilter) return false;
        if (statusFilter === "active" && !u.active) return false;
        if (statusFilter === "inactive" && u.active) return false;
        if (search && !`${u.name} ${u.email} ${u.role} ${u.department}`.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      }),
    [users, search, roleFilter, statusFilter, isSuperAdmin]
  );

  const pag = usePagination(visibleUsers, 10);

  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  const stats = useMemo(() => {
    const list = users.filter((u) => isSuperAdmin || u.role !== "super_admin");
    return {
      total: list.length,
      active: list.filter((u) => u.active).length,
      inactive: list.filter((u) => !u.active).length,
      admins: list.filter((u) => u.role === "admin" || u.role === "super_admin").length,
    };
  }, [users, isSuperAdmin]);

  const availableRoles: UserRole[] = isSuperAdmin
    ? ["super_admin", "admin", "viewer", "employee"]
    : ["admin", "viewer", "employee"];

  const openCreate = () => {
    setEditing({
      id: `USR-${Date.now()}`,
      email: "", password: "", name: "", role: "employee",
      phone: "", department: "", assignedCompanies: [], active: true,
    });
    setOpen(true);
  };

  const openEdit = (u: ManagedUser) => { setEditing({ ...u }); setOpen(true); };

  const save = () => {
    if (!editing) return;
    if (!editing.name || !editing.email) return toast.error("Name and email are required");
    if (!isSuperAdmin && editing.role === "super_admin") return toast.error("Admins cannot assign Super Admin");
    setUsers((prev) =>
      prev.find((p) => p.id === editing.id)
        ? prev.map((p) => (p.id === editing.id ? editing : p))
        : [...prev, editing]
    );
    toast.success("User saved");
    setOpen(false); setEditing(null);
  };

  const removeUser = (u: ManagedUser) => {
    if (!isSuperAdmin && u.role === "super_admin") return toast.error("Admins cannot delete Super Admin");
    if (u.email === currentUser?.email) return toast.error("You cannot delete yourself");
    setUsers((prev) => prev.filter((p) => p.id !== u.id));
    toast.success("User deleted");
  };

  const toggleActive = (u: ManagedUser) =>
    setUsers((prev) => prev.map((p) => (p.id === u.id ? { ...p, active: !p.active } : p)));

  const toggleSel = (id: string) => {
    setSelected((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };
  const toggleAllSel = () => {
    const ids = pag.paged.map((u) => u.id);
    const allSel = ids.every((i) => selected.has(i));
    setSelected((s) => {
      const n = new Set(s);
      ids.forEach((i) => (allSel ? n.delete(i) : n.add(i)));
      return n;
    });
  };

  const bulkDelete = () => {
    setUsers((prev) => prev.filter((p) => !selected.has(p.id) || p.email === currentUser?.email));
    toast.success(`${selected.size} user(s) deleted`);
    setSelected(new Set());
  };

  const exportCSV = () => {
    const header = ["ID", "Name", "Email", "Role", "Department", "Phone", "Active"];
    const rows = visibleUsers.map((u) => [u.id, u.name, u.email, u.role, u.department, u.phone, u.active ? "Yes" : "No"]);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url; a.download = "users.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <span className="icon-glow w-9 h-9 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </span>
            User Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isSuperAdmin
              ? "Full control: create, edit, delete and assign any role."
              : "Manage your team — limited permissions (cannot assign Super Admin)."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportCSV} className="gap-2">
            <Download className="w-4 h-4" /> Export
          </Button>
          <Button onClick={openCreate} className="gap-2">
            <UserPlus className="w-4 h-4" /> Create User
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi icon={Users} label="Total Users" value={stats.total} tint="icon-glow" />
        <Kpi icon={UserCheck} label="Active" value={stats.active} tint="icon-glow-green" />
        <Kpi icon={UserX} label="Inactive" value={stats.inactive} tint="icon-glow-orange" />
        <Kpi icon={Crown} label="Admins" value={stats.admins} tint="icon-glow-purple" />
      </div>

      {/* Filters */}
      <div className="vision-card p-4 flex flex-wrap items-center gap-3 justify-between">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search name, email, role..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {availableRoles.map((r) => (
                <SelectItem key={r} value={r} className="capitalize">{r.replace("_", " ")}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          {selected.size > 0 && (
            <Button variant="destructive" size="sm" onClick={bulkDelete} className="gap-2">
              <Trash2 className="w-4 h-4" /> Delete ({selected.size})
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="vision-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-primary text-primary-foreground">
              <tr>
                <th className="px-4 py-3 w-10 border-r border-dashed border-primary-foreground/60">
                  <Checkbox
                    checked={pag.paged.length > 0 && pag.paged.every((u) => selected.has(u.id))}
                    onCheckedChange={toggleAllSel}
                  />
                </th>
                {["User", "Role", "Department", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider border-r border-dashed border-primary-foreground/60 last:border-r-0">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pag.paged.map((u) => {
                const RIcon = roleStyles[u.role].icon;
                return (
                  <tr key={u.id} className="border-t border-dashed border-border hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 border-r border-dashed border-border">
                      <Checkbox checked={selected.has(u.id)} onCheckedChange={() => toggleSel(u.id)} />
                    </td>
                    <td className="px-4 py-3 border-r border-dashed border-border">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full icon-glow flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {u.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground truncate">{u.name}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 border-r border-dashed border-border">
                      <Badge className={`gap-1 capitalize ${roleStyles[u.role].tone}`}>
                        <RIcon className="w-3 h-3" /> {u.role.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 border-r border-dashed border-border text-foreground">{u.department || "—"}</td>
                    <td className="px-4 py-3 border-r border-dashed border-border">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={u.active}
                          onCheckedChange={() => toggleActive(u)}
                          disabled={!isSuperAdmin && u.role === "super_admin"}
                        />
                        <span className={`text-xs ${u.active ? "text-green-500" : "text-muted-foreground"}`}>
                          {u.active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 justify-end">
                        <Button size="icon" variant="ghost" onClick={() => openEdit(u)}
                          disabled={!isSuperAdmin && u.role === "super_admin"}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => removeUser(u)}
                          disabled={!isSuperAdmin && u.role === "super_admin"}
                          className="text-destructive hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {pag.paged.length === 0 && (
                <tr><td colSpan={6} className="text-center text-muted-foreground py-12">No users found</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <TablePagination
          page={pag.page} pageSize={pag.pageSize} total={visibleUsers.length}
          onPageChange={pag.setPage} onPageSizeChange={pag.setPageSize}
        />
      </div>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing && users.find((u) => u.id === editing.id) ? "Edit User" : "Create User"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>Name</Label><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} /></div>
              <div className="space-y-1.5"><Label className="flex items-center gap-1"><KeyRound className="w-3 h-3" /> Password</Label><Input type="password" value={editing.password} onChange={(e) => setEditing({ ...editing, password: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Phone</Label><Input value={editing.phone} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Department</Label><Input value={editing.department} onChange={(e) => setEditing({ ...editing, department: e.target.value })} /></div>
              <div className="space-y-1.5">
                <Label>Role</Label>
                <Select value={editing.role} onValueChange={(v) => setEditing({ ...editing, role: v as UserRole })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {availableRoles.map((r) => (
                      <SelectItem key={r} value={r} className="capitalize">{r.replace("_", " ")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <Switch checked={editing.active} onCheckedChange={(v) => setEditing({ ...editing, active: v })} />
                <Label className="!mt-0">Account Active</Label>
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
