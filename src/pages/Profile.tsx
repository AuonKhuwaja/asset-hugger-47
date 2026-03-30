import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Phone, Building2, Shield, Save } from "lucide-react";

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    department: user?.department || "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (form.name.length > 100) errs.name = "Name must be under 100 characters";
    if (form.phone && !/^[+\d\s()-]{7,20}$/.test(form.phone)) errs.phone = "Invalid phone number";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    updateProfile(form);
    setEditing(false);
    toast({ title: "Profile updated", description: "Your information has been saved." });
  };

  const handleCancel = () => {
    setForm({ name: user?.name || "", phone: user?.phone || "", department: user?.department || "" });
    setErrors({});
    setEditing(false);
  };

  const roleLabel = user?.role === "super_admin" ? "Super Admin" : user?.role === "admin" ? "Administrator" : "Viewer";
  const roleBg = user?.role === "super_admin" ? "from-secondary to-secondary/70" : user?.role === "admin" ? "from-primary to-primary/70" : "from-muted to-muted/70";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-xl font-bold text-foreground">My Profile</h2>

      {/* Profile Header */}
      <div className="vision-card p-6 animate-fade-in">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-border/20">
            <User className="w-10 h-10 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-foreground">{user?.name}</h3>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <span className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${roleBg}`}>
              <Shield className="w-3 h-3" /> {roleLabel}
            </span>
          </div>
          {!editing && (
            <Button onClick={() => setEditing(true)} variant="outline" className="rounded-xl">Edit Profile</Button>
          )}
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSave} className="vision-card p-6 space-y-5 animate-fade-in">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">Personal Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Full Name
            </Label>
            <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} disabled={!editing} className="rounded-xl" />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" /> Email
            </Label>
            <Input value={user?.email || ""} disabled className="rounded-xl opacity-60" />
            <p className="text-xs text-muted-foreground">Email cannot be changed</p>
          </div>
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" /> Phone
            </Label>
            <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} disabled={!editing} className="rounded-xl" placeholder="+92 xxx xxxxxxx" />
            {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
          </div>
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" /> Department
            </Label>
            <Input value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} disabled={!editing} className="rounded-xl" />
          </div>
        </div>

        {editing && (
          <div className="flex gap-2 pt-2">
            <Button type="submit" className="bg-gradient-to-r from-primary to-primary/80 font-bold rounded-xl">
              <Save className="w-4 h-4 mr-2" /> Save Changes
            </Button>
            <Button type="button" variant="outline" onClick={handleCancel} className="rounded-xl">Cancel</Button>
          </div>
        )}
      </form>

      {/* Assigned Companies */}
      <div className="vision-card p-6 animate-fade-in">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Assigned Companies</h3>
        <div className="flex flex-wrap gap-2">
          {user?.assignedCompanies.map(id => (
            <span key={id} className="px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
              {id}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
