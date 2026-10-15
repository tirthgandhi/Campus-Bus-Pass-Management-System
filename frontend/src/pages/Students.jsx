import { useEffect, useState } from "react";
import AppLayout from "../components/layout/AppLayout";
import Spinner from "../components/ui/Spinner";
import { getStudents } from "../api/driverApi";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    async function load() {
      try {
        const res = await getStudents();
        if (res.data.success) {
          setStudents(res.data.students || []);
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

  const filtered = students.filter((s) => {
    const matchSearch =
      (s.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.busPassId || "").toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || s.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <AppLayout title="Assigned Students">
      {error && (
        <div className="mb-4 p-3.5 bg-red-50 text-red-700 rounded-xl text-sm border border-red-200">
          {error}
        </div>
      )}

      {/* Search + filters */}
      <div className="flex flex-wrap gap-2.5 mb-3 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B8CAE] pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or Pass ID…"
            className="w-full rounded-xl border border-[#A8C5E0] bg-white pl-10 pr-3 py-2.5 text-sm text-[#0D1B2A] placeholder:text-[#6B8CAE] outline-none focus:border-[#1B3A6B] focus:ring-2 focus:ring-[#1B3A6B]/15"
          />
        </div>

        {["all", "Boarded", "Pending"].map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-xs font-semibold border transition ${
              filter === f
                ? "bg-[#1B3A6B] text-white border-[#1B3A6B]"
                : "bg-white text-[#1B3A6B] border-[#A8C5E0] hover:border-[#1B3A6B]"
            }`}
          >
            {f === "all" ? "All" : f}
          </button>
        ))}
      </div>

      <p className="text-xs text-[#6B8CAE] mb-3">
        Showing <strong className="text-[#0D1B2A]">{filtered.length}</strong> of{" "}
        {students.length} students
      </p>

      {/* Table */}
      <div className="bg-white border border-[#CDE1F2] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[480px]">
            <thead>
              <tr className="bg-[#F0F7FC] text-[#0D1B2A]">
                <th className="text-left px-4 py-3.5 font-semibold text-xs uppercase tracking-wider">
                  #
                </th>
                <th className="text-left px-4 py-3.5 font-semibold text-xs uppercase tracking-wider">
                  Student Name
                </th>
                <th className="text-left px-4 py-3.5 font-semibold text-xs uppercase tracking-wider">
                  Bus Pass ID
                </th>
                <th className="text-left px-4 py-3.5 font-semibold text-xs uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center py-14 text-[#6B8CAE] text-sm"
                  >
                    No students found
                  </td>
                </tr>
              ) : (
                filtered.map((s, i) => (
                  <tr
                    key={s.studentId}
                    className="border-b border-[#F0F7FC] last:border-0 hover:bg-[#F8FBFF]"
                  >
                    <td className="px-4 py-3.5 text-[#6B8CAE]">{i + 1}</td>
                    <td className="px-4 py-3.5 font-medium text-[#0D1B2A]">
                      {s.name}
                    </td>
                    <td className="px-4 py-3.5 text-[#3D5A80] font-mono text-xs">
                      {s.busPassId}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                          s.status === "Boarded"
                            ? "bg-green-100 text-green-800"
                            : "bg-amber-100 text-amber-800"
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