import { Settings as SettingsIcon } from "lucide-react";

export default function Settings() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="glass-card rounded-xl p-8 shadow-glass text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-4">
          <SettingsIcon className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Settings</h2>
        <p className="text-sm text-muted-foreground">
          Application settings and configuration will be available here.
        </p>
      </div>
    </div>
  );
}