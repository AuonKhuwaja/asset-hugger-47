import { useState } from "react";
import { transferRecords, assets, employees, departments } from "@/lib/mock-data";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeftRight, UserPlus, RotateCcw, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type FormTab = "issue" | "transfer" | "return";

export default function Assignments() {
  const { toast } = useToast();
  const [tab, setTab] = useState<FormTab>("issue");
  const [search, setSearch] = useState("");

  const availableAssets = assets.filter((a) => a.status === "available");
  const assignedAssets = assets.filter((a) => a.status === "in-use");

  const filtered = transferRecords.filter((t) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return t.assetName.toLowerCase().includes(q) || t.fromEmployee.toLowerCase().includes(q) || t.toEmployee.toLowerCase().includes(q);
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const msgs = { issue: "Equipment issued successfully", transfer: "Transfer initiated", return: "Return processed" };
    toast({ title: msgs[tab], description: "The record has been updated." });
  };

  const tabs: { key: FormTab; label: string; icon: React.ElementType }[] = [
    { key: "issue", label: "Issue Equipment", icon: UserPlus },
    { key: "transfer", label: "Transfer", icon: ArrowLeftRight },
    { key: "return", label: "Return", icon: RotateCcw },
  ];

  return (
    <div className="space-y-6">
      {/* Form */}
      <div className="glass-card rounded-xl p-5 shadow-glass">
        <div className="flex gap-2 mb-5">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t.key ? "bg-primary/20 text-primary border border-primary/30" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tab === "issue" && (
            <>
              <div className="space-y-1.5">
                <Label>Select Asset</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-foreground">
                  <option value="">Choose asset...</option>
                  {availableAssets.map((a) => <option key={a.id} value={a.id}>{a.name} ({a.id})</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Assign To</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-foreground">
                  <option value="">Choose employee...</option>
                  {employees.map((e) => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Issue Date</Label>
                <Input type="date" className="bg-muted/50" />
              </div>
            </>
          )}
          {tab === "transfer" && (
            <>
              <div className="space-y-1.5">
                <Label>Select Asset</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-foreground">
                  <option value="">Choose asset...</option>
                  {assignedAssets.map((a) => <option key={a.id} value={a.id}>{a.name} → {a.assignee}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Transfer To</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-foreground">
                  <option value="">Choose employee...</option>
                  {employees.map((e) => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Transfer Date</Label>
                <Input type="date" className="bg-muted/50" />
              </div>
            </>
          )}
          {tab === "return" && (
            <>
              <div className="space-y-1.5">
                <Label>Select Asset</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-foreground">
                  <option value="">Choose asset...</option>
                  {assignedAssets.map((a) => <option key={a.id} value={a.id}>{a.name} ({a.assignee})</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Condition on Return</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-foreground">
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                  <option value="Damaged">Damaged</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Return Date</Label>
                <Input type="date" className="bg-muted/50" />
              </div>
            </>
          )}
          <div className="md:col-span-3">
            <Button type="submit" className="mt-2">
              {tab === "issue" ? "Issue Equipment" : tab === "transfer" ? "Initiate Transfer" : "Process Return"}
            </Button>
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="glass-card rounded-xl shadow-glass overflow-hidden">
        <div className="p-4 border-b border-border/30 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Assignment History</h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-muted/50 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Asset</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">From</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">To</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{t.id}</td>
                  <td className="px-4 py-3 font-medium">{t.assetName}</td>
                  <td className="px-4 py-3 capitalize text-muted-foreground">{t.type}</td>
                  <td className="px-4 py-3 text-muted-foreground">{t.fromEmployee}</td>
                  <td className="px-4 py-3 text-muted-foreground">{t.toEmployee}</td>
                  <td className="px-4 py-3 tabular-data text-muted-foreground">{t.date}</td>
                  <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}