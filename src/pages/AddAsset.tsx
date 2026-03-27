import { useState, useMemo } from "react";
import { departments, type AssetCategory } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { QrCode, Upload, PackagePlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const categories: AssetCategory[] = ["Laptop", "Printer", "Projector", "Mobile", "Monitor", "Server", "Tablet", "Network Equipment", "Other"];
const conditions = ["New", "Good", "Fair", "Poor"];

const assetSchema = z.object({
  name: z.string().trim().min(1, "Asset name is required").max(100),
  category: z.string().min(1),
  model: z.string().trim().min(1, "Model number is required").max(100),
  serialNumber: z.string().trim().min(1, "Serial number is required").max(50),
  purchaseDate: z.string().min(1, "Purchase date is required"),
  purchaseCost: z.string().refine((v) => Number(v) > 0, "Valid cost is required"),
  vendor: z.string().trim().min(1, "Vendor name is required").max(100),
  condition: z.string().min(1),
  department: z.string().optional(),
  description: z.string().max(500).optional(),
});

export default function AddAsset() {
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: "", category: "Laptop", model: "", serialNumber: "",
    purchaseDate: "", purchaseCost: "", vendor: "", condition: "New",
    department: "", description: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const qrCode = useMemo(() => `QR-${Date.now().toString(36).toUpperCase()}`, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = assetSchema.safeParse(form);
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.errors.forEach((err) => { errs[err.path[0] as string] = err.message; });
      setErrors(errs);
      return;
    }
    toast({ title: "Asset Registered!", description: `${form.name} registered with tag ${qrCode}` });
    setForm({ name: "", category: "Laptop", model: "", serialNumber: "", purchaseDate: "", purchaseCost: "", vendor: "", condition: "New", department: "", description: "" });
    setErrors({});
  };

  const update = (field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => { const n = { ...e }; delete n[field]; return n; });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-xl font-bold text-foreground">Register New Asset</h2>

      <form onSubmit={handleSubmit} className="vision-card p-6 space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 icon-glow flex items-center justify-center">
            <PackagePlus className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">Asset Details</h3>
            <p className="text-xs text-muted-foreground">Fill in all required fields</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Asset Name <span className="text-destructive">*</span></Label>
            <Input id="name" placeholder="e.g. MacBook Pro 16 inch" value={form.name} onChange={(e) => update("name", e.target.value)} className="border-border/30 rounded-xl" />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Category <span className="text-destructive">*</span></Label>
            <select value={form.category} onChange={(e) => update("category", e.target.value)} className="select-vision">
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="model" className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Model Number <span className="text-destructive">*</span></Label>
            <Input id="model" placeholder="e.g. A2485" value={form.model} onChange={(e) => update("model", e.target.value)} className="border-border/30 rounded-xl" />
            {errors.model && <p className="text-xs text-destructive">{errors.model}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="serial" className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Serial Number <span className="text-destructive">*</span></Label>
            <Input id="serial" placeholder="e.g. C02FW3LYMD6T" value={form.serialNumber} onChange={(e) => update("serialNumber", e.target.value)} className="border-border/30 rounded-xl" />
            {errors.serialNumber && <p className="text-xs text-destructive">{errors.serialNumber}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="date" className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Purchase Date <span className="text-destructive">*</span></Label>
            <Input id="date" type="date" value={form.purchaseDate} onChange={(e) => update("purchaseDate", e.target.value)} className="border-border/30 rounded-xl" />
            {errors.purchaseDate && <p className="text-xs text-destructive">{errors.purchaseDate}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cost" className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Purchase Cost (PKR) <span className="text-destructive">*</span></Label>
            <Input id="cost" type="number" placeholder="e.g. 250000" value={form.purchaseCost} onChange={(e) => update("purchaseCost", e.target.value)} className=" border-border/30 rounded-xl" />
            {errors.purchaseCost && <p className="text-xs text-destructive">{errors.purchaseCost}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="vendor" className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Vendor Name <span className="text-destructive">*</span></Label>
            <Input id="vendor" placeholder="e.g. Apple Inc." value={form.vendor} onChange={(e) => update("vendor", e.target.value)} className=" border-border/30 rounded-xl" />
            {errors.vendor && <p className="text-xs text-destructive">{errors.vendor}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Condition</Label>
            <select value={form.condition} onChange={(e) => update("condition", e.target.value)} className="select-vision">
              {conditions.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Department</Label>
            <select value={form.department} onChange={(e) => update("department", e.target.value)} className="select-vision">
              <option value="">Select Department</option>
              {departments.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">QR/Barcode Tag</Label>
            <div className="flex items-center gap-3">
              <Input value={qrCode} readOnly className=" border-border/20 font-mono text-primary rounded-xl" />
              <div className="w-10 h-10 icon-glow flex items-center justify-center shrink-0">
                <QrCode className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground">Auto-generated</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Asset Photo (Optional)</Label>
          <div className="border-2 border-dashed border-border/20 rounded-2xl p-8 text-center hover:border-primary/30 transition-colors cursor-pointer">
            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Click or drag to upload</p>
            <p className="text-xs text-muted-foreground/50 mt-1">PNG, JPG up to 5MB</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="desc" className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Notes</Label>
          <Textarea id="desc" placeholder="Additional notes..." value={form.description} onChange={(e) => update("description", e.target.value)} className="border-border/30 rounded-xl min-h-[100px]" />
        </div>

        <Button type="submit" size="lg" className="w-full md:w-auto bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 font-bold rounded-xl">
          <PackagePlus className="w-4 h-4 mr-2" />
          Register Asset
        </Button>
      </form>
    </div>
  );
}