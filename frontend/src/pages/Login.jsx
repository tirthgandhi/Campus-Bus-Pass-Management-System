import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [input, setInput] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!input.trim() || !password) {
      setError("Please enter your email/Driver ID and password.");
      return;
    }

    setLoading(true);
    const isEmail = input.includes("@");
    const credentials = isEmail
      ? { email: input.trim().toLowerCase(), password }
      : { driverId: input.trim().toUpperCase(), password };

    try {
      const result = await login(credentials);
      if (result.success) navigate("/dashboard");
      else setError(result.message || "Invalid credentials. Please try again.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-5 login-bg">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none grid-overlay" />

      <div className="relative z-10 w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left content */}
        <div className="hidden lg:block text-white px-4">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center font-bold">
              CB
            </div>
            <div>
              <p className="text-sm font-semibold tracking-[0.12em] text-[#CDE1F2]">
                CAMPUS BUS
              </p>
              <p className="text-xs text-[#A8C5E0]">Transport Management System</p>
            </div>
          </div>

          <h1 className="text-3xl xl:text-4xl font-semibold leading-tight text-white max-w-md">
            Driver operations portal for university transport
          </h1>
          <p className="mt-4 text-[#CDE1F2] text-[15px] leading-relaxed max-w-md">
            Sign in to view your assigned bus and route, verify student passes,
            and record daily boarding attendance.
          </p>

          <div className="mt-8 space-y-3 max-w-md">
            {[
              "Assigned bus & route overview",
              "Student pass verification",
              "Attendance tracking",
            ].map((t) => (
              <div
                key={t}
                className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-[#E8F1FA]"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#A8C5E0]" />
                {t}
              </div>
            ))}
          </div>
        </div>

        {/* Login card */}
        <div className="w-full max-w-[420px] mx-auto">
          <div className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.35)] border border-[#CDE1F2] p-8">
            <div className="mb-7">
              <div className="lg:hidden flex items-center gap-2.5 mb-5">
                <div className="w-10 h-10 rounded-xl bg-[#1B3A6B] text-white flex items-center justify-center font-bold text-sm">
                  CB
                </div>
                <p className="text-sm font-semibold text-[#0D1B2A]">Driver Portal</p>
              </div>
              <h2 className="text-xl font-semibold text-[#0D1B2A]">Sign in</h2>
              <p className="mt-1 text-sm text-[#6B8CAE]">
                Use your driver email or Driver ID
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#0D1B2A] mb-1.5">
                  Email or Driver ID
                </label>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="driver1@test.com or DRV001"
                  className="w-full rounded-xl border border-[#A8C5E0] bg-[#E8F1FA]/50 px-4 py-3 text-sm outline-none transition focus:border-[#1B3A6B] focus:bg-white focus:ring-4 focus:ring-[#1B3A6B]/10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0D1B2A] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full rounded-xl border border-[#A8C5E0] bg-[#E8F1FA]/50 px-4 py-3 pr-14 text-sm outline-none transition focus:border-[#1B3A6B] focus:bg-white focus:ring-4 focus:ring-[#1B3A6B]/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#6B8CAE] hover:text-[#1B3A6B]"
                  >
                    {showPass ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#1B3A6B] hover:bg-[#0D1B2A] text-white font-semibold py-3.5 text-sm transition disabled:opacity-60"
              >
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-[#6B8CAE]">
              Contact Admin if you forgot your password
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .login-bg {
          background: linear-gradient(145deg, #070D16 0%, #0D1B2A 40%, #152A4A 75%, #1B3A6B 100%);
          background-size: 160% 160%;
          animation: bgShift 16s ease-in-out infinite alternate;
        }
        .grid-overlay {
          background-image:
            linear-gradient(rgba(168,197,224,0.22) 1px, transparent 1px),
            linear-gradient(90deg, rgba(168,197,224,0.22) 1px, transparent 1px);
          background-size: 42px 42px;
        }
        .orb {
          position: absolute;
          border-radius: 9999px;
          filter: blur(55px);
          pointer-events: none;
        }
        .orb-1 {
          width: 300px; height: 300px;
          background: rgba(27,58,107,0.35);
          top: -70px; left: -50px;
          animation: floatOrb 10s ease-in-out infinite;
        }
        .orb-2 {
          width: 260px; height: 260px;
          background: rgba(13,27,42,0.55);
          bottom: -50px; right: -30px;
          animation: floatOrb 12s ease-in-out infinite reverse;
        }
        .orb-3 {
          width: 160px; height: 160px;
          background: rgba(61,90,128,0.2);
          top: 42%; left: 48%;
          animation: floatOrb 14s ease-in-out infinite;
        }
        @keyframes bgShift {
          0% { background-position: 0% 40%; }
          100% { background-position: 100% 60%; }
        }
        @keyframes floatOrb {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(14px, -12px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .login-bg, .orb-1, .orb-2, .orb-3 {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}