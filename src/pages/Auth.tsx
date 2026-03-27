import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, User, Mail, Lock, Fingerprint, Shield, Zap, Monitor, QrCode, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp && !fullName.trim()) {
      toast.error("Please enter your full name");
      return;
    }
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }
    if (!password.trim() || password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    toast.success(isSignUp ? "Account created successfully!" : "Signed in successfully!");
    navigate("/");
  };

  return (
    <div className="min-h-screen flex bg-[hsl(222,47%,7%)]">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden flex-col justify-between p-10">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(222,47%,9%)] via-[hsl(224,40%,11%)] to-[hsl(230,35%,8%)]" />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(hsl(213 94% 58% / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(213 94% 58% / 0.3) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />

        {/* Floating holographic elements */}
        <div className="absolute top-16 right-20 w-64 h-44 rounded-2xl border border-[hsl(213,94%,58%,0.15)] bg-[hsl(213,94%,58%,0.03)] backdrop-blur-sm rotate-6 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(213,94%,58%,0.08)] to-transparent" />
          <Monitor className="w-16 h-16 text-[hsl(213,94%,58%,0.3)]" />
          <div className="absolute bottom-3 left-4 right-4">
            <div className="h-2 w-3/4 rounded bg-[hsl(213,94%,58%,0.15)] mb-1.5" />
            <div className="h-2 w-1/2 rounded bg-[hsl(258,90%,66%,0.15)]" />
          </div>
        </div>

        <div className="absolute top-40 right-48 w-36 h-36 rounded-xl border border-[hsl(258,90%,66%,0.2)] bg-[hsl(258,90%,66%,0.04)] backdrop-blur-sm -rotate-12 flex items-center justify-center">
          <QrCode className="w-14 h-14 text-[hsl(258,90%,66%,0.35)]" />
          <div className="absolute inset-4 border border-dashed border-[hsl(258,90%,66%,0.15)] rounded-lg" />
          {/* Scanning beam */}
          <div className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-[hsl(142,76%,50%,0.6)] to-transparent animate-pulse" style={{ top: '55%' }} />
        </div>

        <div className="absolute bottom-48 right-28 w-20 h-20 rounded-full border border-[hsl(142,76%,36%,0.2)] bg-[hsl(142,76%,36%,0.05)] flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-[hsl(142,76%,50%)] animate-pulse shadow-[0_0_12px_hsl(142,76%,50%,0.5)]" />
        </div>

        {/* Connection lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <line x1="45%" y1="25%" x2="65%" y2="45%" stroke="hsl(213,94%,58%,0.08)" strokeWidth="1" strokeDasharray="4 6" />
          <line x1="70%" y1="30%" x2="55%" y2="65%" stroke="hsl(258,90%,66%,0.06)" strokeWidth="1" strokeDasharray="4 6" />
          <line x1="50%" y1="70%" x2="70%" y2="50%" stroke="hsl(142,76%,36%,0.06)" strokeWidth="1" strokeDasharray="4 6" />
        </svg>

        {/* Glowing orb */}
        <div className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full bg-[hsl(213,94%,58%,0.06)] blur-[80px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48 rounded-full bg-[hsl(258,90%,66%,0.04)] blur-[60px] pointer-events-none" />

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(213,94%,58%)] to-[hsl(258,90%,66%)] flex items-center justify-center shadow-[0_0_20px_hsl(213,94%,58%,0.3)]">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-wider text-white">TRACKVAULT</span>
          </div>
          <p className="text-xs tracking-[0.3em] uppercase text-[hsl(215,20%,50%)] font-medium">Asset Intelligence Platform</p>
        </div>

        <div className="relative z-10 max-w-md">
          <p className="text-[hsl(215,20%,65%)] text-base leading-relaxed">
            Real-time equipment tracking, smart maintenance scheduling, and intelligent asset management — all in one platform.
          </p>
        </div>

        {/* Stats */}
        <div className="relative z-10 flex gap-8">
          {[
            { value: "1.2K+", label: "ASSETS TRACKED" },
            { value: "99.9%", label: "UPTIME" },
            { value: "50+", label: "DEPARTMENTS" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[hsl(213,94%,58%)] to-[hsl(258,90%,66%)]">
                {stat.value}
              </p>
              <p className="text-[10px] tracking-[0.2em] text-[hsl(215,20%,45%)] mt-1 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel — Auth Form */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(213,94%,58%)] to-[hsl(258,90%,66%)] flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold tracking-wider text-white">TRACKVAULT</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Get started</h1>
            <p className="text-sm text-[hsl(215,20%,50%)]">
              {isSignUp ? "Create your account to get started" : "Welcome back, sign in to continue"}
            </p>
          </div>

          {/* Toggle Tabs */}
          <div className="flex rounded-xl bg-[hsl(223,37%,13%)] p-1 mb-8 border border-[hsl(222,20%,20%)]">
            <button
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${
                !isSignUp
                  ? "bg-gradient-to-r from-[hsl(213,94%,58%)] to-[hsl(213,80%,50%)] text-white shadow-lg shadow-[hsl(213,94%,58%,0.25)]"
                  : "text-[hsl(215,20%,50%)] hover:text-[hsl(215,20%,65%)]"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${
                isSignUp
                  ? "bg-gradient-to-r from-[hsl(213,94%,58%)] to-[hsl(213,80%,50%)] text-white shadow-lg shadow-[hsl(213,94%,58%,0.25)]"
                  : "text-[hsl(215,20%,50%)] hover:text-[hsl(215,20%,65%)]"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && (
              <div className="space-y-2 animate-fade-in">
                <Label className="text-xs font-semibold tracking-widest uppercase text-[hsl(215,20%,45%)]">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(215,20%,40%)]" />
                  <Input
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-11 h-12 bg-[hsl(223,37%,13%)] border-[hsl(222,20%,20%)] text-white placeholder:text-[hsl(215,20%,35%)] rounded-xl focus:border-[hsl(213,94%,58%,0.5)] focus:ring-[hsl(213,94%,58%,0.2)] transition-all"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-xs font-semibold tracking-widest uppercase text-[hsl(215,20%,45%)]">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(215,20%,40%)]" />
                <Input
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11 h-12 bg-[hsl(223,37%,13%)] border-[hsl(222,20%,20%)] text-white placeholder:text-[hsl(215,20%,35%)] rounded-xl focus:border-[hsl(213,94%,58%,0.5)] focus:ring-[hsl(213,94%,58%,0.2)] transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold tracking-widest uppercase text-[hsl(215,20%,45%)]">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(215,20%,40%)]" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 pr-11 h-12 bg-[hsl(223,37%,13%)] border-[hsl(222,20%,20%)] text-white placeholder:text-[hsl(215,20%,35%)] rounded-xl focus:border-[hsl(213,94%,58%,0.5)] focus:ring-[hsl(213,94%,58%,0.2)] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[hsl(215,20%,40%)] hover:text-[hsl(215,20%,60%)] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-xl text-sm font-semibold bg-gradient-to-r from-[hsl(213,94%,58%)] to-[hsl(192,80%,50%)] hover:from-[hsl(213,94%,52%)] hover:to-[hsl(192,80%,44%)] text-white shadow-lg shadow-[hsl(213,94%,58%,0.25)] transition-all duration-300 hover:shadow-[hsl(213,94%,58%,0.35)]"
            >
              {isSignUp ? "Create Account" : "Sign In"}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-[hsl(222,20%,20%)]" />
            <span className="text-xs text-[hsl(215,20%,40%)] uppercase tracking-widest">or continue with</span>
            <div className="flex-1 h-px bg-[hsl(222,20%,20%)]" />
          </div>

          {/* Alt auth methods */}
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 h-12 rounded-xl border border-[hsl(222,20%,20%)] bg-[hsl(223,37%,13%)] text-sm text-[hsl(215,20%,60%)] hover:border-[hsl(213,94%,58%,0.3)] hover:text-white transition-all">
              <Fingerprint className="w-4 h-4" />
              Biometric
            </button>
            <button className="flex items-center justify-center gap-2 h-12 rounded-xl border border-[hsl(222,20%,20%)] bg-[hsl(223,37%,13%)] text-sm text-[hsl(215,20%,60%)] hover:border-[hsl(213,94%,58%,0.3)] hover:text-white transition-all">
              <Shield className="w-4 h-4" />
              SSO
            </button>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-[hsl(215,20%,35%)] mt-8 flex items-center justify-center gap-1.5">
            <Lock className="w-3 h-3" />
            Secured by 256-bit encryption · Enterprise grade
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
