import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../common/context/AuthContext";

const links = [
  {
    to: "/driver/dashboard",
    label: "Home",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" />
      </svg>
    ),
  },
  {
    to: "/driver/verify-student",
    label: "Verify",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    to: "/driver/students",
    label: "Students",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    to: "/driver/attendance",
    label: "Attendance",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    to: "/driver/route",
    label: "Route",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
  },
  {
    to: "/driver/report-problem",
    label: "Problem",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
  {
    to: "/driver/profile",
    label: "Profile",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

export default function DriverLayout({ title, children }) {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const closeMobileMenu = () => setOpen(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#E8F1FA] pb-24 lg:pb-0 lg:flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 shrink-0 flex-col bg-[#0D1B2A] text-white min-h-screen sticky top-0 h-screen">
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1B3A6B] flex items-center justify-center text-sm font-bold tracking-tight">
              CB
            </div>
            <div>
              <p className="text-sm font-bold leading-tight">Campus Bus</p>
              <p className="text-[11px] text-[#A8C5E0]">Driver Console</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `nav-link flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium ${
                  isActive
                    ? "bg-[#1B3A6B] text-white shadow-lg shadow-black/20"
                    : "text-[#A8C5E0] hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <span className="nav-icon shrink-0 opacity-90">{l.icon}</span>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-[#1B3A6B] flex items-center justify-center text-xs font-bold">
              {(user?.name || "D")[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-[#6B8CAE] truncate">{user?.driverId}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-xs font-semibold bg-red-600/90 hover:bg-red-600 rounded-xl py-2.5 transition active:scale-[0.98]"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-20 bg-[#0D1B2A]/95 backdrop-blur-md text-white px-4 sm:px-5 py-3.5 flex items-center justify-between shadow-lg shadow-black/10">
          <div className="animate-slide-right">
            <p className="text-[10px] uppercase tracking-wider text-[#A8C5E0] leading-none mb-0.5">
              Driver Console
            </p>
            <h1 className="text-base sm:text-lg font-semibold leading-tight">{title}</h1>
          </div>
          <button
            onClick={handleLogout}
            className="lg:hidden text-xs font-medium bg-white/10 hover:bg-white/15 active:scale-95 px-3.5 py-2 rounded-xl transition"
          >
            Logout
          </button>
        </header>

        <main className="p-3 sm:p-5 max-w-5xl mx-auto w-full flex-1 animate-fade-in">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-[#0D1B2A]/95 backdrop-blur-md border-t border-white/10 px-1 pt-1.5 pb-[max(0.4rem,env(safe-area-inset-bottom))] flex justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.15)]">
        {links.slice(0, 5).map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            onClick={closeMobileMenu}
            className={({ isActive }) =>
              `nav-link flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-xl mx-0.5 text-[9px] font-medium ${
                isActive
                  ? "nav-link-active bg-[#1B3A6B] text-white"
                  : "text-[#A8C5E0]"
              }`
            }
          >
            <span className="nav-icon">{l.icon}</span>
            {l.label}
          </NavLink>
        ))}
        <button
          onClick={() => setOpen(true)}
          className="nav-link flex-1 flex flex-col items-center gap-0.5 py-1.5 text-[9px] font-medium text-[#A8C5E0]"
        >
          <span className="nav-icon">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </span>
          More
        </button>
      </nav>

      {/* More bottom sheet */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/50 animate-fade-in"
            onClick={() => setOpen(false)}
          />
          <div className="absolute bottom-0 inset-x-0 bg-white rounded-t-3xl p-5 space-y-2 shadow-2xl animate-slide-up">
            <div className="w-10 h-1 rounded-full bg-[#CDE1F2] mx-auto mb-3" />
            <p className="text-xs font-semibold text-[#6B8CAE] uppercase tracking-wider px-1 mb-1">
              More options
            </p>
            {links.slice(5).map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-medium text-[#0D1B2A] bg-[#E8F1FA] hover:bg-[#CDE1F2] transition active:scale-[0.98]"
              >
                <span className="text-[#1B3A6B]">{l.icon}</span>
                {l.label}
              </NavLink>
            ))}
            <button
              onClick={closeMobileMenu}
              className="w-full rounded-2xl py-3.5 text-sm font-medium text-[#6B8CAE] hover:bg-[#F0F7FC] transition mt-1"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
