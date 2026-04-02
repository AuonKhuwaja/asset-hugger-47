import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Shield, Loader2, Lock, Mail, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import authBg1 from "@/assets/auth-bg-1.jpg";
import authBg2 from "@/assets/auth-bg-2.jpg";
import authBg3 from "@/assets/auth-bg-3.jpg";
import authBg4 from "@/assets/auth-bg-4.jpg";

export default function SuperAdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setBgIndex(i => (i + 1) % 4), 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (localStorage.getItem("role") === "superadmin") {
      navigate("/super-admin/companies", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      if (email === "superadmin@trackvault.com" && password === "superadmin123") {
        localStorage.setItem("role", "superadmin");
        localStorage.setItem("userName", "Super Admin");
        navigate("/super-admin/companies", { replace: true });
      } else {
        setError("Invalid credentials");
      }
      setLoading(false);
    }, 1000);
  };

  const authBgs = [authBg1, authBg2, authBg3, authBg4];

  return (
    <div className="h-screen flex bg-[hsl(222,47%,7%)] overflow-hidden">
      {/* Left Panel — same as Auth page */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden flex-col justify-between p-10">
        {authBgs.map((bg, i) => (
          <img
            key={i}
            src={bg}
            alt=""
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
            style={{ opacity: bgIndex === i ? 1 : 0 }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(213,80%,10%,0.7)] via-[hsl(230,50%,8%,0.6)] to-[hsl(250,40%,5%,0.8)]" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-[0_0_20px_hsl(0,80%,50%,0.4)]">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-wider text-white drop-shadow-lg">TRACKVAULT</span>
          </div>
          <p className="text-xs tracking-[0.3em] uppercase text-red-300/70 font-medium">Super Admin Portal</p>
        </div>

        <div className="relative z-10 max-w-md mt-2">
          <p className="text-[hsl(213,30%,90%)] text-base leading-relaxed drop-shadow-sm text-left">
            Manage all companies, users, and system-wide settings from the Super Admin control panel.
          </p>
        </div>

        <div className="relative z-10 flex gap-6">
          {[
            { value: "5", label: "COMPANIES" },
            { value: "100%", label: "CONTROL" },
            { value: "24/7", label: "MONITORING" },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-start">
              <p className="text-3xl font-bold -mb-1 text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">
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
              radial-gradient(ellipse 80% 45% at 30% 10%, hsla(0, 80%, 40%, 0.22) 0%, transparent 100%),
              radial-gradient(ellipse 75% 50% at 75% 88%, hsla(0, 60%, 30%, 0.28) 0%, transparent 100%),
              radial-gradient(ellipse 90% 90% at 50% 50%, transparent 50%, hsla(245, 60%, 3%, 0.5) 100%)
            `,
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        <div className="relative z-10 w-full max-w-md">
          {/* Mobile branding */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-wider text-white">TRACKVAULT</span>
          </div>

          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-red-600/20 flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-red-400" />
            </div>
            <span className="inline-block px-3 py-1 rounded-full bg-red-600/20 border border-red-600/30 text-xs font-bold text-red-400 mb-3">
              Super Admin
            </span>
            <h1 className="text-2xl font-bold text-white mb-1">Admin Portal</h1>
            <p className="text-sm text-[hsl(215,20%,50%)]">Sign in to manage all companies</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase text-[hsl(215,20%,45%)]">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(215,20%,40%)]" />
                <Input
                  type="email"
                  placeholder="superadmin@trackvault.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  required
                  className="pl-11 h-12 bg-[hsl(223,37%,13%)] border-[hsl(222,20%,20%)] text-white rounded-xl"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase text-[hsl(215,20%,45%)]">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(215,20%,40%)]" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  required
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

            {error && (
              <p className="text-sm text-red-400 text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="relative w-full h-12 rounded-xl overflow-hidden text-sm font-semibold text-white
                bg-gradient-to-r from-red-600 to-red-800
                shadow-lg shadow-red-600/25 transition-all duration-300 group disabled:opacity-70"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent
                translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {loading ? "Signing In..." : "Sign In"}
              </span>
            </button>
          </form>

          <div className="mt-6 p-3 rounded-xl border border-red-600/20 bg-red-600/6">
            <p className="text-xs text-red-300/70 font-medium">
              Credentials: superadmin@trackvault.com / superadmin123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
