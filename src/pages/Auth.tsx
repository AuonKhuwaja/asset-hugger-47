import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, Zap, ChevronRight, Building2, ArrowLeft, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import authBg1 from "@/assets/auth-bg-1.jpg";
import authBg2 from "@/assets/auth-bg-2.jpg";
import authBg3 from "@/assets/auth-bg-3.jpg";
import authBg4 from "@/assets/auth-bg-4.jpg";

const mockCompanies = [
  { slug: "techcorp", name: "TechCorp Pvt Ltd", initials: "TC", color: "#2563EB" },
  { slug: "retailplus", name: "RetailPlus", initials: "RP", color: "#7C3AED" },
  { slug: "assetflow", name: "AssetFlow Demo", initials: "AF", color: "#059669" },
  { slug: "nexatech", name: "NexaTech Solutions", initials: "NT", color: "#DC2626" },
  { slug: "globalassets", name: "Global Assets Inc", initials: "GA", color: "#D97706" },
];

const authBgs = [authBg1, authBg2, authBg3, authBg4];

const Auth = () => {
  const [bgIndex, setBgIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setBgIndex(i => (i + 1) % 4), 5000);
    return () => clearInterval(interval);
  }, []);
  const [isSuperAdminMode, setIsSuperAdminMode] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [companyCode, setCompanyCode] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<typeof mockCompanies[0] | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [companyError, setCompanyError] = useState("");
  const [animating, setAnimating] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleCompanyContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyCode.trim()) { setCompanyError("Please enter a company code"); return; }
    setLoading(true);
    setCompanyError("");
    setTimeout(() => {
      const found = mockCompanies.find((c) => c.slug === companyCode.trim().toLowerCase());
      setLoading(false);
      if (found) {
        setSelectedCompany(found);
        setAnimating(true);
        setTimeout(() => { setStep(2); setAnimating(false); }, 50);
      } else {
        setCompanyError("Company not found. Try: techcorp, retailplus, assetflow, nexatech, globalassets");
      }
    }, 800);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { toast.error("Please enter your email"); return; }
    if (!password.trim() || password.length < 3) { toast.error("Please enter a password"); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const userName = email.split("@")[0];
      if (selectedCompany && !isSuperAdminMode) {
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
        // Demo fallback — Super Admin mode forces super_admin role
        const role = isSuperAdminMode ? "super_admin" : "admin";
        const demoUser = {
          email, name: userName, role: role as any,
          phone: "", department: "General",
          assignedCompanies: ["comp1", "comp2", "comp3"],
        };
        localStorage.setItem("tv_user", JSON.stringify(demoUser));
        localStorage.setItem("userRole", role);
        toast.success("Signed in successfully!");
        if (isSuperAdminMode) {
          localStorage.setItem("role", "superadmin");
          window.location.href = "/super-admin/companies";
        } else {
          window.location.href = "/dashboard";
        }
      }
    }, 800);
  };

  const goBackToStep1 = () => {
    setAnimating(true);
    setTimeout(() => { setStep(1); setAnimating(false); }, 50);
  };

  return (
    <div className="h-screen flex bg-[hsl(222,47%,7%)] overflow-hidden">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden flex-col justify-between p-10">
        {/* Rotating background images */}
        {[authBg1, authBg2, authBg3, authBg4].map((bg, i) => (
          <img
            key={i}
            src={bg}
            alt=""
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
            style={{ opacity: bgIndex === i ? 1 : 0 }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(213,80%,10%,0.7)] via-[hsl(230,50%,8%,0.6)] to-[hsl(250,40%,5%,0.8)]" />

        {/* Top branding */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(213,80%,57%)] to-[hsl(258,80%,50%)] flex items-center justify-center shadow-[0_0_20px_hsl(213,80%,57%,0.4)]">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-wider text-white drop-shadow-lg">TRACKVAULT</span>
          </div>
          <p className="text-xs tracking-[0.3em] uppercase text-[hsl(213,80%,80%,0.7)] font-medium">Asset Intelligence Platform</p>
        </div>

        <div className="relative z-10 max-w-md mt-2">
          <p className="text-[hsl(213,30%,90%)] text-base leading-relaxed drop-shadow-sm text-left">
            Real-time equipment tracking, smart maintenance scheduling, and intelligent asset management — all in one platform.
          </p>
        </div>

        <div className="relative z-10 flex gap-6">
          {[
            { value: "1.2K+", label: "ASSETS TRACKED" },
            { value: "99.9%", label: "UPTIME" },
            { value: "50+", label: "DEPARTMENTS" },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-start">
              <p className="text-3xl font-bold -mb-1 text-transparent bg-clip-text bg-gradient-to-r from-[hsl(213,80%,65%)] to-[hsl(258,80%,60%)]">
                {stat.value}
              </p>
              <p className="text-[10px] tracking-[0.15em] text-[hsl(213,40%,75%,0.7)] font-medium">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-[45%] relative flex items-center justify-center p-6 sm:p-10 overflow-y-auto">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 45% at 30% 10%, hsla(215, 100%, 58%, 0.22) 0%, transparent 100%),
              radial-gradient(ellipse 75% 50% at 75% 88%, hsla(270, 80%, 56%, 0.28) 0%, transparent 100%),
              radial-gradient(ellipse 90% 90% at 50% 50%, transparent 50%, hsla(245, 60%, 3%, 0.5) 100%)
            `,
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        <div className="relative z-10 w-full max-w-md">
          {/* Mobile branding */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(215,90%,60%)] to-[hsl(270,80%,60%)] flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-wider text-white">TRACKVAULT</span>
          </div>

          {/* Step content with CSS fade transition */}
          <div
            className="transition-all duration-300 ease-out"
            style={{
              opacity: animating ? 0 : 1,
              transform: animating ? "translateY(12px)" : "translateY(0)",
            }}
          >
            {step === 1 && !isSuperAdminMode ? (
              /* STEP 1 — Company Code */
              <div>
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold text-white mb-1">Welcome</h1>
                  <p className="text-sm text-[hsl(215,20%,50%)]">Enter your company code to get started</p>
                </div>

                <form onSubmit={handleCompanyContinue} className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase text-[hsl(215,20%,45%)]">
                      Company Code
                    </Label>
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(215,20%,40%)]" />
                      <Input
                        type="text"
                        placeholder="e.g. techcorp"
                        value={companyCode}
                        onChange={(e) => { setCompanyCode(e.target.value); setCompanyError(""); }}
                        className="pl-11 h-12 bg-[hsl(223,37%,13%)] border-[hsl(222,20%,20%)] text-white rounded-xl"
                      />
                    </div>
                    <p className="text-xs text-[hsl(215,20%,40%)]">Provided by your administrator</p>
                    {companyError && (
                      <p className="text-xs text-red-400 mt-1">{companyError}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="relative w-full h-12 rounded-xl overflow-hidden text-sm font-semibold text-white
                      bg-gradient-to-r from-[hsl(215,90%,60%)] to-[hsl(270,80%,60%)]
                      shadow-lg shadow-[hsl(215,90%,60%,0.25)] transition-all duration-300 group disabled:opacity-70"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent
                      translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      {loading ? "Verifying..." : "Continue"}
                      {!loading && <ChevronRight className="w-4 h-4" />}
                    </span>
                  </button>
                </form>

                <div className="mt-5 text-center">
                  <button
                    type="button"
                    onClick={() => { setIsSuperAdminMode(true); setCompanyError(""); }}
                    className="text-xs font-medium text-[hsl(215,90%,70%)] hover:text-white underline-offset-4 hover:underline transition-colors"
                  >
                    Are you a Super Admin?
                  </button>
                </div>

                <div className="mt-6 p-3 rounded-xl border border-[hsl(215,90%,60%,0.2)] bg-[hsl(215,90%,60%,0.06)]">
                  <p className="text-xs text-[hsl(215,90%,70%)] font-medium">
                    Test codes: techcorp · retailplus · assetflow · nexatech · globalassets
                  </p>
                </div>
              </div>
            ) : isSuperAdminMode ? (
              /* SUPER ADMIN — Login (no company PIN) */
              <div>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center bg-gradient-to-br from-red-600 to-red-800 shadow-[0_0_20px_hsl(0,80%,50%,0.4)]">
                    <Lock className="w-7 h-7 text-white" />
                  </div>
                  <span className="inline-block px-3 py-1 rounded-full bg-red-600/20 border border-red-600/30 text-xs font-bold text-red-400 mb-2">
                    Super Admin
                  </span>
                  <h2 className="text-lg font-bold text-white">Sign in to manage all companies</h2>
                  <button
                    onClick={() => setIsSuperAdminMode(false)}
                    type="button"
                    className="inline-flex items-center gap-1 mt-2 text-xs text-[hsl(215,90%,70%)] hover:text-white transition-colors"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    Back to standard sign in
                  </button>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase text-[hsl(215,20%,45%)]">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(215,20%,40%)]" />
                      <Input type="email" placeholder="superadmin@trackvault.com" value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-11 h-12 bg-[hsl(223,37%,13%)] border-[hsl(222,20%,20%)] text-white rounded-xl" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase text-[hsl(215,20%,45%)]">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(215,20%,40%)]" />
                      <Input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-11 pr-11 h-12 bg-[hsl(223,37%,13%)] border-[hsl(222,20%,20%)] text-white rounded-xl" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[hsl(215,20%,40%)] hover:text-white">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" disabled={loading}
                    className="relative w-full h-12 rounded-xl overflow-hidden text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-red-800 shadow-lg shadow-red-600/25 transition-all duration-300 group disabled:opacity-70">
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      {loading ? "Signing in..." : "Sign In as Super Admin"}
                    </span>
                  </button>
                </form>

                <div className="mt-6 p-3 rounded-xl border border-red-600/20 bg-red-600/10">
                  <p className="text-xs text-red-300/80 font-medium">
                    Test: superadmin@trackvault.com / super123
                  </p>
                </div>
              </div>
            ) : (
              /* STEP 2 — Login */
              <div>
                {/* Company header */}
                <div className="text-center mb-6">
                  <div
                    className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold text-xl"
                    style={{ backgroundColor: selectedCompany?.color }}
                  >
                    {selectedCompany?.initials}
                  </div>
                  <h2 className="text-lg font-bold text-white">{selectedCompany?.name}</h2>
                  <button
                    onClick={goBackToStep1}
                    className="inline-flex items-center gap-1 mt-2 text-xs text-[hsl(215,90%,70%)] hover:text-white transition-colors"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    Change company
                  </button>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                  {/* Email */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase text-[hsl(215,20%,45%)]">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(215,20%,40%)]" />
                      <Input
                        type="email"
                        placeholder="you@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-11 h-12 bg-[hsl(223,37%,13%)] border-[hsl(222,20%,20%)] text-white rounded-xl"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase text-[hsl(215,20%,45%)]">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(215,20%,40%)]" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-11 pr-11 h-12 bg-[hsl(223,37%,13%)] border-[hsl(222,20%,20%)] text-white rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[hsl(215,20%,40%)] hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="relative w-full h-12 rounded-xl overflow-hidden text-sm font-semibold text-white
                      bg-gradient-to-r from-[hsl(215,90%,60%)] to-[hsl(270,80%,60%)]
                      shadow-lg shadow-[hsl(215,90%,60%,0.25)] transition-all duration-300 group disabled:opacity-70"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent
                      translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      {loading ? "Signing in..." : "Sign In"}
                      {!loading && <ChevronRight className="w-4 h-4" />}
                    </span>
                  </button>
                </form>

                <div className="mt-6 p-3 rounded-xl border border-[hsl(215,90%,60%,0.2)] bg-[hsl(215,90%,60%,0.06)]">
                  <p className="text-xs text-[hsl(215,90%,70%)] font-medium">
                    Demo mode: any email & password will work
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
