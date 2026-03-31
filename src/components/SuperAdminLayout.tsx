import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogOut, Shield } from "lucide-react";

export default function SuperAdminLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("role") !== "superadmin") {
      navigate("/super-admin/login", { replace: true });
    }
  }, [navigate]);

  const userName = localStorage.getItem("userName") || "Super Admin";

  const handleLogout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("userName");
    navigate("/super-admin/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="flex h-14 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-destructive" />
            <span className="font-bold text-lg text-foreground">AssetFlow</span>
            <Badge variant="destructive" className="text-xs">Super Admin</Badge>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">{userName}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}
