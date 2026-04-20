import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KpiCard } from "@/components/KpiCard";
import { Play, CalendarClock, Mail, Repeat, CheckCircle2, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { assets, depreciationData } from "@/lib/mock-data";

export interface DepreciationRunLog {
  id: string;
  runAt: string;
  assetsProcessed: number;
  totalReduced: number;
  status: "success" | "failed";
  triggeredBy: "manual" | "scheduled";
  notifyEmail?: string;
}

const STORAGE_KEY = "tv_depreciation_runs";
const SCHED_KEY = "tv_depreciation_schedule";

export function loadRuns(): DepreciationRunLog[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}
function saveRuns(runs: DepreciationRunLog[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(runs));
}

interface Schedule {
  enabled: boolean;
  frequency: "daily" | "weekly" | "monthly";
  nextRun: string;
  notifyEmail: string;
}

export default function DepreciationRun() {
  const { toast } = useToast();
  const [runs, setRuns] = useState<DepreciationRunLog[]>(loadRuns());
  const [schedule, setSchedule] = useState<Schedule>(() => {
    try { return JSON.parse(localStorage.getItem(SCHED_KEY) || "null") || { enabled: false, frequency: "monthly", nextRun: "", notifyEmail: "" }; }
    catch { return { enabled: false, frequency: "monthly", nextRun: "", notifyEmail: "" }; }
  });

  useEffect(() => { localStorage.setItem(SCHED_KEY, JSON.stringify(schedule)); }, [schedule]);

  const lastRun = runs[0];
  const successCount = runs.filter((r) => r.status === "success").length;

  const triggerRun = (triggeredBy: "manual" | "scheduled" = "manual") => {
    const totalReduced = depreciationData.reduce((s, d) => s + Math.round(d.currentValue * 0.01), 0);
    const log: DepreciationRunLog = {
      id: `RUN-${Date.now()}`,
      runAt: new Date().toISOString(),
      assetsProcessed: assets.length,
      totalReduced,
      status: Math.random() > 0.05 ? "success" : "failed",
      triggeredBy,
      notifyEmail: schedule.notifyEmail || undefined,
    };
    const next = [log, ...runs];
    setRuns(next); saveRuns(next);
    toast({
      title: log.status === "success" ? "Depreciation Run Completed" : "Depreciation Run Failed",
      description: `${log.assetsProcessed} assets · PKR ${log.totalReduced.toLocaleString()} reduced${log.notifyEmail ? ` · email sent to ${log.notifyEmail}` : ""}`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-bold text-foreground">Depreciation Run (Scheduler)</h2>
        <Button onClick={() => triggerRun("manual")} className="bg-gradient-to-r from-primary to-primary/80 font-bold rounded-xl">
          <Play className="w-4 h-4 mr-2" /> Run Now
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard title="Total Runs" value={String(runs.length)} icon={Repeat}
          gradient="linear-gradient(135deg, #1a237e 0%, #0d47a1 50%, #1565c0 100%)" />
        <KpiCard title="Successful" value={String(successCount)} icon={CheckCircle2}
          gradient="linear-gradient(135deg, #1b5e20 0%, #2e7d32 50%, #388e3c 100%)" />
        <KpiCard title="Last Run" value={lastRun ? new Date(lastRun.runAt).toLocaleDateString() : "—"}
          subtitle={lastRun ? new Date(lastRun.runAt).toLocaleTimeString() : "No runs yet"}
          icon={Clock}
          gradient="linear-gradient(135deg, #4a148c 0%, #6a1b9a 50%, #7b1fa2 100%)" />
      </div>

      <div className="vision-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <CalendarClock className="w-5 h-5 text-primary" />
          <h3 className="text-base font-bold">Automatic Schedule</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Status</Label>
            <select className="select-vision" value={schedule.enabled ? "on" : "off"}
              onChange={(e) => setSchedule({ ...schedule, enabled: e.target.value === "on" })}>
              <option value="off">Disabled</option>
              <option value="on">Enabled</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Frequency</Label>
            <select className="select-vision" value={schedule.frequency}
              onChange={(e) => setSchedule({ ...schedule, frequency: e.target.value as Schedule["frequency"] })}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Next Run</Label>
            <Input type="date" value={schedule.nextRun} onChange={(e) => setSchedule({ ...schedule, nextRun: e.target.value })} className="border-border/30 rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider flex items-center gap-1"><Mail className="w-3 h-3" /> Notify Email</Label>
            <Input type="email" placeholder="finance@company.com" value={schedule.notifyEmail}
              onChange={(e) => setSchedule({ ...schedule, notifyEmail: e.target.value })} className="border-border/30 rounded-xl" />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" className="rounded-xl" onClick={() => triggerRun("scheduled")}>Test Scheduled Run</Button>
          <Button className="bg-gradient-to-r from-primary to-primary/80 font-bold rounded-xl"
            onClick={() => toast({ title: "Schedule Saved", description: `${schedule.frequency} runs ${schedule.enabled ? "enabled" : "disabled"}` })}>
            Save Schedule
          </Button>
        </div>
      </div>
    </div>
  );
}
