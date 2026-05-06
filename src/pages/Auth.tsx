import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, Building2, ChevronRight, ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const mockCompanies = [
  { slug: "techcorp", name: "TechCorp Pvt Ltd", initials: "TC", color: "#2563EB" },
  { slug: "retailplus", name: "RetailPlus", initials: "RP", color: "#7C3AED" },
  { slug: "assetflow", name: "AssetFlow Demo", initials: "AF", color: "#059669" },
  { slug: "nexatech", name: "NexaTech Solutions", initials: "NT", color: "#DC2626" },
  { slug: "globalassets", name: "Global Assets Inc", initials: "GA", color: "#D97706" },
];

const Auth = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [companyCode, setCompanyCode] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<typeof mockCompanies[0] | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [companyError, setCompanyError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleCompanyContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyCode.trim()) { setCompanyError("Please enter a company PIN"); return; }
    setLoading(true);
    setCompanyError("");
    setTimeout(() => {
      const found = mockCompanies.find((c) => c.slug === companyCode.trim().toLowerCase());
      setLoading(false);
      if (found) {
        setSelectedCompany(found);
        setStep(2);
      } else {
        setCompanyError("Invalid Company PIN. Try: techcorp, retailplus, assetflow, nexatech, globalassets");
      }
    }, 600);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { toast.error("Please enter your email"); return; }
    if (!password.trim() || password.length < 3) { toast.error("Please enter a password"); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const userName = email.split("@")[0];
      if (selectedCompany) {
        localStorage.setItem("selectedCompany", selectedCompany.slug);
        localStorage.setItem("companyName", selectedCompany.name);
        localStorage.setItem("companyInitials", selectedCompany.initials);
        localStorage.setItem("companyColor", selectedCompany.color);
      }
      localStorage.setItem("userName", userName);

      const success = login(email, password);
      if (success) {
        const stored = JSON.parse(localStorage.getItem("tv_user") || "{}");
        toast.success("Signed in successfully!");
        if (stored.role === "super_admin") {
          localStorage.setItem("role", "superadmin");
          navigate("/super-admin/companies");
        } else {
          navigate("/dashboard");
        }
      } else {
        // Demo fallback
        const demoUser = {
          email, name: userName, role: "admin" as any,
          phone: "", department: "General",
          assignedCompanies: ["comp1", "comp2", "comp3"],
        };
        localStorage.setItem("tv_user", JSON.stringify(demoUser));
        localStorage.setItem("userRole", "admin");
        toast.success("Signed in successfully!");
        window.location.href = "/dashboard";
      }
    }, 700);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 mb-4">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">TrackVault</h1>
          <p className="text-sm text-slate-500 mt-1">Asset Intelligence Platform</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 p-7">
          {/* Stepper */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className={`flex items-center gap-2 ${step === 1 ? "text-blue-600" : "text-slate-400"}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step === 1 ? "bg-blue-600 text-white" : "bg-slate-100"}`}>1</div>
              <span className="text-xs font-medium hidden sm:inline">Company</span>
            </div>
            <div className={`w-10 h-px ${step === 2 ? "bg-blue-600" : "bg-slate-200"}`} />
            <div className={`flex items-center gap-2 ${step === 2 ? "text-blue-600" : "text-slate-400"}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step === 2 ? "bg-blue-600 text-white" : "bg-slate-100"}`}>2</div>
              <span className="text-xs font-medium hidden sm:inline">Sign In</span>
            </div>
          </div>

          {step === 1 ? (
            <div>
              <div className="text-center mb-6">
                <h2 className="text-lg font-semibold text-slate-900">Welcome back</h2>
                <p className="text-sm text-slate-500 mt-1">Enter your Company PIN to continue</p>
              </div>

              <form onSubmit={handleCompanyContinue} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-700">Company PIN</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="e.g. techcorp"
                      value={companyCode}
                      onChange={(e) => { setCompanyCode(e.target.value); setCompanyError(""); }}
                      className="pl-10 h-11 bg-slate-50 border-slate-200 text-slate-900 rounded-lg focus-visible:ring-blue-500"
                      autoFocus
                    />
                  </div>
                  {companyError && <p className="text-xs text-red-500">{companyError}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {loading ? "Verifying..." : "Continue"}
                  {!loading && <ChevronRight className="w-4 h-4" />}
                </button>
              </form>

              <div className="mt-5 p-3 rounded-lg bg-blue-50 border border-blue-100">
                <p className="text-xs text-blue-700 font-medium">
                  Test PINs: techcorp · retailplus · assetflow · nexatech · globalassets
                </p>
              </div>
            </div>
          ) : (
            <div>
              <div className="text-center mb-6">
                <div
                  className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold text-lg shadow-md"
                  style={{ backgroundColor: selectedCompany?.color }}
                >
                  {selectedCompany?.initials}
                </div>
                <h2 className="text-lg font-semibold text-slate-900">{selectedCompany?.name}</h2>
                <button
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1 mt-2 text-xs text-blue-600 hover:text-blue-700"
                >
                  <ArrowLeft className="w-3 h-3" />
                  Change company
                </button>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-700">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-11 bg-slate-50 border-slate-200 text-slate-900 rounded-lg focus-visible:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-700">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-11 bg-slate-50 border-slate-200 text-slate-900 rounded-lg focus-visible:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </form>

              <div className="mt-5 p-3 rounded-lg bg-slate-50 border border-slate-100">
                <p className="text-xs text-slate-600 font-medium mb-1">Test accounts:</p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  superadmin@trackvault.com / super123<br />
                  admin@trackvault.com / admin123<br />
                  viewer@trackvault.com / viewer123<br />
                  employee@trackvault.com / emp123
                </p>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          © 2026 TrackVault · Unified login for all roles
        </p>
      </div>
    </div>
  );
};

export default Auth;
