import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Search, Eye, Pencil, Trash2, Building2, Users, CheckCircle, XCircle } from "lucide-react";

export interface SACompany {
  id: string;
  name: string;
  slug: string;
  color: string;
  initials: string;
  plan: "Basic" | "Pro" | "Enterprise";
  status: "Active" | "Inactive";
  createdAt: string;
}

export interface SACompanyUser {
  id: string;
  companySlug: string;
  fullName: string;
  email: string;
  password: string;
  role: "admin";
  createdAt: string;
}

function getCompanies(): SACompany[] {
  try { return JSON.parse(localStorage.getItem("companies") || "[]"); } catch { return []; }
}
function getCompanyUsers(): SACompanyUser[] {
  try { return JSON.parse(localStorage.getItem("companyUsers") || "[]"); } catch { return []; }
}

const planColor: Record<string, string> = {
  Basic: "bg-muted text-muted-foreground",
  Pro: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  Enterprise: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
};

export default function SuperAdminCompanies() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [companies, setCompanies] = useState<SACompany[]>([]);
  const [users, setUsers] = useState<SACompanyUser[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<SACompany | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setCompanies(getCompanies());
      setUsers(getCompanyUsers());
      setLoading(false);
    }, 500);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() =>
    companies.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase())
    ), [companies, search]);

  const stats = useMemo(() => ({
    total: companies.length,
    active: companies.filter(c => c.status === "Active").length,
    inactive: companies.filter(c => c.status === "Inactive").length,
    employees: 0,
  }), [companies]);

  const handleDelete = () => {
    if (!deleteTarget) return;
    const updated = companies.filter(c => c.id !== deleteTarget.id);
    const updatedUsers = users.filter(u => u.companySlug !== deleteTarget.slug);
    localStorage.setItem("companies", JSON.stringify(updated));
    localStorage.setItem("companyUsers", JSON.stringify(updatedUsers));
    setCompanies(updated);
    setUsers(updatedUsers);
    toast({ title: "Company deleted", description: `${deleteTarget.name} has been removed.` });
    setDeleteTarget(null);
  };

  const getAdminEmail = (slug: string) => {
    const u = users.find(u => u.companySlug === slug);
    return u?.email || "—";
  };

  const statCards = [
    { label: "Total Companies", value: stats.total, icon: Building2, gradient: "linear-gradient(135deg, #1a237e 0%, #0d47a1 50%, #1565c0 100%)" },
    { label: "Active", value: stats.active, icon: CheckCircle, gradient: "linear-gradient(135deg, #1b5e20 0%, #2e7d32 50%, #388e3c 100%)" },
    { label: "Inactive", value: stats.inactive, icon: XCircle, gradient: "linear-gradient(135deg, #b71c1c 0%, #c62828 50%, #d32f2f 100%)" },
    { label: "Total Employees", value: stats.employees, icon: Users, gradient: "linear-gradient(135deg, #4a148c 0%, #6a1b9a 50%, #7b1fa2 100%)" },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <Skeleton className="h-10 w-full max-w-sm rounded-lg" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Companies</h1>
        <Button onClick={() => navigate("/super-admin/companies/add")} className="gap-2">
          <Plus className="w-4 h-4" /> Add Company
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map(s => (
          <div key={s.label} className="relative overflow-hidden rounded-[1.25rem] p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl" style={{ background: s.gradient, border: '1.5px solid rgba(255,255,255,0.1)' }}>
            <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-white/[0.06] pointer-events-none" />
            <div className="absolute -bottom-5 -left-5 w-20 h-20 rounded-full bg-white/[0.05] pointer-events-none" />
            <div className="absolute top-6 right-16 w-8 h-8 rounded-full bg-white/[0.04] pointer-events-none" />
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

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or slug..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table or Empty */}
      {filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Building2 className="w-16 h-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-1">No companies yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Add your first company to get started.</p>
            <Button onClick={() => navigate("/super-admin/companies/add")} className="gap-2">
              <Plus className="w-4 h-4" /> Add Company
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead className="w-14">Logo</TableHead>
                <TableHead>Company Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Admin Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c, i) => (
                <TableRow key={c.id}>
                  <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                  <TableCell>
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: c.color }}
                    >{c.initials}</div>
                  </TableCell>
                  <TableCell className="font-medium text-foreground">{c.name}</TableCell>
                  <TableCell className="text-muted-foreground font-mono text-xs">{c.slug}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${planColor[c.plan] || ""}`}>
                      {c.plan}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{getAdminEmail(c.slug)}</TableCell>
                  <TableCell>
                    <Badge variant={c.status === "Active" ? "default" : "destructive"} className={c.status === "Active" ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-0" : "bg-destructive/15 text-destructive border-0"}>
                      {c.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/super-admin/companies/${c.slug}/edit`)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteTarget(c)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Delete dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteTarget?.name}?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
