import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Eye, EyeOff, Cross, Shield, Activity } from "lucide-react";
import { dashboardByRole, useApp } from "../context/AppContext";
import { UserRole } from "../types/domain";

const databaseRoles: {
  role: UserRole;
  label: string;
  email: string;
  description: string;
  color: string;
}[] = [
  {
    role: "administrator",
    label: "Administrator",
    email: "admin@clinic.com",
    description: "Full system access",
    color: "#0EA5E9",
  },
  {
    role: "clinician",
    label: "Clinician",
    email: "alice.s@clinic.com",
    description: "Clinical workflows",
    color: "#0D9488",
  },
  {
    role: "receptionist",
    label: "Receptionist",
    email: "mary.r@clinic.com",
    description: "Patient intake",
    color: "#F59E0B",
  },
];

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>("administrator");
  const [email, setEmail] = useState("admin@clinic.com");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, user, initializing } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (!initializing && user) {
      navigate(dashboardByRole[user.role], { replace: true });
    }
  }, [initializing, navigate, user]);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setEmail(databaseRoles.find((item) => item.role === role)!.email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const authUser = await login(email, password, remember);
      navigate(dashboardByRole[authUser.role], { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden flex bg-white">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col px-10 py-7 justify-between border-r border-slate-100 bg-[linear-gradient(135deg,_#eefdf7_0%,_#f6fbff_45%,_#e8f7ff_100%)]">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-emerald-200/35 blur-3xl z-0" />
        <div className="absolute top-24 -right-24 w-96 h-96 rounded-full bg-sky-200/35 blur-3xl z-0" />
        <div className="absolute -bottom-24 left-1/4 w-96 h-96 rounded-full bg-cyan-100/30 blur-3xl z-0" />

        <div className="relative z-10 flex items-center gap-3 animate-fade-in">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-teal-400 flex items-center justify-center shadow-md shadow-sky-500/20">
            <Cross className="w-5 h-5 text-white" />
          </div>
          <span
            className="text-slate-800 tracking-tight"
            style={{ fontWeight: 700, fontSize: "1.25rem" }}
          >
            CareTrack
          </span>
        </div>

        <div className="relative z-10 w-full max-w-[560px] mx-auto mt-8 animate-slide-up">
          <div className="relative rounded-[2rem] overflow-hidden shadow-[0_24px_60px_rgba(14,_165,_233,_0.10)] border border-white/70 bg-white/50 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-t from-sky-500/10 via-transparent to-emerald-400/10 z-10" />
            <img
              src="/images/login-hero.png"
              alt="Medical professionals team"
              className="w-full h-[470px] object-cover"
              style={{ objectPosition: "center 18%" }}
            />
          </div>
        </div>

        <div
          className="relative z-10 mt-8 mb-4 animate-fade-in"
          style={{ animationDelay: "0.2s", animationFillMode: "both" }}
        >
          <h1
            className="text-slate-800 tracking-tight"
            style={{ fontSize: "2.15rem", fontWeight: 700, lineHeight: 1.1 }}
          >
            Good care starts with <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-emerald-400">
              calm teams.
            </span>
          </h1>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-white relative z-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center">
              <Cross className="w-4 h-4 text-white" />
            </div>
            <span className="text-slate-900" style={{ fontWeight: 700 }}>
              CareTrack Clinic
            </span>
          </div>

          <h2
            className="text-slate-900"
            style={{ fontSize: "1.75rem", fontWeight: 700, lineHeight: 1.2 }}
          >
            Welcome back
          </h2>
          <p className="text-slate-500 mt-1" style={{ fontSize: "0.9rem" }}>
            Sign in to your CareTrack account to continue.
          </p>

          <div className="mt-6 p-4 rounded-xl border border-slate-200 bg-slate-50">
            <p
              className="text-slate-500 mb-3"
              style={{
                fontSize: "0.75rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Database Users - Select Role
            </p>
            <div className="grid grid-cols-3 gap-2">
              {databaseRoles.map(({ role, label, description, color }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleRoleSelect(role)}
                  className={`p-2.5 rounded-lg border-2 text-left transition-all ${
                    selectedRole === role
                      ? "border-sky-400 bg-white shadow-sm"
                      : "border-transparent bg-white/60 hover:bg-white"
                  }`}
                >
                  <div
                    className="w-6 h-6 rounded-md mb-1.5 flex items-center justify-center"
                    style={{ backgroundColor: `${color}20` }}
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  </div>
                  <p
                    className="text-slate-900"
                    style={{ fontSize: "0.75rem", fontWeight: 600 }}
                  >
                    {label}
                  </p>
                  <p className="text-slate-400" style={{ fontSize: "0.65rem" }}>
                    {description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label
                className="block text-slate-700 mb-1.5"
                style={{ fontSize: "0.875rem", fontWeight: 500 }}
              >
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all"
                style={{ fontSize: "0.875rem" }}
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  className="text-slate-700"
                  style={{ fontSize: "0.875rem", fontWeight: 500 }}
                >
                  Password
                </label>
                <span className="text-slate-400" style={{ fontSize: "0.8rem" }}>
                  Seed password: password
                </span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all pr-12"
                  style={{ fontSize: "0.875rem" }}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 accent-sky-500"
              />
              <label
                htmlFor="remember"
                className="text-slate-600"
                style={{ fontSize: "0.875rem" }}
              >
                Remember me for 30 days
              </label>
            </div>

            {error && (
              <div
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-red-700"
                style={{ fontSize: "0.82rem" }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-white transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              style={{
                backgroundColor: "#0EA5E9",
                fontWeight: 600,
                fontSize: "0.9rem",
              }}
              onMouseEnter={(e) =>
                !loading &&
                ((e.target as HTMLElement).style.backgroundColor = "#0284C7")
              }
              onMouseLeave={(e) =>
                !loading &&
                ((e.target as HTMLElement).style.backgroundColor = "#0EA5E9")
              }
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in to CareTrack"
              )}
            </button>
          </form>

          <p
            className="mt-8 text-center text-slate-400"
            style={{ fontSize: "0.78rem" }}
          >
            (c) 2026 CareTrack Clinic. All rights reserved. HIPAA Compliant.
          </p>
        </div>
      </div>
    </div>
  );
}
