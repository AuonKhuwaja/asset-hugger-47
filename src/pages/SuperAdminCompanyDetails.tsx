import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ArrowLeft, Building2, Users, Briefcase, Boxes, Wrench, Mail, Pencil,
  CheckCircle, XCircle,
} from "lucide-react";
import type { SACompany, SACompanyUser } from "./SuperAdminCompanies";
import { assets, employees as mockEmployees, departments as mockDepartments, maintenanceRecords } from "@/lib/mock-data";

function getCompanies(): SACompany[] {
  try { return JSON.parse(localStorage.getItem("companies") || "[]"); } catch { return []; }
}
function getCompanyUsers(): SACompanyUser[] {
  try { return JSON.parse(localStorage.getItem("companyUsers") || "[]"); } catch { return []; }
}

type TabKey = "overview" | "users" | "employees" | "departments" | "assets" | "maintenance";

export default function SuperAdminCompanyDetails() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<SACompany | null>(null);
  const [users, setUsers] = useState<SACompanyUser[]>([]);
  const [tab, setTab] = useState<TabKey>("overview");

  useEffect(() => {
    const t = setTimeout(() => {
      const c = getCompanies().find(c => c.slug === slug) || null;
      setCompany(c);
      setUsers(getCompanyUsers().filter(u => u.companySlug === slug));
      setLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, [slug]);

  // For demo purposes, surface mock company data scoped by slug-based slice
  const scoped = useMemo(() => {
    if (!company) return { employees: [], departments: [], assets: [], maintenance: [] };
    return {
      employees: mockEmployees,
      departments: mockDepartments,
      assets,
      maintenance: maintenanceRecords,
    };
  }, [company]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate("/super-admin/companies")} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Card><CardContent className="py-12 text-center text-muted-foreground">Company not found.</CardContent></Card>
      </div>
    );
  }

  const stats = [
    { label: "Admin Users", value: users.length, icon: Users, gradient: "linear-gradient(135deg, #1a237e 0%, #0d47a1 50%, #1565c0 100%)" },
    { label: "Employees", value: scoped.employees.length, icon: Briefcase, gradient: "linear-gradient(135deg, #1b5e20 0%, #2e7d32 50%, #388e3c 100%)" },
    { label: "Departments", value: scoped.departments.length, icon: Building2, gradient: "linear-gradient(135deg, #4a148c 0%, #6a1b9a 50%, #7b1fa2 100%)" },
    { label: "Assets", value: scoped.assets.length, icon: Boxes, gradient: "linear-gradient(135deg, #e65100 0%, #ef6c00 50%, #f57c00 100%)" },
  ];

  const tabs: { key: TabKey; label: string; icon: any }[] = [
    { key: "overview", label: "Overview", icon: Building2 },
    { key: "users", label: "Admin Users", icon: Users },
    { key: "employees", label: "Employees", icon: Briefcase },
    { key: "departments", label: "Departments", icon: Building2 },
    { key: "assets", label: "Assets", icon: Boxes },
    { key: "maintenance", label: "Maintenance", icon: Wrench },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/super-admin/companies")} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: company.color }}>
              {company.initials}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{company.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-mono text-muted-foreground">{company.slug}</span>
                <Badge variant="outline" className="text-[10px]">{company.plan}</Badge>
                <Badge className={company.status === "Active" ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-0" : "bg-destructive/15 text-destructive border-0"}>
                  {company.status === "Active" ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                  {company.status}
                </Badge>
              </div>
            </div>
          </div>
        </div>
        <Button onClick={() => navigate(`/super-admin/companies/${company.slug}/edit`)} className="gap-2">
          <Pencil className="w-4 h-4" /> Edit Company
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="relative overflow-hidden rounded-[1.25rem] p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl" style={{ background: s.gradient, border: '1.5px solid rgba(255,255,255,0.1)' }}>
            <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-white/[0.06] pointer-events-none" />
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
      <div className="flex gap-2 flex-wrap">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              tab === t.key ? "bg-primary/15 text-primary border border-primary/30" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
            }`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {tab === "overview" && (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Info label="Company Name" value={company.name} />
              <Info label="Slug" value={company.slug} mono />
              <Info label="Plan" value={company.plan} />
              <Info label="Status" value={company.status} />
              <Info label="Created" value={new Date(company.createdAt).toLocaleDateString()} />
              <Info label="Primary Admin" value={users[0]?.email || "—"} />
            </div>
          )}

          {tab === "users" && (
            <DataTable
              empty="No admin users yet."
              headers={["Name", "Email", "Role", "Created"]}
              rows={users.map(u => [u.fullName, u.email, u.role, new Date(u.createdAt).toLocaleDateString()])}
            />
          )}

          {tab === "employees" && (
            <DataTable
              empty="No employees."
              headers={["#", "Name"]}
              rows={scoped.employees.map((e, i) => [String(i + 1), e])}
            />
          )}

          {tab === "departments" && (
            <DataTable
              empty="No departments."
              headers={["#", "Department"]}
              rows={scoped.departments.map((d, i) => [String(i + 1), d])}
            />
          )}

          {tab === "assets" && (
            <DataTable
              empty="No assets."
              headers={["ID", "Name", "Category", "Status", "Assignee", "Department"]}
              rows={scoped.assets.slice(0, 20).map(a => [a.id, a.name, a.category, a.status, a.assignee || "—", a.department || "—"])}
            />
          )}

          {tab === "maintenance" && (
            <DataTable
              empty="No maintenance records."
              headers={["ID", "Asset", "Type", "Date", "Status", "Technician"]}
              rows={scoped.maintenance.map(m => [m.id, m.assetName, m.type, m.date, m.status, m.technician])}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Info({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-xl border border-border/30 p-4 bg-muted/10">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-1 text-sm text-foreground ${mono ? "font-mono" : "font-medium"}`}>{value}</p>
    </div>
  );
}

function DataTable({ headers, rows, empty }: { headers: string[]; rows: string[][]; empty: string }) {
  if (rows.length === 0) {
    return <div className="p-10 text-center text-muted-foreground text-sm">{empty}</div>;
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>{headers.map(h => <TableHead key={h}>{h}</TableHead>)}</TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r, i) => (
          <TableRow key={i}>{r.map((c, j) => <TableCell key={j} className={j === 0 ? "font-mono text-xs text-muted-foreground" : ""}>{c}</TableCell>)}</TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
