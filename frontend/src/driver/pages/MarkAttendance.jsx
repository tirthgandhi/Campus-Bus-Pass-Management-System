import { useEffect, useState } from "react";
import AppLayout from "../components/DriverLayout";
import Spinner from "../components/Spinner";
import { getTodayAttendance } from "../services/driverApi";

export default function MarkAttendance() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await getTodayAttendance();
        if (res.data.success) {
          setData(res.data);
        } else {
          setError(res.data.message || "Failed to load");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Cannot connect to server");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <Spinner />;

  const summary = data?.summary || {};
  const students = data?.students || [];

  const stats = [
    { label: "Assigned", value: summary.totalAssigned ?? 0, color: "text-[#1B3A6B]" },
    { label: "Boarded", value: summary.boarded ?? 0, color: "text-green-700" },
    { label: "Remaining", value: summary.remaining ?? 0, color: "text-amber-700" },
    { label: "Percentage", value: `${summary.attendancePercentage ?? 0}%`, color: "text-[#1B3A6B]" },
  ];

  return (
    <AppLayout title="Today's Attendance">
      {error && (
        <div className="mb-4 p-3.5 bg-red-50 text-red-700 rounded-xl text-sm border border-red-200 animate-fade-up">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 mb-5">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className={`card p-4 text-center animate-fade-up stagger-${i + 1}`}
          >
            <p className="text-[11px] text-[#6B8CAE] font-medium mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden animate-fade-up stagger-3">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[520px]">
            <thead>
              <tr className="bg-[#F0F7FC] text-[#0D1B2A]">
                <th className="text-left px-4 py-3.5 font-semibold text-xs uppercase tracking-wider">#</th>
                <th className="text-left px-4 py-3.5 font-semibold text-xs uppercase tracking-wider">Student Name</th>
                <th className="text-left px-4 py-3.5 font-semibold text-xs uppercase tracking-wider">Bus Pass ID</th>
                <th className="text-left px-4 py-3.5 font-semibold text-xs uppercase tracking-wider">Time</th>
                <th className="text-left px-4 py-3.5 font-semibold text-xs uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-14 text-[#6B8CAE]">
                    <div className="flex flex-col items-center gap-2">
                      <svg className="w-10 h-10 text-[#CDE1F2]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <span className="text-sm">No students found</span>
                    </div>
                  </td>
                </tr>
              ) : (
                students.map((s, i) => (
                  <tr key={s.studentId} className="table-row border-b border-[#F0F7FC] last:border-0">
                    <td className="px-4 py-3.5 text-[#6B8CAE]">{i + 1}</td>
                    <td className="px-4 py-3.5 font-medium text-[#0D1B2A]">{s.name}</td>
                    <td className="px-4 py-3.5 text-[#3D5A80] font-mono text-xs">{s.busPassId}</td>
                    <td className="px-4 py-3.5 text-[#6B8CAE]">
                      {s.time ? new Date(s.time).toLocaleTimeString() : "—"}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`badge ${
                          s.status === "Boarded" ? "badge-success" : "badge-warning"
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
