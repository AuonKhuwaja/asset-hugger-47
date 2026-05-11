import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { assetRequests as initialRequests, categories, type AssetRequest } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, X, Send, Clock, CheckCircle, XCircle } from "lucide-react";

export default function AssetRequests() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<AssetRequest[]>(initialRequests.filter(r => r.requestedBy === user?.name));
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ assetCategory: "", reason: "", priority: "medium" as AssetRequest["priority"] });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.assetCategory || !form.reason.trim()) {
      toast({ title: "Missing fields", description: "Please fill all required fields", variant: "destructive" });
      return;
    }
    const newReq: AssetRequest = {
      id: `REQ-${String(requests.length + 1).padStart(3, "0")}`,
      requestedBy: user?.name || "",
      assetCategory: form.assetCategory,
      reason: form.reason,
      priority: form.priority,
      status: "pending",
      requestDate: new Date().toISOString().split("T")[0],
    };
    setRequests([newReq, ...requests]);
    setForm({ assetCategory: "", reason: "", priority: "medium" });
    setShowForm(false);
    toast({ title: "Request submitted", description: "Your asset request has been sent for approval." });
  };

  const statusIcon = (s: string) => {
    if (s === "approved") return <CheckCircle className="w-4 h-4 text-emerald-400" />;
    if (s === "rejected") return <XCircle className="w-4 h-4 text-red-400" />;
    return <Clock className="w-4 h-4 text-amber-400" />;
  };

  const statusColor = (s: string) => {
    if (s === "approved") return "bg-emerald-500/15 text-emerald-400";
    if (s === "rejected") return "bg-red-500/15 text-red-400";
    return "bg-amber-500/15 text-amber-400";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Asset Requests</h2>
        <Button onClick={() => setShowForm(!showForm)} className="rounded-xl bg-gradient-to-r from-primary to-primary/80">
          {showForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          {showForm ? "Cancel" : "New Request"}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="vision-card p-5 space-y-4 animate-fade-in">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">New Asset Request</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">Asset Category *</Label>
              <select value={form.assetCategory} onChange={e => setForm(f => ({ ...f, assetCategory: e.target.value }))}
                className="w-full h-10 px-3 rounded-xl bg-background border border-border text-foreground text-sm">
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">Priority</Label>
              <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as AssetRequest["priority"] }))}
                className="w-full h-10 px-3 rounded-xl bg-background border border-border text-foreground text-sm">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">Reason *</Label>
              <textarea value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground text-sm min-h-[80px] resize-none"
                placeholder="Why do you need this asset?" />
            </div>
          </div>
          <Button type="submit" className="rounded-xl bg-gradient-to-r from-primary to-primary/80">
            <Send className="w-4 h-4 mr-2" /> Submit Request
          </Button>
        </form>
      )}

      {requests.length === 0 ? (
        <div className="vision-card p-12 text-center">
          <Send className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground">No asset requests yet. Click "New Request" to get started.</p>
        </div>
      ) : (
        <div className="vision-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-dashed border-border bg-primary text-primary-foreground">
                <th className="text-left px-4 py-3 text-xs font-bold uppercase text-foreground border-r border-dashed border-border/60 last:border-r-0">ID</th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase text-foreground border-r border-dashed border-border/60 last:border-r-0">Category</th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase text-foreground border-r border-dashed border-border/60 last:border-r-0">Reason</th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase text-foreground border-r border-dashed border-border/60 last:border-r-0">Priority</th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase text-foreground border-r border-dashed border-border/60 last:border-r-0">Date</th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase text-foreground border-r border-dashed border-border/60 last:border-r-0">Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(req => (
                <tr key={req.id} className="border-b border-dashed border-border transition-colors hover:bg-muted/50">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground border-r border-dashed border-border last:border-r-0">{req.id}</td>
                  <td className="px-4 py-3 font-medium text-foreground border-r border-dashed border-border last:border-r-0">{req.assetCategory}</td>
                  <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate border-r border-dashed border-border last:border-r-0">{req.reason}</td>
                  <td className="px-4 py-3 border-r border-dashed border-border last:border-r-0">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      req.priority === "high" ? "bg-red-500/15 text-red-400" :
                      req.priority === "medium" ? "bg-amber-500/15 text-amber-400" :
                      "bg-emerald-500/15 text-emerald-400"
                    }`}>{req.priority}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground border-r border-dashed border-border last:border-r-0">{req.requestDate}</td>
                  <td className="px-4 py-3 border-r border-dashed border-border last:border-r-0">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusColor(req.status)}`}>
                      {statusIcon(req.status)} {req.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}