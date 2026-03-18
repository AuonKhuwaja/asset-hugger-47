import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  PackagePlus,
  ArrowLeftRight,
  Wrench,
  Receipt,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronDown,
  Menu,
  QrCode,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  {
    label: "Assets",
    icon: Package,
    children: [
      { to: "/assets", label: "All Assets" },
      { to: "/assets/add", label: "Add Asset" },
    ],
  },
  { to: "/assignments", icon: ArrowLeftRight, label: "Assignments" },
  { to: "/maintenance", icon: Wrench, label: "Maintenance" },
  { to: "/billing", icon: Receipt, label: "Billing & Charging" },
  { to: "/reports", icon: BarChart3, label: "Reports" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [assetsOpen, setAssetsOpen] = useState(true);
  const location = useLocation();

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed z-40 md:relative flex flex-col h-full bg-gradient-sidebar border-r border-sidebar-border transition-all duration-200 ${
          collapsed ? "w-[68px]" : "w-64"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
          {!collapsed && (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center glow-cyan">
                <QrCode className="w-4.5 h-4.5 text-primary" />
              </div>
              <span className="text-base font-bold text-foreground tracking-tight">
                Track<span className="text-primary">Vault</span>
              </span>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center mx-auto glow-cyan">
              <QrCode className="w-4.5 h-4.5 text-primary" />
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex items-center justify-center w-7 h-7 rounded-md hover:bg-sidebar-accent text-sidebar-foreground transition-colors"
          >
            <ChevronLeft className={`w-4 h-4 transition-transform duration-200 ${collapsed ? "rotate-180" : ""}`} />
          </button>
        </div>

        <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            if ("children" in item && item.children) {
              const isChildActive = item.children.some((c) => isActive(c.to));
              return (
                <div key={item.label}>
                  <button
                    onClick={() => !collapsed && setAssetsOpen(!assetsOpen)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                      isChildActive
                        ? "text-primary bg-primary/10"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                    } ${collapsed ? "justify-center" : ""}`}
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-200 ${assetsOpen ? "rotate-0" : "-rotate-90"}`}
                        />
                      </>
                    )}
                  </button>
                  {!collapsed && assetsOpen && (
                    <div className="ml-5 mt-1 space-y-0.5 border-l border-sidebar-border pl-3">
                      {item.children.map((child) => (
                        <NavLink
                          key={child.to}
                          to={child.to}
                          end
                          onClick={() => setMobileOpen(false)}
                          className={() =>
                            `flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all duration-150 ${
                              location.pathname === child.to
                                ? "text-primary font-medium sidebar-active-glow"
                                : "text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent/30"
                            }`
                          }
                        >
                          {child.to === "/assets/add" ? (
                            <PackagePlus className="w-4 h-4 shrink-0" />
                          ) : (
                            <Package className="w-4 h-4 shrink-0" />
                          )}
                          <span>{child.label}</span>
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <NavLink
                key={item.to}
                to={item.to!}
                end={item.to === "/"}
                onClick={() => setMobileOpen(false)}
                className={() =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive(item.to!)
                      ? "sidebar-active-glow text-primary bg-primary/10"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                  } ${collapsed ? "justify-center" : ""}`
                }
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          {!collapsed && (
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
              v1.0.0 · TrackVault
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-gradient-main bg-grid-pattern relative">
        {/* Decorative particles */}
        <div className="particle" style={{ top: "10%", left: "20%", animationDelay: "0s" }} />
        <div className="particle" style={{ top: "30%", right: "15%", animationDelay: "2s" }} />
        <div className="particle" style={{ top: "60%", left: "40%", animationDelay: "4s" }} />
        <div className="particle" style={{ top: "80%", right: "30%", animationDelay: "6s" }} />

        <header className="flex items-center h-16 px-4 md:px-6 border-b border-border/50 shrink-0 backdrop-blur-sm bg-background/30 z-10">
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden mr-3 p-1.5 rounded-md hover:bg-muted text-foreground"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">
            {(() => {
              if (location.pathname === "/") return "Dashboard";
              if (location.pathname === "/assets/add") return "Register New Asset";
              if (location.pathname.startsWith("/assets")) return "Asset Management";
              if (location.pathname.startsWith("/assignments")) return "Assignments & Transfers";
              if (location.pathname.startsWith("/maintenance")) return "Maintenance";
              if (location.pathname.startsWith("/billing")) return "Billing & Charging";
              if (location.pathname.startsWith("/reports")) return "Reports";
              if (location.pathname.startsWith("/settings")) return "Settings";
              return "TrackVault";
            })()}
          </h1>
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-6 z-10">{children}</div>
      </main>
    </div>
  );
}