import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { appUsers as seedUsers, type AppUser, type UserRole } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Plus, Edit2, Trash2, ShieldCheck, Lock, Users as UsersIcon } from "lucide-react";
import { toast } from "sonner";

const STORAGE_KEY = "tv_users";
const ALL_PERMISSIONS = [
  "assets.view", "assets.edit",
  "maintenance.view", "maintenance.edit",
  "billing.view", "billing.edit",
  "reports.view", "users.manage",
] as const;
type Permission = typeof ALL_PERMISSIONS[number];

interface ManagedUser extends AppUser {
  id: string;
  permissions: Permission[];
  active: boolean;
}

const defaultPerms = (role: UserRole): Permission[] => {
  switch (role) {
    case "super_admin": return [...ALL_PERMISSIONS];
    case "admin": return ["assets.view", "assets.edit", "maintenance.view", "maintenance.edit", "billing.view", "reports.view"];
    case "viewer": return ["assets.view", "maintenance.view", "billing.view", "reports.view"];
    case "employee": return ["assets.view", "maintenance.view"];
  }
};

const roleColor: Record<UserRole, string> = {
  super_admin: "bg-red-100 text-red-700 border-red-200",
  admin: "bg-blue-100 text-blue-700 border-blue-200",
  viewer: "bg-amber-100 text-amber-700 border-amber-200",
  employee: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

export default function UserManagement() {
  const { user, isSuperAdmin, isAdmin } = useAuth();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [editing, setEditing] = useState<ManagedUser | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setUsers(JSON.parse(saved));
    } else {
      const seeded: ManagedUser[] = seedUsers.map((u, i) => ({
        ...u,
        id: `USR-${String(i + 1).padStart(3, "0")}`,
        permissions: defaultPerms(u.role),
        active: true,
      }));
      setUsers(seeded);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    }
  }, []);

  const persist = (next: ManagedUser[]) => {
    setUsers(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  if (!isAdmin && !isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <Lock className="w-12 h-12 text-muted-foreground mb-3" />
        <h2 className="text-xl font-bold text-foreground">Access Denied</h2>
        <p className="text-sm text-muted-foreground mt-1">You don't have permission to view this module.</p>
      </div>
    );
  }

  // Admin can manage admin/viewer/employee — not super_admin. SuperAdmin manages everyone.
  const visible = users.filter((u) => {
    if (!isSuperAdmin && u.role === "super_admin") return false;
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const canEdit = (u: ManagedUser) => {
    if (isSuperAdmin) return true;
    if (u.email === user?.email) return false;
    return u.role !== "super_admin";
  };

  const handleDelete = (u: ManagedUser) => {
    if (!canEdit(u)) { toast.error("You can't remove this user"); return; }
    if (!confirm(`Delete user "${u.name}"?`)) return;
    persist(users.filter((x) => x.id !== u.id));
    toast.success("User removed");
  };

  const toggleActive = (u: ManagedUser) => {
    if (!canEdit(u)) return;
    persist(users.map((x) => x.id === u.id ? { ...x, active: !x.active } : x));
    toast.success(`User ${u.active ? "deactivated" : "activated"}`);
  };

  const stats = [
    { label: "Total Users", value: users.length, icon: UsersIcon, color: "from-blue-500 to-blue-600" },
    { label: "Admins", value: users.filter(u => u.role === "admin" || u.role === "super_admin").length, icon: ShieldCheck, color: "from-purple-500 to-purple-600" },
    { label: "Active", value: users.filter(u => u.active).length, icon: ShieldCheck, color: "from-emerald-500 to-emerald-600" },
    { label: "Inactive", value: users.filter(u => !u.active).length, icon: Lock, color: "from-amber-500 to-amber-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">User Management</h2>
          <p className="text-sm text-muted-foreground">
            {isSuperAdmin ? "Full control of all users, roles and permissions." : "Manage users in your company. Limited permissions available."}
          </p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="w-4 h-4 mr-1" /> Add User
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="vision-card p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center`}>
              <s.icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-lg font-bold text-foreground">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="vision-card p-5">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search name or email..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {isSuperAdmin && <SelectItem value="super_admin">Super Admin</SelectItem>}
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="viewer">Viewer</SelectItem>
              <SelectItem value="employee">Employee</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/30 text-xs uppercase tracking-wider text-muted-foreground">
                <th className="text-left py-3 px-3 font-semibold">User</th>
                <th className="text-left py-3 px-3 font-semibold">Role</th>
                <th className="text-left py-3 px-3 font-semibold">Department</th>
                <th className="text-left py-3 px-3 font-semibold">Permissions</th>
                <th className="text-left py-3 px-3 font-semibold">Status</th>
                <th className="text-right py-3 px-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((u) => (
                <tr key={u.id} className="border-b border-border/10 hover:bg-muted/10">
                  <td className="py-3 px-3">
                    <div className="font-medium text-foreground">{u.name}</div>
                    <div className="text-xs text-muted-foreground">{u.email}</div>
                  </td>
                  <td className="py-3 px-3">
                    <Badge variant="outline" className={roleColor[u.role]}>{u.role.replace("_", " ")}</Badge>
                  </td>
                  <td className="py-3 px-3 text-muted-foreground">{u.department}</td>
                  <td className="py-3 px-3 text-xs text-muted-foreground">{u.permissions.length} granted</td>
                  <td className="py-3 px-3">
                    <button
                      onClick={() => toggleActive(u)}
                      disabled={!canEdit(u)}
                      className={`text-xs px-2 py-1 rounded-full font-medium ${u.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"} disabled:opacity-50`}
                    >
                      {u.active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="inline-flex gap-1">
                      <Button size="icon" variant="ghost" disabled={!canEdit(u)} onClick={() => setEditing(u)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" disabled={!canEdit(u)} onClick={() => handleDelete(u)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr><td colSpan={6} className="py-10 text-center text-muted-foreground text-sm">No users found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / create dialog */}
      <UserDialog
        open={!!editing || creating}
        user={editing}
        isSuperAdmin={isSuperAdmin}
        onClose={() => { setEditing(null); setCreating(false); }}
        onSave={(data) => {
          if (editing) {
            persist(users.map((x) => x.id === editing.id ? { ...x, ...data } : x));
            toast.success("User updated");
          } else {
            const newUser: ManagedUser = {
              id: `USR-${Date.now()}`,
              email: data.email!, password: "temp123", name: data.name!,
              role: data.role!, phone: "", department: data.department || "General",
              assignedCompanies: [], permissions: data.permissions!, active: true,
            };
            persist([...users, newUser]);
            toast.success("User created");
          }
          setEditing(null); setCreating(false);
        }}
      />
    </div>
  );
}

function UserDialog({ open, user, isSuperAdmin, onClose, onSave }: {
  open: boolean; user: ManagedUser | null; isSuperAdmin: boolean;
  onClose: () => void; onSave: (data: Partial<ManagedUser>) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("employee");
  const [department, setDepartment] = useState("");
  const [permissions, setPermissions] = useState<Permission[]>([]);

  useEffect(() => {
    if (user) {
      setName(user.name); setEmail(user.email); setRole(user.role);
      setDepartment(user.department); setPermissions(user.permissions);
    } else {
      setName(""); setEmail(""); setRole("employee");
      setDepartment(""); setPermissions(defaultPerms("employee"));
    }
  }, [user, open]);

  const togglePerm = (p: Permission) => {
    setPermissions((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{user ? "Edit User" : "Add New User"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Full Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={!!user} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Role</Label>
              <Select value={role} onValueChange={(v: UserRole) => { setRole(v); setPermissions(defaultPerms(v)); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {isSuperAdmin && <SelectItem value="super_admin">Super Admin</SelectItem>}
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Department</Label>
              <Input value={department} onChange={(e) => setDepartment(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Permissions</Label>
            <div className="grid grid-cols-2 gap-2 p-3 rounded-lg border border-border/30">
              {ALL_PERMISSIONS.map((p) => {
                const disabled = !isSuperAdmin && p === "users.manage";
                return (
                  <label key={p} className={`flex items-center gap-2 text-sm ${disabled ? "opacity-40" : "cursor-pointer"}`}>
                    <Checkbox
                      checked={permissions.includes(p)}
                      onCheckedChange={() => !disabled && togglePerm(p)}
                      disabled={disabled}
                    />
                    <span>{p}</span>
                  </label>
                );
              })}
            </div>
            {!isSuperAdmin && (
              <p className="text-xs text-muted-foreground">Only Super Admin can grant <code>users.manage</code>.</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => {
            if (!name || !email) { toast.error("Name and email required"); return; }
            onSave({ name, email, role, department, permissions });
          }}>{user ? "Save Changes" : "Create User"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
