import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, User, Mail, Lock, Fingerprint, Shield, Zap, ChevronRight, Laptop, Printer, Smartphone, Server, Wifi, HardDrive, Monitor, Tablet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

/* ── Floating asset node ── */
function FloatingNode({ icon: Icon, label, x, y, delay, size = 48 }: { icon: React.ElementType; label: string; x: string; y: string; delay: number; size?: number }) {
  return (
    <div
      className="absolute flex flex-col items-center gap-1.5 animate-float"
      style={{ left: x, top: y, animationDelay: `${delay}s`, animationDuration: "6s" }}
    >
      <div
        className="rounded-2xl border border-[hsl(213,94%,58%,0.2)] bg-[hsl(213,94%,58%,0.06)] backdrop-blur-sm flex items-center justify-center shadow-[0_0_20px_hsl(213,94%,58%,0.1)]"
        style={{ width: size, height: size }}
      >
        <Icon className="text-[hsl(213,94%,68%)]" style={{ width: size * 0.45, height: size * 0.45 }} />
      </div>
      <span className="text-[9px] tracking-widest uppercase text-[hsl(215,20%,45%)] font-medium">{label}</span>
    </div>
  );
}

/* ── Pulse ring ── */
function PulseRing({ x, y, delay }: { x: string; y: string; delay: number }) {
  return (
    <div className="absolute" style={{ left: x, top: y }}>
      <div className="w-3 h-3 rounded-full bg-[hsl(142,76%,50%)] animate-pulse shadow-[0_0_14px_hsl(142,76%,50%,0.5)]" style={{ animationDelay: `${delay}s` }} />
      <div className="absolute inset-0 w-3 h-3 rounded-full bg-[hsl(142,76%,50%,0.3)] animate-ping" style={{ animationDelay: `${delay}s` }} />
    </div>
  );
}

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

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

    if (isSignUp) {
      toast.success("Account created! Use the test credentials to sign in.");
      setIsSignUp(false);
      return;
    }

    const success = login(email, password);
    if (success) {
      toast.success("Signed in successfully!");
      navigate("/dashboard");
    } else {
      toast.error("Invalid credentials. Use admin@trackvault.com / admin123");
    }
  };

  return (
    <div className="min-h-screen flex bg-[hsl(222,47%,7%)]">
      {/* Left Panel — Branding with floating assets */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden flex-col justify-between p-10">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(222,47%,9%)] via-[hsl(224,40%,11%)] to-[hsl(230,35%,8%)]" />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(hsl(213 94% 58% / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(213 94% 58% / 0.3) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />

        {/* Floating asset nodes */}
        <FloatingNode icon={Laptop} label="Laptop" x="15%" y="18%" delay={0} size={56} />
        <FloatingNode icon={Printer} label="Printer" x="60%" y="12%" delay={0.8} size={52} />
        <FloatingNode icon={Smartphone} label="Mobile" x="75%" y="35%" delay={1.6} size={44} />
        <FloatingNode icon={Server} label="Server" x="20%" y="50%" delay={2.4} size={50} />
        <FloatingNode icon={Monitor} label="Monitor" x="50%" y="55%" delay={0.4} size={48} />
        <FloatingNode icon={Tablet} label="Tablet" x="70%" y="65%" delay={1.2} size={44} />
        <FloatingNode icon={HardDrive} label="Storage" x="35%" y="30%" delay={2.0} size={46} />
        <FloatingNode icon={Wifi} label="Router" x="42%" y="72%" delay={2.8} size={42} />

        {/* Pulse indicators */}
        <PulseRing x="30%" y="42%" delay={0} />
        <PulseRing x="65%" y="48%" delay={1.5} />
        <PulseRing x="48%" y="20%" delay={3} />

        {/* Connection lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <line x1="20%" y1="25%" x2="40%" y2="35%" stroke="hsl(213,94%,58%,0.08)" strokeWidth="1" strokeDasharray="4 6" />
          <line x1="65%" y1="18%" x2="50%" y2="58%" stroke="hsl(258,90%,66%,0.06)" strokeWidth="1" strokeDasharray="4 6" />
          <line x1="25%" y1="55%" x2="55%" y2="60%" stroke="hsl(142,76%,36%,0.06)" strokeWidth="1" strokeDasharray="4 6" />
          <line x1="75%" y1="40%" x2="55%" y2="60%" stroke="hsl(213,94%,58%,0.06)" strokeWidth="1" strokeDasharray="4 6" />
          <line x1="40%" y1="35%" x2="55%" y2="60%" stroke="hsl(258,90%,66%,0.05)" strokeWidth="1" strokeDasharray="4 6" />
        </svg>

        {/* Glowing orbs */}
        <div className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full bg-[hsl(213,94%,58%,0.06)] blur-[80px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48 rounded-full bg-[hsl(258,90%,66%,0.04)] blur-[60px] pointer-events-none" />

        {/* Top branding */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(213,94%,58%)] to-[hsl(258,90%,66%)] flex items-center justify-center shadow-[0_0_20px_hsl(213,94%,58%,0.3)]">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-wider text-white">TRACKVAULT</span>
          </div>
          <p className="text-xs tracking-[0.3em] uppercase text-[hsl(215,20%,50%)] font-medium">Asset Intelligence Platform</p>
        </div>

        {/* Description */}
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

          {/* Test credentials hint */}
          {!isSignUp && (
            <div className="mb-6 p-3 rounded-xl border border-[hsl(142,76%,36%,0.2)] bg-[hsl(142,76%,36%,0.06)]">
              <p className="text-xs text-[hsl(142,76%,60%)] font-medium">Test credentials: admin@trackvault.com / admin123</p>
            </div>
          )}

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
                <Label className="text-xs font-semibold tracking-widest uppercase text-[hsl(215,20%,45%)]">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(215,20%,40%)]" />
                  <Input type="text" placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)}
                    className="pl-11 h-12 bg-[hsl(223,37%,13%)] border-[hsl(222,20%,20%)] text-white placeholder:text-[hsl(215,20%,35%)] rounded-xl focus:border-[hsl(213,94%,58%,0.5)] focus:ring-[hsl(213,94%,58%,0.2)] transition-all" />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-xs font-semibold tracking-widest uppercase text-[hsl(215,20%,45%)]">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(215,20%,40%)]" />
                <Input type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="pl-11 h-12 bg-[hsl(223,37%,13%)] border-[hsl(222,20%,20%)] text-white placeholder:text-[hsl(215,20%,35%)] rounded-xl focus:border-[hsl(213,94%,58%,0.5)] focus:ring-[hsl(213,94%,58%,0.2)] transition-all" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold tracking-widest uppercase text-[hsl(215,20%,45%)]">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(215,20%,40%)]" />
                <Input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 pr-11 h-12 bg-[hsl(223,37%,13%)] border-[hsl(222,20%,20%)] text-white placeholder:text-[hsl(215,20%,35%)] rounded-xl focus:border-[hsl(213,94%,58%,0.5)] focus:ring-[hsl(213,94%,58%,0.2)] transition-all" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[hsl(215,20%,40%)] hover:text-[hsl(215,20%,60%)] transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit"
              className="w-full h-12 rounded-xl text-sm font-semibold bg-gradient-to-r from-[hsl(213,94%,58%)] to-[hsl(192,80%,50%)] hover:from-[hsl(213,94%,52%)] hover:to-[hsl(192,80%,44%)] text-white shadow-lg shadow-[hsl(213,94%,58%,0.25)] transition-all duration-300 hover:shadow-[hsl(213,94%,58%,0.35)]">
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

          {/* Alt auth */}
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
