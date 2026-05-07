import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { appUsers, type AppUser, type UserRole } from "@/lib/mock-data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Pencil, Trash2, UserPlus, Shield } from "lucide-react";
import { toast } from "sonner";

interface ManagedUser extends AppUser {
  id: string;
  active: boolean;
}

const STORAGE_KEY = "tv_managed_users";

const seedUsers = (): ManagedUser[] =>
  appUsers.map((u, i) => ({ ...u, id: `USR-${String(i + 1).padStart(3, "0")}`, active: true }));

const roleColors: Record<UserRole, string> = {
  super_admin: "bg-destructive/15 text-destructive",
  admin: "bg-primary/15 text-primary",
  viewer: "bg-secondary text-secondary-foreground",
  employee: "bg-accent text-accent-foreground",
};

export default function UserManagement() {
  const { isAuthenticated, isAdmin, isSuperAdmin, user: currentUser } = useAuth();
  const [users, setUsers] = useState<ManagedUser[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : seedUsers();
  });
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<ManagedUser | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  }, [users]);

  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  // Admin only sees non-superadmin users
  const visibleUsers = users.filter((u) => {
    if (!isSuperAdmin && u.role === "super_admin") return false;
    if (search && !`${u.name} ${u.email} ${u.role}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const availableRoles: UserRole[] = isSuperAdmin
    ? ["super_admin", "admin", "viewer", "employee"]
    : ["admin", "viewer", "employee"];

  const openCreate = () => {
    setEditing({
      id: `USR-${Date.now()}`,
      email: "",
      password: "",
      name: "",
      role: "employee",
      phone: "",
      department: "",
      assignedCompanies: [],
      active: true,
    });
    setOpen(true);
  };

  const openEdit = (u: ManagedUser) => {
    setEditing({ ...u });
    setOpen(true);
  };

  const save = () => {
    if (!editing) return;
    if (!editing.name || !editing.email) {
      toast.error("Name and email are required");
      return;
    }
    if (!isSuperAdmin && editing.role === "super_admin") {
      toast.error("Admins cannot assign Super Admin role");
      return;
    }
    setUsers((prev) => {
      const exists = prev.find((p) => p.id === editing.id);
      return exists
        ? prev.map((p) => (p.id === editing.id ? editing : p))
        : [...prev, editing];
    });
    toast.success(editing && users.find((u) => u.id === editing.id) ? "User updated" : "User created");
    setOpen(false);
    setEditing(null);
  };

  const removeUser = (u: ManagedUser) => {
    if (!isSuperAdmin && u.role === "super_admin") {
      toast.error("Admins cannot delete Super Admin");
      return;
    }
    if (u.email === currentUser?.email) {
      toast.error("You cannot delete yourself");
      return;
    }
    setUsers((prev) => prev.filter((p) => p.id !== u.id));
    toast.success("User deleted");
  };

  const toggleActive = (u: ManagedUser) => {
    setUsers((prev) => prev.map((p) => (p.id === u.id ? { ...p, active: !p.active } : p)));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" /> User Management
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {isSuperAdmin
              ? "Full control: create, edit, delete and assign any role."
              : "Manage your team — limited permissions (cannot assign Super Admin)."}
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <UserPlus className="w-4 h-4" /> Create User
        </Button>
      </div>

      <div className="vision-card p-4">
        <div className="flex items-center justify-between mb-4 gap-4">
          <Input
            placeholder="Search by name, email, role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <Badge variant="outline" className="capitalize">
            {currentUser?.role.replace("_", " ")} view
          </Badge>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleUsers.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  <Badge className={`capitalize ${roleColors[u.role]}`}>
                    {u.role.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell>{u.department || "—"}</TableCell>
                <TableCell>
                  <Switch
                    checked={u.active}
                    onCheckedChange={() => toggleActive(u)}
                    disabled={!isSuperAdmin && u.role === "super_admin"}
                  />
                </TableCell>
                <TableCell className="text-right space-x-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => openEdit(u)}
                    disabled={!isSuperAdmin && u.role === "super_admin"}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeUser(u)}
                    disabled={!isSuperAdmin && u.role === "super_admin"}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {visibleUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing && users.find((u) => u.id === editing.id) ? "Edit User" : "Create User"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Name</Label>
                <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Password</Label>
                <Input type="password" value={editing.password} onChange={(e) => setEditing({ ...editing, password: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input value={editing.phone} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Department</Label>
                <Input value={editing.department} onChange={(e) => setEditing({ ...editing, department: e.target.value })} />
              </div>
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
              <div className="col-span-2 flex items-center gap-3">
                <Switch checked={editing.active} onCheckedChange={(v) => setEditing({ ...editing, active: v })} />
                <Label>Active</Label>
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
