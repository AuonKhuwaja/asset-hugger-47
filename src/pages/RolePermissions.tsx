import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Shield, Save, RotateCcw, Search, Lock, Unlock } from "lucide-react";
import { toast } from "sonner";
import type { UserRole } from "@/lib/mock-data";

const STORAGE_KEY = "tv_role_permissions";

const MODULES = [
  { key: "dashboard", label: "Dashboard", group: "Core" },
  { key: "assets", label: "Assets", group: "Master Data" },
  { key: "categories", label: "Categories", group: "Master Data" },
  { key: "vendors", label: "Vendors", group: "Master Data" },
  { key: "departments", label: "Departments", group: "Master Data" },
  { key: "employees", label: "Employees", group: "Master Data" },
  { key: "assignments", label: "Assignments", group: "Operations" },
  { key: "maintenance", label: "Maintenance", group: "Operations" },
  { key: "rentals", label: "Rentals", group: "Operations" },
  { key: "qr", label: "QR / Barcode", group: "Operations" },
  { key: "billing", label: "Cost & Billing", group: "Finance" },
  { key: "depreciation", label: "Depreciation", group: "Finance" },
  { key: "reports", label: "Reports", group: "Finance" },
  { key: "users", label: "User Management", group: "Admin" },
  { key: "roles", label: "Role Permissions", group: "Admin" },
  { key: "settings", label: "Settings", group: "Admin" },
] as const;

const ACTIONS = ["view", "create", "edit", "delete"] as const;
type Action = (typeof ACTIONS)[number];

const ROLES: { key: UserRole; label: string; tone: string }[] = [
  { key: "super_admin", label: "Super Admin", tone: "bg-destructive/15 text-destructive border-destructive/30" },
  { key: "admin", label: "Admin", tone: "bg-primary/15 text-primary border-primary/30" },
  { key: "viewer", label: "Viewer", tone: "bg-secondary/30 text-secondary-foreground border-secondary/30" },
  { key: "employee", label: "Employee", tone: "bg-accent/20 text-accent-foreground border-accent/30" },
];

type Matrix = Record<UserRole, Record<string, Record<Action, boolean>>>;

const defaultMatrix = (): Matrix => {
  const m = {} as Matrix;
  ROLES.forEach(({ key }) => {
    m[key] = {};
    MODULES.forEach((mod) => {
      const all = key === "super_admin";
      const adminAll = key === "admin" && !["roles"].includes(mod.key);
      const viewerOnly = key === "viewer";
      const empAllowed = key === "employee" && ["dashboard", "assets", "qr"].includes(mod.key);
      m[key][mod.key] = {
        view: all || adminAll || viewerOnly || empAllowed,
        create: all || adminAll,
        edit: all || adminAll,
        delete: all || (adminAll && !["users", "employees"].includes(mod.key)),
      };
    });
  });
  return m;
};

export default function RolePermissions() {
  const { isAuthenticated, isAdmin } = useAuth();
  const [matrix, setMatrix] = useState<Matrix>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : defaultMatrix();
  });
  const [activeRole, setActiveRole] = useState<UserRole>("admin");
  const [search, setSearch] = useState("");
  const [dirty, setDirty] = useState(false);

  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  const filteredModules = useMemo(
    () => MODULES.filter((m) => m.label.toLowerCase().includes(search.toLowerCase())),
    [search]
  );

  const grouped = useMemo(() => {
    const g: Record<string, typeof MODULES[number][]> = {};
    filteredModules.forEach((m) => {
      (g[m.group] ||= []).push(m);
    });
    return g;
  }, [filteredModules]);

  const toggle = (mod: string, action: Action) => {
    setMatrix((prev) => ({
      ...prev,
      [activeRole]: {
        ...prev[activeRole],
        [mod]: { ...prev[activeRole][mod], [action]: !prev[activeRole][mod][action] },
      },
    }));
    setDirty(true);
  };

  const toggleRow = (mod: string, value: boolean) => {
    setMatrix((prev) => ({
      ...prev,
      [activeRole]: {
        ...prev[activeRole],
        [mod]: { view: value, create: value, edit: value, delete: value },
      },
    }));
    setDirty(true);
  };

  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(matrix));
    setDirty(false);
    toast.success("Permissions saved");
  };

  const reset = () => {
    setMatrix(defaultMatrix());
    setDirty(true);
    toast.info("Reset to defaults — remember to save");
  };

  const counts = useMemo(() => {
    const role = matrix[activeRole] || {};
    let granted = 0,
      total = 0;
    MODULES.forEach((m) => {
      ACTIONS.forEach((a) => {
        total++;
        if (role[m.key]?.[a]) granted++;
      });
    });
    return { granted, total };
  }, [matrix, activeRole]);

  const isLocked = activeRole === "super_admin";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <span className="icon-glow w-9 h-9 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </span>
            Role Permissions
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure module-level access for each role across the application.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={reset} className="gap-2">
            <RotateCcw className="w-4 h-4" /> Reset Defaults
          </Button>
          <Button onClick={save} disabled={!dirty} className="gap-2">
            <Save className="w-4 h-4" /> Save Changes
          </Button>
        </div>
      </div>

      {/* Role tabs */}
      <div className="vision-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {ROLES.map((r) => {
              const active = activeRole === r.key;
              return (
                <button
                  key={r.key}
                  onClick={() => setActiveRole(r.key)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                    active
                      ? "bg-primary text-primary-foreground border-primary shadow-md"
                      : `${r.tone} hover:opacity-80`
                  }`}
                >
                  {r.label}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="gap-1.5">
              {isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
              {counts.granted}/{counts.total} permissions
            </Badge>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search modules..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-56"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Matrix */}
      <div className="vision-card p-0 overflow-hidden">
        <div className="grid grid-cols-[1.3fr_repeat(4,_1fr)_auto] items-center px-5 py-3 border-b border-dashed border-border bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider">
          <span>Module</span>
          {ACTIONS.map((a) => (
            <span key={a} className="text-center">{a}</span>
          ))}
          <span className="pl-4 text-right">All</span>
        </div>

        {Object.entries(grouped).map(([group, mods]) => (
          <div key={group}>
            <div className="px-5 py-2 bg-muted/30 border-b border-dashed border-border">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{group}</p>
            </div>
            {mods.map((mod) => {
              const row = matrix[activeRole]?.[mod.key] || ({} as any);
              const all = ACTIONS.every((a) => row[a]);
              return (
                <div
                  key={mod.key}
                  className="grid grid-cols-[1.3fr_repeat(4,_1fr)_auto] items-center px-5 py-3 border-b border-dashed border-border hover:bg-muted/20 transition-colors"
                >
                  <span className="text-sm font-medium text-foreground">{mod.label}</span>
                  {ACTIONS.map((a) => (
                    <div key={a} className="flex justify-center">
                      <Switch
                        checked={!!row[a]}
                        onCheckedChange={() => !isLocked && toggle(mod.key, a)}
                        disabled={isLocked}
                      />
                    </div>
                  ))}
                  <div className="pl-4 flex justify-end">
                    <Switch
                      checked={all}
                      onCheckedChange={(v) => !isLocked && toggleRow(mod.key, v)}
                      disabled={isLocked}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {isLocked && (
          <div className="px-5 py-3 text-xs text-muted-foreground bg-muted/20 flex items-center gap-2">
            <Lock className="w-3.5 h-3.5" />
            Super Admin has unrestricted access — permissions cannot be edited.
          </div>
        )}
      </div>
    </div>
  );
}
