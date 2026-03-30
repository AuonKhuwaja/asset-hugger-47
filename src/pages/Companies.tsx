import { useAuth } from "@/contexts/AuthContext";
import { Building2, Users, Package, MapPin } from "lucide-react";

export default function Companies() {
  const { getVisibleCompanies, isSuperAdmin } = useAuth();
  const visibleCompanies = getVisibleCompanies();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Companies</h2>
        {isSuperAdmin && (
          <span className="px-3 py-1 rounded-full bg-secondary/15 border border-secondary/25 text-xs font-bold text-secondary">
            Super Admin — All Companies
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {visibleCompanies.map(company => (
          <div key={company.id} className="vision-card vision-card-hover p-6 animate-scale-in">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 icon-glow-purple flex items-center justify-center shrink-0">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-foreground">{company.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{company.industry}</p>
                <div className="flex items-center gap-4 mt-3">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Package className="w-3.5 h-3.5 text-primary" /> {company.assetCount} assets
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="w-3.5 h-3.5 text-secondary" /> {company.employeeCount} employees
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5 text-warning" /> {company.location}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {visibleCompanies.length === 0 && (
        <div className="vision-card p-8 text-center">
          <p className="text-muted-foreground">No companies assigned to your account.</p>
        </div>
      )}
    </div>
  );
}
