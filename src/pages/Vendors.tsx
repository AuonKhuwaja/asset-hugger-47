import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Search, ShoppingBag, X, Phone, Mail, Globe, MapPin } from "lucide-react";

interface Vendor {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  category: string;
  status: "active" | "inactive";
  createdAt: string;
}

const seedVendors: Vendor[] = [
  { id: "VND-001", name: "Apple Inc.", contactPerson: "Tim Sales", email: "sales@apple.com", phone: "+1 800 275 2273", address: "Cupertino, CA", website: "apple.com", category: "Electronics", status: "active", createdAt: "2024-01-15" },
  { id: "VND-002", name: "Dell Technologies", contactPerson: "Michael Dell Jr", email: "enterprise@dell.com", phone: "+1 800 624 9897", address: "Round Rock, TX", website: "dell.com", category: "Computers", status: "active", createdAt: "2024-01-20" },
  { id: "VND-003", name: "HP Inc.", contactPerson: "Sarah Printer", email: "orders@hp.com", phone: "+1 800 474 6836", address: "Palo Alto, CA", website: "hp.com", category: "Printers", status: "active", createdAt: "2024-02-10" },
  { id: "VND-004", name: "Lenovo", contactPerson: "James Yang", email: "sales@lenovo.com", phone: "+1 855 253 6686", address: "Morrisville, NC", website: "lenovo.com", category: "Computers", status: "active", createdAt: "2024-02-15" },
  { id: "VND-005", name: "Cisco Systems", contactPerson: "Network Pro", email: "orders@cisco.com", phone: "+1 800 553 6387", address: "San Jose, CA", website: "cisco.com", category: "Networking", status: "active", createdAt: "2024-03-01" },
  { id: "VND-006", name: "Samsung Electronics", contactPerson: "Lee Min", email: "b2b@samsung.com", phone: "+82 2 2255 0114", address: "Seoul, South Korea", website: "samsung.com", category: "Electronics", status: "active", createdAt: "2024-03-10" },
  { id: "VND-007", name: "Epson", contactPerson: "Koji Tanaka", email: "sales@epson.com", phone: "+1 800 463 7766", address: "Los Alamitos, CA", website: "epson.com", category: "Projectors", status: "inactive", createdAt: "2024-03-20" },
  { id: "VND-008", name: "Microsoft", contactPerson: "Azure Team", email: "enterprise@microsoft.com", phone: "+1 800 642 7676", address: "Redmond, WA", website: "microsoft.com", category: "Software", status: "active", createdAt: "2024-04-01" },
  { id: "VND-009", name: "Canon", contactPerson: "Imaging Dept", email: "sales@canon.com", phone: "+1 800 652 2666", address: "Melville, NY", website: "canon.com", category: "Printers", status: "active", createdAt: "2024-04-10" },
];

const vendorCategories = ["Electronics", "Computers", "Printers", "Networking", "Projectors", "Software", "Peripherals", "Other"];

export default function Vendors() {
  const { isAdmin, isViewer } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<Vendor[]>(seedVendors);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Vendor | null>(null);
  const [form, setForm] = useState({ name: "", contactPerson: "", email: "", phone: "", address: "", website: "", category: "", status: "active" as "active" | "inactive" });

  const canEdit = isAdmin && !isViewer;

  const filtered = items.filter(v => {
    if (!search) return true;
    const q = search.toLowerCase();
    return v.name.toLowerCase().includes(q) || v.contactPerson.toLowerCase().includes(q) || v.email.toLowerCase().includes(q) || v.category.toLowerCase().includes(q);
  });

  const resetForm = () => { setForm({ name: "", contactPerson: "", email: "", phone: "", address: "", website: "", category: "", status: "active" }); setEditing(null); setShowForm(false); };

  const handleEdit = (vendor: Vendor) => {
    setEditing(vendor);
    setForm({ name: vendor.name, contactPerson: vendor.contactPerson, email: vendor.email, phone: vendor.phone, address: vendor.address, website: vendor.website, category: vendor.category, status: vendor.status });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setItems(prev => prev.filter(v => v.id !== id));
    toast({ title: "Vendor deleted", description: "The vendor has been removed." });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast({ title: "Validation Error", description: "Vendor name is required.", variant: "destructive" });
      return;
    }
    if (editing) {
      setItems(prev => prev.map(v => v.id === editing.id ? { ...v, ...form } : v));
      toast({ title: "Vendor updated", description: `"${form.name}" has been updated.` });
    } else {
      const newVendor: Vendor = {
        id: `VND-${String(items.length + 1).padStart(3, "0")}`,
        ...form,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setItems(prev => [...prev, newVendor]);
      toast({ title: "Vendor created", description: `"${form.name}" has been added.` });
    }
    resetForm();
  };

  const activeCount = items.filter(v => v.status === "active").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Vendors</h2>
        {canEdit && (
          <Button onClick={() => { resetForm(); setShowForm(true); }} className="bg-gradient-to-r from-primary to-primary/80 font-bold rounded-xl">
            <Plus className="w-4 h-4 mr-2" /> Add Vendor
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Vendors", value: items.length, icon: ShoppingBag, gradient: "linear-gradient(135deg, #1a237e 0%, #0d47a1 50%, #1565c0 100%)" },
          { label: "Active", value: activeCount, icon: ShoppingBag, gradient: "linear-gradient(135deg, #1b5e20 0%, #2e7d32 50%, #388e3c 100%)" },
          { label: "Inactive", value: items.length - activeCount, icon: ShoppingBag, gradient: "linear-gradient(135deg, #e65100 0%, #ef6c00 50%, #f57c00 100%)" },
          { label: "Categories", value: new Set(items.map(v => v.category)).size, icon: ShoppingBag, gradient: "linear-gradient(135deg, #4a148c 0%, #6a1b9a 50%, #7b1fa2 100%)" },
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

      {/* Form */}
      {showForm && (
        <div className="vision-card p-6 animate-scale-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              {editing ? "Edit Vendor" : "New Vendor"}
            </h3>
            <button onClick={resetForm} className="p-1 rounded-lg hover:bg-muted/30 text-muted-foreground"><X className="w-4 h-4" /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Vendor Name *</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Company name" className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Contact Person</Label>
              <Input value={form.contactPerson} onChange={e => setForm(f => ({ ...f, contactPerson: e.target.value }))} placeholder="Contact name" className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Email</Label>
              <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@vendor.com" className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Phone</Label>
              <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+1 800 000 0000" className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Website</Label>
              <Input value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} placeholder="vendor.com" className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Category</Label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="select-vision">
                <option value="">Select category...</option>
                {vendorCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Address</Label>
              <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="City, State" className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Status</Label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as "active" | "inactive" }))} className="select-vision">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="md:col-span-3 flex gap-2">
              <Button type="submit" className="bg-gradient-to-r from-primary to-primary/80 font-bold rounded-xl">
                {editing ? "Update Vendor" : "Create Vendor"}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm} className="rounded-xl">Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="vision-card overflow-hidden">
        <div className="p-5 border-b border-border/10 flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">All Vendors</h3>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-muted/20 border border-border/20 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/10">
                {["ID", "Vendor", "Contact", "Email", "Phone", "Category", "Status", ...(canEdit ? ["Actions"] : [])].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(v => (
                <tr key={v.id} className="border-b border-border/10 hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{v.id}</td>
                  <td className="px-4 py-3 font-medium flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-primary" /> {v.name}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{v.contactPerson}</td>
                  <td className="px-4 py-3 text-muted-foreground">{v.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">{v.phone}</td>
                  <td className="px-4 py-3 text-muted-foreground">{v.category}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${v.status === "active" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
                      {v.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </td>
                  {canEdit && (
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => handleEdit(v)} className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(v.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={canEdit ? 8 : 7} className="px-4 py-8 text-center text-muted-foreground">No vendors found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
