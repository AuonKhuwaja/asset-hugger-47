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
  ChevronDown,
  Menu,
  QrCode,
  Search,
  Bell,
  User,
  Star,
  ChevronRight,
  X,
} from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  {
    label: "Assets",
    icon: Package,
    children: [
      { to: "/assets", label: "All Assets", icon: Package },
      { to: "/assets/add", label: "Add Asset", icon: PackagePlus },
    ],
  },
  { to: "/assignments", icon: ArrowLeftRight, label: "Assignments" },
  { to: "/maintenance", icon: Wrench, label: "Maintenance" },
  { to: "/billing", icon: Receipt, label: "Billing & Charging" },
  { to: "/reports", icon: BarChart3, label: "Reports" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

function getBreadcrumbs(pathname: string) {
  const crumbs = [{ label: "Home", path: "/" }];
  if (pathname === "/") {
    crumbs.push({ label: "Dashboard", path: "/" });
  } else if (pathname === "/assets") {
    crumbs.push({ label: "Assets", path: "/assets" });
  } else if (pathname === "/assets/add") {
    crumbs.push({ label: "Assets", path: "/assets" });
    crumbs.push({ label: "Add Asset", path: "/assets/add" });
  } else if (pathname.startsWith("/assignments")) {
    crumbs.push({ label: "Assignments", path: "/assignments" });
  } else if (pathname.startsWith("/maintenance")) {
    crumbs.push({ label: "Maintenance", path: "/maintenance" });
  } else if (pathname.startsWith("/billing")) {
    crumbs.push({ label: "Billing", path: "/billing" });
  } else if (pathname.startsWith("/reports")) {
    crumbs.push({ label: "Reports", path: "/reports" });
  } else if (pathname.startsWith("/settings")) {
    crumbs.push({ label: "Settings", path: "/settings" });
  }
  return crumbs;
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [assetsOpen, setAssetsOpen] = useState(true);
  const location = useLocation();
  const breadcrumbs = getBreadcrumbs(location.pathname);

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`fixed z-40 md:relative flex flex-col h-full w-[280px] bg-sidebar-vision border-r border-sidebar-border transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Left accent line */}
        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-primary/60 via-secondary/40 to-transparent" />

        {/* Logo */}
        <div className="flex items-center justify-between h-[72px] px-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 icon-glow flex items-center justify-center">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <span className="text-[17px] font-bold text-foreground tracking-tight">
              TRACK<span className="text-primary">VAULT</span>
            </span>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1 rounded-lg hover:bg-sidebar-accent text-muted-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 mb-3">
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            if ("children" in item && item.children) {
              const isChildActive = item.children.some((c) => location.pathname === c.to);
              return (
                <div key={item.label}>
                  <button
                    onClick={() => setAssetsOpen(!assetsOpen)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      isChildActive
                        ? "sidebar-active text-foreground"
                        : "text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent/40"
                    }`}
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    <span className="flex-1 text-left">{item.label}</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${assetsOpen ? "" : "-rotate-90"}`}
                    />
                  </button>
                  {assetsOpen && (
                    <div className="ml-6 mt-1 space-y-0.5 border-l border-border/30 pl-4">
                      {item.children.map((child) => (
                        <NavLink
                          key={child.to}
                          to={child.to}
                          end
                          onClick={() => setMobileOpen(false)}
                          className={() =>
                            `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all ${
                              location.pathname === child.to
                                ? "sidebar-active text-foreground font-semibold"
                                : "text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent/30"
                            }`
                          }
                        >
                          <child.icon className="w-4 h-4 shrink-0" />
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
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive(item.to!)
                      ? "sidebar-active text-foreground"
                      : "text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent/40"
                  }`
                }
              >
                <item.icon className="w-5 h-5 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Help Widget */}
        <div className="p-4">
          <div className="help-card-gradient p-5 text-center">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
              <Star className="w-5 h-5 text-white" />
            </div>
            <p className="text-white font-semibold text-sm mb-1">Need Help?</p>
            <p className="text-white/70 text-xs mb-3">Check our documentation</p>
            <button className="w-full px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-semibold hover:bg-white/20 transition-colors">
              Documentation
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 flex flex-col overflow-hidden bg-vision relative">
        {/* Top Navbar */}
        <header className="navbar-glass flex items-center justify-between h-[72px] px-4 md:px-8 shrink-0 z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-xl hover:bg-muted/30 text-foreground"
            >
              <Menu className="w-5 h-5" />
            </button>
            {/* Breadcrumbs */}
            <nav className="hidden sm:flex items-center gap-1.5 text-sm">
              {breadcrumbs.map((crumb, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />}
                  <span className={i === breadcrumbs.length - 1 ? "text-foreground font-medium" : "text-muted-foreground"}>
                    {crumb.label}
                  </span>
                </span>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="hidden md:flex relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                className="w-56 pl-9 pr-4 py-2 rounded-full bg-muted/30 border border-border/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
            </div>
            {/* Notifications */}
            <button className="relative p-2.5 rounded-xl hover:bg-muted/30 transition-colors">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
            </button>
            {/* Settings */}
            <button className="p-2.5 rounded-xl hover:bg-muted/30 transition-colors">
              <Settings className="w-5 h-5 text-muted-foreground" />
            </button>
            {/* Sign In */}
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm font-semibold hover:bg-primary/20 transition-colors">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 z-10 animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}