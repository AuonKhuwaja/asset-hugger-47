import { useState } from "react";
import { transferRecords, assets, employees } from "@/lib/mock-data";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeftRight, UserPlus, RotateCcw, Search } from "lucide-react";
import { ExportButtons } from "@/components/ExportButtons";
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
      <h2 className="text-xl font-bold text-foreground">Assignments & Transfers</h2>

      {/* Form Card */}
      <div className="vision-card p-6 animate-fade-in">
        <div className="flex gap-2 mb-6">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                tab === t.key
                  ? "bg-gradient-to-r from-primary/20 to-primary/10 text-primary border border-primary/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/20"
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {tab === "issue" && (
            <>
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Select Asset</Label>
                <select className="select-vision">
                  <option value="">Choose asset...</option>
                  {availableAssets.map((a) => <option key={a.id} value={a.id}>{a.name} ({a.id})</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Assign To</Label>
                <select className="select-vision">
                  <option value="">Choose employee...</option>
                  {employees.map((e) => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Department</Label>
                <select className="select-vision">
                  <option value="">Choose department...</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Issue Date</Label>
                <Input type="date" className="border-border/30 rounded-xl" />
              </div>
            </>
          )}
          {tab === "transfer" && (
            <>
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Select Asset</Label>
                <select className="select-vision">
                  <option value="">Choose asset...</option>
                  {assignedAssets.map((a) => <option key={a.id} value={a.id}>{a.name} → {a.assignee}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Transfer To</Label>
                <select className="select-vision">
                  <option value="">Choose employee...</option>
                  {employees.map((e) => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Department</Label>
                <select className="select-vision">
                  <option value="">Choose department...</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Transfer Date</Label>
                <Input type="date" className="border-border/30 rounded-xl" />
              </div>
            </>
          )}
          {tab === "return" && (
            <>
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Select Asset</Label>
                <select className="select-vision">
                  <option value="">Choose asset...</option>
                  {assignedAssets.map((a) => <option key={a.id} value={a.id}>{a.name} ({a.assignee})</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Condition</Label>
                <select className="select-vision">
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                  <option value="Damaged">Damaged</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Department</Label>
                <select className="select-vision">
                  <option value="">Choose department...</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Return Date</Label>
                <Input type="date" className="border-border/30 rounded-xl" />
              </div>
            </>
          )}
          <div className="md:col-span-3">
            <Button type="submit" className="mt-2 bg-gradient-to-r from-primary to-primary/80 font-bold rounded-xl">
              {tab === "issue" ? "Issue Equipment" : tab === "transfer" ? "Initiate Transfer" : "Process Return"}
            </Button>
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="vision-card overflow-hidden">
        <div className="p-5 border-b border-border/10 flex items-center justify-between gap-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Assignment History</h3>
          <div className="flex items-center gap-3">
            <ExportButtons
              filename="assignments"
              title="Assignment History"
              columns={[
                { header: "ID", accessor: (t: any) => t.id },
                { header: "Asset", accessor: (t: any) => t.assetName },
                { header: "From", accessor: (t: any) => t.fromEmployee },
                { header: "To", accessor: (t: any) => t.toEmployee },
                { header: "Type", accessor: (t: any) => t.type },
                { header: "Date", accessor: (t: any) => t.date },
                { header: "Status", accessor: (t: any) => t.status },
                { header: "Approved By", accessor: (t: any) => t.approvedBy || "" },
              ]}
              rows={filtered}
            />
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 rounded-xl bg-muted/20 border border-border/20 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-dashed border-border bg-primary text-primary-foreground">
                {["ID", "Asset", "Type", "From", "To", "Date", "Status"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-foreground border-r border-dashed border-border/60 last:border-r-0">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="border-b border-dashed border-border/70 transition-colors hover:bg-muted/50">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground border-r border-dashed border-border/40 last:border-r-0">{t.id}</td>
                  <td className="px-4 py-3 font-medium border-r border-dashed border-border/40 last:border-r-0">{t.assetName}</td>
                  <td className="px-4 py-3 capitalize text-muted-foreground border-r border-dashed border-border/40 last:border-r-0">{t.type}</td>
                  <td className="px-4 py-3 text-muted-foreground border-r border-dashed border-border/40 last:border-r-0">{t.fromEmployee}</td>
                  <td className="px-4 py-3 text-muted-foreground border-r border-dashed border-border/40 last:border-r-0">{t.toEmployee}</td>
                  <td className="px-4 py-3 tabular-data text-muted-foreground border-r border-dashed border-border/40 last:border-r-0">{t.date}</td>
                  <td className="px-4 py-3 border-r border-dashed border-border/40 last:border-r-0"><StatusBadge status={t.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}