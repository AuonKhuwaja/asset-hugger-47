import { useState } from "react";
import { maintenanceRecords, assets } from "@/lib/mock-data";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Wrench, Search, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Maintenance() {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "preventive" | "corrective">("all");

  const filtered = maintenanceRecords.filter((m) => {
    if (typeFilter !== "all" && m.type !== typeFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return m.assetName.toLowerCase().includes(q) || m.description.toLowerCase().includes(q) || m.technician.toLowerCase().includes(q);
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Maintenance Scheduled", description: "Record created successfully." });
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Maintenance</h2>
        <Button onClick={() => setShowForm(!showForm)} className={showForm ? "bg-muted hover:bg-muted/80" : "bg-gradient-to-r from-primary to-primary/80 font-bold rounded-xl"}>
          <Plus className="w-4 h-4 mr-2" />
          {showForm ? "Cancel" : "Schedule Maintenance"}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="vision-card p-6 space-y-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 icon-glow-orange flex items-center justify-center">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-base font-bold text-foreground">Schedule Maintenance</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Asset</Label>
              <select className="select-vision">
                <option value="">Select asset...</option>
                {assets.map((a) => <option key={a.id} value={a.id}>{a.name} ({a.id})</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Type</Label>
              <select className="select-vision">
                <option value="preventive">Preventive</option>
                <option value="corrective">Corrective</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Date</Label>
              <Input type="date" className=" border-border/30 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Cost (PKR)</Label>
              <Input type="number" placeholder="0" className=" border-border/30 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Technician</Label>
              <Input placeholder="Name" className=" border-border/30 rounded-xl" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Description</Label>
            <Textarea placeholder="Describe the work..." className=" border-border/30 rounded-xl min-h-[80px]" />
          </div>
          <Button type="submit" className="bg-gradient-to-r from-primary to-primary/80 font-bold rounded-xl">Save Record</Button>
        </form>
      )}

      {/* Table */}
      <div className="vision-card overflow-hidden">
        <div className="p-5 border-b border-border/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            {(["all", "preventive", "corrective"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  typeFilter === t ? "bg-primary/20 text-primary border border-primary/30" : "text-muted-foreground hover:text-foreground hover:bg-muted/20"
                }`}
              >
                {t === "all" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 rounded-xl bg-muted/20 border border-border/20 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/10">
                {["ID", "Asset", "Type", "Description", "Technician", "Date", "Cost", "Status"].map((h) => (
                  <th key={h} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground ${h === "Cost" ? "text-right" : "text-left"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id} className="border-b border-border/10 hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{m.id}</td>
                  <td className="px-4 py-3 font-medium">{m.assetName}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold ${m.type === "preventive" ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive"}`}>
                      {m.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate">{m.description}</td>
                  <td className="px-4 py-3 text-muted-foreground">{m.technician}</td>
                  <td className="px-4 py-3 tabular-data text-muted-foreground">{m.date}</td>
                  <td className="px-4 py-3 text-right tabular-data font-medium text-primary">PKR {m.cost.toLocaleString()}</td>
                  <td className="px-4 py-3"><StatusBadge status={m.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}