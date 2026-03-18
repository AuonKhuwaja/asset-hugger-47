import { Settings as SettingsIcon, User, Bell, Shield, Palette } from "lucide-react";

const settingsSections = [
  { icon: User, title: "Profile", desc: "Manage your account and preferences" },
  { icon: Bell, title: "Notifications", desc: "Configure alerts and notification channels" },
  { icon: Shield, title: "Security", desc: "Password, 2FA, and access settings" },
  { icon: Palette, title: "Appearance", desc: "Theme and display customizations" },
];

export default function Settings() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-xl font-bold text-foreground">Settings</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {settingsSections.map((s) => (
          <div key={s.title} className="vision-card vision-card-hover p-6 cursor-pointer animate-scale-in">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 icon-glow flex items-center justify-center shrink-0">
                <s.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">{s.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{s.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="vision-card p-8 text-center animate-fade-in">
        <div className="w-16 h-16 icon-glow-purple flex items-center justify-center mx-auto mb-4">
          <SettingsIcon className="w-7 h-7 text-white" />
        </div>
        <h3 className="text-lg font-bold text-foreground mb-2">Coming Soon</h3>
        <p className="text-sm text-muted-foreground">Full settings panel is under development.</p>
      </div>
    </div>
  );
}