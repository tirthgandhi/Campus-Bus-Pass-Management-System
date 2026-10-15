import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/route", label: "My Route" },
  { to: "/students", label: "Students" },
  { to: "/verify-student", label: "Verify Student" },
  { to: "/attendance", label: "Today's Attendance" },
  { to: "/report-problem", label: "Report Problem" },
  { to: "/profile", label: "Profile" },
];

export default function Sidebar({ open, onClose }) {
  const { logout } = useAuth();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-60 bg-dark-navy text-white flex flex-col
          transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="px-5 py-5 text-lg font-bold border-b border-white/10">
          Bus Driver
        </div>

        <nav className="flex-1 py-3">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              className={({ isActive }) =>
                `block px-5 py-3 text-sm transition ${
                  isActive
                    ? "bg-deep-blue text-white"
                    : "text-light-blue hover:bg-deep-blue hover:text-white"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={logout}
          className="mx-4 mb-4 py-2.5 text-sm bg-red-600 hover:bg-red-700 rounded-lg transition"
        >
          Logout
        </button>
      </aside>
    </>
  );
}