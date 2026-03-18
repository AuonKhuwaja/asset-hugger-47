import { useState } from "react";
import { departments, type AssetCategory } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { QrCode, Upload, PackagePlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const categories: AssetCategory[] = ["Laptop", "Printer", "Projector", "Mobile", "Monitor", "Server", "Tablet", "Network Equipment", "Other"];
const conditions = ["New", "Good", "Fair", "Poor"];

export default function AddAsset() {
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: "", category: "Laptop" as AssetCategory, model: "", serialNumber: "",
    purchaseDate: "", purchaseCost: "", vendor: "", condition: "New",
    department: "", description: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const qrCode = `QR-${Date.now().toString(36).toUpperCase()}`;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Asset name is required";
    if (!form.model.trim()) errs.model = "Model number is required";
    if (!form.serialNumber.trim()) errs.serialNumber = "Serial number is required";
    if (!form.purchaseDate) errs.purchaseDate = "Purchase date is required";
    if (!form.purchaseCost || Number(form.purchaseCost) <= 0) errs.purchaseCost = "Valid cost is required";
    if (!form.vendor.trim()) errs.vendor = "Vendor name is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    toast({
      title: "Asset Registered!",
      description: `${form.name} has been successfully registered with tag ${qrCode}`,
    });
    setForm({ name: "", category: "Laptop", model: "", serialNumber: "", purchaseDate: "", purchaseCost: "", vendor: "", condition: "New", department: "", description: "" });
    setErrors({});
  };

  const update = (field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => { const n = { ...e }; delete n[field]; return n; });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <form onSubmit={handleSubmit} className="glass-card rounded-xl p-6 shadow-glass space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
            <PackagePlus className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Register New Asset</h2>
            <p className="text-xs text-muted-foreground">Fill in the details below to add a new asset</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Asset Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name">Asset Name <span className="text-destructive">*</span></Label>
            <Input id="name" placeholder="e.g. MacBook Pro 16 inch" value={form.name} onChange={(e) => update("name", e.target.value)} className="bg-muted/50" />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label>Category <span className="text-destructive">*</span></Label>
            <select value={form.category} onChange={(e) => update("category", e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50">
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Model */}
          <div className="space-y-1.5">
            <Label htmlFor="model">Model Number <span className="text-destructive">*</span></Label>
            <Input id="model" placeholder="e.g. A2485" value={form.model} onChange={(e) => update("model", e.target.value)} className="bg-muted/50" />
            {errors.model && <p className="text-xs text-destructive">{errors.model}</p>}
          </div>

          {/* Serial */}
          <div className="space-y-1.5">
            <Label htmlFor="serial">Serial Number <span className="text-destructive">*</span></Label>
            <Input id="serial" placeholder="e.g. C02FW3LYMD6T" value={form.serialNumber} onChange={(e) => update("serialNumber", e.target.value)} className="bg-muted/50" />
            {errors.serialNumber && <p className="text-xs text-destructive">{errors.serialNumber}</p>}
          </div>

          {/* Purchase Date */}
          <div className="space-y-1.5">
            <Label htmlFor="date">Purchase Date <span className="text-destructive">*</span></Label>
            <Input id="date" type="date" value={form.purchaseDate} onChange={(e) => update("purchaseDate", e.target.value)} className="bg-muted/50" />
            {errors.purchaseDate && <p className="text-xs text-destructive">{errors.purchaseDate}</p>}
          </div>

          {/* Purchase Cost */}
          <div className="space-y-1.5">
            <Label htmlFor="cost">Purchase Cost (PKR) <span className="text-destructive">*</span></Label>
            <Input id="cost" type="number" placeholder="e.g. 250000" value={form.purchaseCost} onChange={(e) => update("purchaseCost", e.target.value)} className="bg-muted/50" />
            {errors.purchaseCost && <p className="text-xs text-destructive">{errors.purchaseCost}</p>}
          </div>

          {/* Vendor */}
          <div className="space-y-1.5">
            <Label htmlFor="vendor">Vendor Name <span className="text-destructive">*</span></Label>
            <Input id="vendor" placeholder="e.g. Apple Inc." value={form.vendor} onChange={(e) => update("vendor", e.target.value)} className="bg-muted/50" />
            {errors.vendor && <p className="text-xs text-destructive">{errors.vendor}</p>}
          </div>

          {/* Condition */}
          <div className="space-y-1.5">
            <Label>Condition</Label>
            <select value={form.condition} onChange={(e) => update("condition", e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50">
              {conditions.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Department */}
          <div className="space-y-1.5">
            <Label>Department Assigned To</Label>
            <select value={form.department} onChange={(e) => update("department", e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50">
              <option value="">Select Department</option>
              {departments.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {/* QR Tag */}
          <div className="space-y-1.5">
            <Label>QR/Barcode Tag ID</Label>
            <div className="flex items-center gap-3">
              <Input value={qrCode} readOnly className="bg-muted/30 font-mono text-primary" />
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 glow-cyan">
                <QrCode className="w-5 h-5 text-primary" />
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground">Auto-generated tag ID</p>
          </div>
        </div>

        {/* Photo Upload */}
        <div className="space-y-1.5">
          <Label>Asset Photo (Optional)</Label>
          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Click or drag to upload asset photo</p>
            <p className="text-xs text-muted-foreground/60 mt-1">PNG, JPG up to 5MB</p>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <Label htmlFor="desc">Description / Notes</Label>
          <Textarea id="desc" placeholder="Additional notes about this asset..." value={form.description} onChange={(e) => update("description", e.target.value)} className="bg-muted/50 min-h-[100px]" />
        </div>

        <Button type="submit" size="lg" className="w-full md:w-auto">
          <PackagePlus className="w-4 h-4 mr-2" />
          Register Asset
        </Button>
      </form>
    </div>
  );
}