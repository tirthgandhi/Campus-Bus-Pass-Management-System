import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import Spinner from "../components/ui/Spinner";
import { getDashboard } from "../api/driverApi";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await getDashboard();
        if (res.data.success) setData(res.data.dashboard);
        else setError(res.data.message || "Failed to load");
      } catch (err) {
        setError(err.response?.data?.message || "Cannot connect to server");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Spinner />;

  const s = data?.stats || {};
  const bus = data?.assignedBus || {};
  const route = data?.assignedRoute || {};

  const stats = [
    {
      label: "Assigned",
      value: s.totalAssignedStudents ?? 0,
      color: "text-[#1B3A6B]",
      bg: "bg-[#E8F1FA]",
    },
    {
      label: "Boarded",
      value: s.boardedToday ?? 0,
      color: "text-green-700",
      bg: "bg-green-50",
    },
    {
      label: "Left",
      value: s.remaining ?? 0,
      color: "text-amber-700",
      bg: "bg-amber-50",
    },
    {
      label: "Rate",
      value: `${s.attendancePercentage ?? 0}%`,
      color: "text-[#1B3A6B]",
      bg: "bg-[#E8F1FA]",
    },
  ];

  const quickLinks = [
    {
      to: "/students",
      title: "Passenger list",
      desc: "View assigned students",
    },
    {
      to: "/route",
      title: "Route & stops",
      desc: "Pickup points for this trip",
    },
    {
      to: "/report-problem",
      title: "Report problem",
      desc: "Engine, tyre, other issues",
    },
    {
      to: "/profile",
      title: "My profile",
      desc: "License and contact details",
    },
  ];

  return (
    <AppLayout title={data?.driverName || "Driver"}>
      {error && (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
          {error}
        </div>
      )}

      {/* Status strip — high contrast */}
      <div className="rounded-2xl bg-gradient-to-br from-[#1B3A6B] to-[#0D1B2A] p-4 sm:p-5 mb-4 text-white">
        <p className="text-[11px] font-medium uppercase tracking-wider text-[#A8C5E0]">
          Today&apos;s operation
        </p>
        <p className="text-base sm:text-lg font-bold mt-0.5 text-white">
          {bus.busNumber || "—"} · {route.routeName || "No route"}
        </p>
        <p className="text-[12px] text-[#CDE1F2] mt-1">
          {route.startPoint && route.endPoint
            ? `${route.startPoint} → ${route.endPoint}`
            : "Route details unavailable"}
        </p>
        <div className="mt-2">
          <span className="inline-block text-[11px] font-medium px-2.5 py-1 rounded-full bg-white/15 text-white">
            Status: {bus.status || "—"}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mb-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white border border-[#CDE1F2] rounded-xl p-3 sm:p-4 text-center shadow-sm"
          >
            <div
              className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${stat.bg} ${stat.color} mb-2 text-xs font-bold`}
            >
              {stat.label[0]}
            </div>
            <p className={`text-xl sm:text-2xl font-bold ${stat.color} leading-none`}>
              {stat.value}
            </p>
            <p className="text-[10px] sm:text-[11px] text-[#6B8CAE] mt-1.5 font-medium">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Primary actions */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 mb-4">
        <Link
          to="/verify-student"
          className="rounded-xl bg-[#1B3A6B] hover:bg-[#0D1B2A] text-white text-center text-sm font-semibold py-3.5 sm:py-4 transition"
        >
          Verify Pass
        </Link>
        <Link
          to="/attendance"
          className="rounded-xl bg-white border border-[#A8C5E0] hover:border-[#1B3A6B] text-[#0D1B2A] text-center text-sm font-semibold py-3.5 sm:py-4 transition"
        >
          Attendance
        </Link>
      </div>

      {/* Quick links */}
      <div className="bg-white border border-[#CDE1F2] rounded-xl overflow-hidden shadow-sm">
        {quickLinks.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="flex items-center justify-between px-4 py-3.5 border-b border-[#E8F1FA] last:border-0 hover:bg-[#F8FBFF] transition"
          >
            <div>
              <p className="text-sm font-semibold text-[#0D1B2A]">{item.title}</p>
              <p className="text-[11px] text-[#6B8CAE]">{item.desc}</p>
            </div>
            <span className="text-[#A8C5E0] text-lg leading-none">›</span>
          </Link>
        ))}
      </div>

      <p className="text-[11px] text-center text-[#6B8CAE] mt-5">
        ID {data?.driverId || "—"} · Bus {bus.busNumber || "—"}
      </p>
    </AppLayout>
  );
}