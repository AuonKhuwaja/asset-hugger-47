import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import type { SACompany, SACompanyUser } from "./SuperAdminCompanies";

function genId() {
  return crypto.randomUUID?.() || Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

function toInitials(name: string) {
  return name.split(/\s+/).map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

const plans = ["Basic", "Pro", "Enterprise"] as const;
const statuses = ["Active", "Inactive"] as const;

export default function SuperAdminAddCompany() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [color, setColor] = useState("#2563EB");
  const [plan, setPlan] = useState<typeof plans[number]>("Basic");
  const [status, setStatus] = useState<typeof statuses[number]>("Active");

  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPw, setAdminPw] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleNameChange = (v: string) => {
    setName(v);
    if (!slugManual) setSlug(toSlug(v));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Required";
    if (!slug.trim()) e.slug = "Required";
    if (!adminName.trim()) e.adminName = "Required";
    if (!adminEmail.trim()) e.adminEmail = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail)) e.adminEmail = "Invalid email";
    if (!adminPw) e.adminPw = "Required";
    else if (adminPw.length < 6) e.adminPw = "Min 6 characters";

    // Check duplicate slug
    const existing: SACompany[] = JSON.parse(localStorage.getItem("companies") || "[]");
    if (slug && existing.some(c => c.slug === slug)) e.slug = "Slug already exists";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setTimeout(() => {
      const company: SACompany = {
        id: genId(), name: name.trim(), slug: slug.trim(), color, initials: toInitials(name),
        plan, status, createdAt: new Date().toISOString(),
      };
      const user: SACompanyUser = {
        id: genId(), companySlug: slug.trim(), fullName: adminName.trim(),
        email: adminEmail.trim(), password: adminPw, role: "admin", createdAt: new Date().toISOString(),
      };

      const companies: SACompany[] = JSON.parse(localStorage.getItem("companies") || "[]");
      const users: SACompanyUser[] = JSON.parse(localStorage.getItem("companyUsers") || "[]");
      companies.push(company);
      users.push(user);
      localStorage.setItem("companies", JSON.stringify(companies));
      localStorage.setItem("companyUsers", JSON.stringify(users));

      toast({ title: "Company created", description: "Company and admin account created successfully." });
      navigate("/super-admin/companies");
      setSaving(false);
    }, 600);
  };

  const fieldClass = (key: string) => errors[key] ? "border-destructive" : "";

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Button variant="ghost" className="gap-2 -ml-2" onClick={() => navigate("/super-admin/companies")}>
        <ArrowLeft className="w-4 h-4" /> Companies
      </Button>
      <h1 className="text-2xl font-bold text-foreground">Add New Company</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left — Company Info */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Company Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="Company Name" error={errors.name}>
                <Input value={name} onChange={e => handleNameChange(e.target.value)} className={fieldClass("name")} placeholder="TechCorp Pvt Ltd" />
              </Field>
              <Field label="Company Slug / Code" error={errors.slug} helper="Employees will use this code to login">
                <Input value={slug} onChange={e => { setSlug(toSlug(e.target.value)); setSlugManual(true); }} className={`font-mono ${fieldClass("slug")}`} placeholder="techcorp" />
              </Field>
              <Field label="Brand Color">
                <div className="flex items-center gap-3">
                  <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-10 h-10 rounded-lg border border-input cursor-pointer" />
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: color }}>
                    {toInitials(name) || "CO"}
                  </div>
                  <span className="text-sm text-muted-foreground font-mono">{color}</span>
                </div>
              </Field>
              <Field label="Plan">
                <select value={plan} onChange={e => setPlan(e.target.value as typeof plans[number])} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  {plans.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </Field>
              <Field label="Status">
                <select value={status} onChange={e => setStatus(e.target.value as typeof statuses[number])} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
            </CardContent>
          </Card>

          {/* Right — Admin User */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Company Admin Account</CardTitle>
              <CardDescription>This user will manage departments and employees for this company</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="Admin Full Name" error={errors.adminName}>
                <Input value={adminName} onChange={e => setAdminName(e.target.value)} className={fieldClass("adminName")} placeholder="John Doe" />
              </Field>
              <Field label="Admin Email" error={errors.adminEmail}>
                <Input type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} className={fieldClass("adminEmail")} placeholder="admin@techcorp.com" />
              </Field>
              <Field label="Admin Password" error={errors.adminPw}>
                <div className="relative">
                  <Input
                    type={showPw ? "text" : "password"}
                    value={adminPw}
                    onChange={e => setAdminPw(e.target.value)}
                    className={`pr-10 ${fieldClass("adminPw")}`}
                    placeholder="Min 6 characters"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </Field>
              <Field label="Role">
                <Badge className="bg-primary/10 text-primary border-0">Company Admin</Badge>
              </Field>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end mt-6">
          <Button type="submit" disabled={saving} className="gap-2 min-w-[180px]">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : "Create Company"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, error, helper, children }: { label: string; error?: string; helper?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      {children}
      {helper && !error && <p className="text-xs text-muted-foreground">{helper}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
