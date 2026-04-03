import { NavLink as RouterNavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Users,
  Wrench,
  Receipt,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Menu,
  QrCode,
  Search,
  Bell,
  X,
  LogOut,
  FolderOpen,
  Building2,
  UserCog,
  UserPlus,
  Upload,
  Clock,
  History,
  FileText,
  DollarSign,
  ShoppingBag,
  Send,
  AlertTriangle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";

interface NavChild {
  to: string;
  label: string;
  icon: any;
}

interface NavItem {
  to?: string;
  icon: any;
  label: string;
  children?: NavChild[];
}

const getNavItems = (isAdmin: boolean, isEmployee: boolean): NavItem[] => {
  if (isEmployee) {
    return [
      { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { to: "/my-assets", icon: Package, label: "My Assets" },
      { to: "/asset-requests", icon: Send, label: "Asset Requests" },
      { to: "/maintenance-requests", icon: AlertTriangle, label: "Maintenance Requests" },
      { to: "/profile", icon: UserCog, label: "My Profile" },
    ];
  }

  return [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    {
      label: "Assets",
      icon: Package,
      children: [
        { to: "/assets", label: "All Assets", icon: Package },
      ],
    },
    ...(isAdmin ? [{ to: "/categories", label: "Categories", icon: FolderOpen }] : []),
    { to: "/vendors", label: "Vendors", icon: ShoppingBag },
    ...(isAdmin ? [{
      label: "Employees",
      icon: Users,
      to: "/employees",
    }] : []),
    ...(isAdmin ? [{
      label: "Departments",
      icon: Building2,
      to: "/departments",
    }] : []),
    ...(isAdmin ? [{
      label: "Assignments",
      icon: UserPlus,
      to: "/assignments",
    }] : []),
    {
      label: "Maintenance",
      icon: Wrench,
      children: [
        { to: "/maintenance", label: "Schedule", icon: Clock },
        { to: "/maintenance?tab=history", label: "History", icon: History },
      ],
    },
    {
      label: "Cost & Billing",
      icon: Receipt,
      children: [
        { to: "/billing", label: "Cost Entries", icon: DollarSign },
        { to: "/reports", label: "Reports", icon: FileText },
      ],
    },
    { to: "/profile", icon: UserCog, label: "My Profile" },
    { to: "/settings", icon: Settings, label: "Settings" },
  ];
};

function getBreadcrumbs(pathname: string) {
  const crumbs = [{ label: "Home", path: "/dashboard" }];
  if (pathname === "/dashboard") crumbs.push({ label: "Dashboard", path: "/dashboard" });
  else if (pathname === "/assets") crumbs.push({ label: "Assets", path: "/assets" });
  else if (pathname === "/assets/add") { crumbs.push({ label: "Assets", path: "/assets" }); crumbs.push({ label: "Add Asset", path: "/assets/add" }); }
  else if (pathname.startsWith("/employees")) crumbs.push({ label: "Employees", path: "/employees" });
  else if (pathname.startsWith("/assignments")) crumbs.push({ label: "Assignments", path: "/assignments" });
  else if (pathname.startsWith("/maintenance")) crumbs.push({ label: "Maintenance", path: "/maintenance" });
  else if (pathname.startsWith("/billing")) crumbs.push({ label: "Billing", path: "/billing" });
  else if (pathname.startsWith("/reports")) crumbs.push({ label: "Reports", path: "/reports" });
  else if (pathname.startsWith("/settings")) crumbs.push({ label: "Settings", path: "/settings" });
  else if (pathname.startsWith("/categories")) crumbs.push({ label: "Categories", path: "/categories" });
  else if (pathname.startsWith("/profile")) crumbs.push({ label: "Profile", path: "/profile" });
  else if (pathname.startsWith("/vendors")) crumbs.push({ label: "Vendors", path: "/vendors" });
  else if (pathname.startsWith("/companies")) crumbs.push({ label: "Companies", path: "/companies" });
  return crumbs;
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    return saved === "true";
  });
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin, isSuperAdmin, isEmployee } = useAuth();
  const navItems = getNavItems(isAdmin, isEmployee);
  const breadcrumbs = getBreadcrumbs(location.pathname);

  // Company info from localStorage
  const companyName = localStorage.getItem("companyName") || "AssetFlow";
  const companyInitials = localStorage.getItem("companyInitials") || "AF";
  const companyColor = localStorage.getItem("companyColor") || "#2563EB";

  const userName = user?.name || localStorage.getItem("userName") || "User";
  const userRole = user?.role || localStorage.getItem("userRole") || "admin";

  // Auto-expand parent if child is active
  useEffect(() => {
    const newOpen: Record<string, boolean> = {};
    navItems.forEach((item) => {
      if (item.children) {
        const isChildActive = item.children.some((c) => location.pathname === c.to || location.pathname + location.search === c.to);
        if (isChildActive) newOpen[item.label] = true;
      }
    });
    setOpenMenus((prev) => ({ ...prev, ...newOpen }));
  }, [location.pathname, location.search]);

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("sidebarCollapsed", String(next));
  };

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isActive = (path: string) => {
    if (path.includes("?")) return location.pathname + location.search === path;
    return path === "/dashboard" ? location.pathname === "/dashboard" : location.pathname === path;
  };

  const isParentActive = (item: NavItem) => {
    if (!item.children) return false;
    return item.children.some((c) => isActive(c.to));
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem("tv_user");
    localStorage.removeItem("selectedCompany");
    localStorage.removeItem("companyName");
    localStorage.removeItem("companyInitials");
    localStorage.removeItem("companyColor");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    navigate("/");
  };

  const sidebarWidth = collapsed ? "w-16" : "w-60";

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed z-40 md:relative flex flex-col h-full ${sidebarWidth} bg-sidebar-vision border-r border-sidebar-border transition-all duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Left accent line */}
        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-primary/60 via-secondary/40 to-transparent" />

        {/* Logo + Collapse toggle */}
        <div className="flex items-center justify-between h-[72px] px-3 shrink-0">
          <div className="flex items-center gap-2 overflow-hidden">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-xs"
              style={{ backgroundColor: companyColor }}
            >
              {companyInitials}
            </div>
            <span
              className={`text-[15px] font-bold text-foreground tracking-tight whitespace-nowrap transition-all duration-300 ${
                collapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
              }`}
            >
              {companyName}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden p-1 rounded-lg hover:bg-sidebar-accent text-muted-foreground"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              onClick={toggleCollapsed}
              className="hidden md:flex p-1.5 rounded-lg hover:bg-sidebar-accent text-muted-foreground transition-colors"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="px-3 mb-2">
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => {
            // Single-child menus: render as direct link without arrow
            if (item.children && item.children.length === 1) {
              const child = item.children[0];
              return (
                <RouterNavLink
                  key={child.to}
                  to={child.to}
                  onClick={() => setMobileOpen(false)}
                  title={collapsed ? item.label : undefined}
                  className={() =>
                    `flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
                      isActive(child.to)
                        ? "bg-primary text-white"
                        : "text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent/40"
                    }`
                  }
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  <span className={`whitespace-nowrap transition-all duration-300 ${collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto"}`}>
                    {item.label}
                  </span>
                </RouterNavLink>
              );
            }

            if (item.children) {
              const parentActive = isParentActive(item);
              const menuOpen = openMenus[item.label] ?? false;

              return (
                <div key={item.label}>
                  <button
                    onClick={() => {
                      if (collapsed) {
                        // In collapsed mode, navigate to first child
                        navigate(item.children![0].to);
                      } else {
                        toggleMenu(item.label);
                      }
                    }}
                    title={collapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
                      parentActive
                        ? "bg-primary text-white"
                        : "text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent/40"
                    }`}
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    <span
                      className={`flex-1 text-left whitespace-nowrap transition-all duration-300 ${
                        collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto"
                      }`}
                    >
                      {item.label}
                    </span>
                    {!collapsed && (
                      menuOpen
                        ? <ChevronUp className="w-4 h-4 shrink-0 transition-transform duration-200" />
                        : <ChevronDown className="w-4 h-4 shrink-0 transition-transform duration-200" />
                    )}
                  </button>
                  {/* Submenu with smooth animation */}
                  {!collapsed && (
                    <div
                      className="overflow-hidden transition-all duration-300 ease-in-out"
                      style={{
                        maxHeight: menuOpen ? `${item.children!.length * 44}px` : "0px",
                        opacity: menuOpen ? 1 : 0,
                      }}
                    >
                      <div className="ml-5 mt-0.5 space-y-0.5 border-l-2 border-border/30 pl-3">
                        {item.children!.map((child) => {
                          const childActive = isActive(child.to);
                          return (
                            <RouterNavLink
                              key={child.to}
                              to={child.to}
                              onClick={() => setMobileOpen(false)}
                              className={`flex items-center gap-2 px-2.5 py-2 rounded-md text-sm transition-all duration-200 ${
                                childActive
                                  ? "border-l-2 border-primary bg-primary/10 text-foreground font-semibold -ml-[2px]"
                                  : "text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent/30"
                              }`}
                            >
                              <child.icon className="w-4 h-4 shrink-0" />
                              <span>{child.label}</span>
                            </RouterNavLink>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <RouterNavLink
                key={item.to}
                to={item.to!}
                end={item.to === "/dashboard"}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? item.label : undefined}
                className={() =>
                  `flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive(item.to!)
                      ? "bg-primary text-white"
                      : "text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent/40"
                  }`
                }
              >
                <item.icon className="w-5 h-5 shrink-0" />
                <span
                  className={`whitespace-nowrap transition-all duration-300 ${
                    collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto"
                  }`}
                >
                  {item.label}
                </span>
              </RouterNavLink>
            );
          })}
        </nav>

        {/* Bottom user section */}
        <div className="px-2 pb-3 pt-2 shrink-0">
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-2" />

          <div className={`flex items-center gap-2.5 px-2 py-2 rounded-lg ${collapsed ? "justify-center" : ""}`}>
            {/* Avatar */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-xs"
              style={{ backgroundColor: companyColor }}
              title={collapsed ? userName : undefined}
            >
              {userName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
            </div>

            {/* Name + role */}
            <div
              className={`flex-1 min-w-0 transition-all duration-300 ${
                collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto"
              }`}
            >
              <p className="text-sm font-semibold text-foreground truncate">{userName}</p>
              <span className="inline-block px-1.5 py-0.5 text-[10px] font-medium rounded bg-primary/15 text-primary capitalize">
                {userRole.replace("_", " ")}
              </span>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            title={collapsed ? "Logout" : undefined}
            className={`w-full flex items-center gap-2 mt-1 px-3 py-2 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span
              className={`whitespace-nowrap transition-all duration-300 ${
                collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto"
              }`}
            >
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* Main content */}
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
            <div className="hidden md:flex relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                className="w-56 pl-9 pr-4 py-2 rounded-full bg-muted/30 border border-border/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
            </div>
            <button className="relative p-2.5 rounded-xl hover:bg-muted/30 transition-colors">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
            </button>
            <ThemeToggle />
            <button className="p-2.5 rounded-xl hover:bg-muted/30 transition-colors">
              <Settings className="w-5 h-5 text-muted-foreground" />
            </button>
            <span className="hidden sm:inline text-sm text-muted-foreground font-medium">{userName}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-semibold hover:bg-destructive/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 z-10 animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
