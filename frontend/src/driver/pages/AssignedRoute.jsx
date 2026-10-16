import { useEffect, useState } from "react";
import AppLayout from "../components/DriverLayout";
import Spinner from "../components/Spinner";
import { getAssignedRoute } from "../services/driverApi";

export default function AssignedRoute() {
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await getAssignedRoute();
        if (res.data.success) {
          setRoute(res.data.route);
        } else {
          setError(res.data.message || "No route assigned");
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

  const stops = (route?.stops || []).slice().sort((a, b) => a.sequence - b.sequence);

  return (
    <AppLayout title="My Route">
      {error && (
        <div className="mb-4 p-3.5 bg-red-50 text-red-700 rounded-xl text-sm border border-red-200 animate-fade-up">
          {error}
        </div>
      )}

      <div className="max-w-lg animate-fade-up">
        <div className="card p-5 sm:p-6">
          <div className="mb-5 pb-4 border-b border-[#E8F1FA]">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#E8F1FA] text-[#1B3A6B] flex items-center justify-center shrink-0">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#0D1B2A]">
                  {route?.routeName || "—"}
                </h2>
                {route?.routeNumber && (
                  <p className="text-xs text-[#6B8CAE] mt-0.5">
                    Route No: <span className="font-semibold text-[#3D5A80]">{route.routeNumber}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-0 mb-6">
            {[
              { label: "Start Point", value: route?.startPoint, color: "bg-green-500" },
              { label: "Destination", value: route?.endPoint, color: "bg-red-500" },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center gap-3 py-3 border-b border-[#E8F1FA] last:border-0"
              >
                <div className={`w-2.5 h-2.5 rounded-full ${row.color} shrink-0`} />
                <div className="flex-1 flex justify-between items-center text-sm">
                  <span className="text-[#6B8CAE]">{row.label}</span>
                  <strong className="text-[#0D1B2A]">{row.value || "—"}</strong>
                </div>
              </div>
            ))}
          </div>

          <h3 className="font-semibold text-[#0D1B2A] mb-4 text-sm">Pickup Points</h3>
          {stops.length === 0 ? (
            <p className="text-sm text-[#6B8CAE] text-center py-6">No stops available</p>
          ) : (
            <div className="relative space-y-0">
              <div className="absolute left-[13px] top-3 bottom-3 w-0.5 bg-[#CDE1F2]" />
              {stops.map((s, i) => (
                <div
                  key={s.sequence}
                  className={`relative flex items-center gap-3.5 py-2.5 animate-fade-up stagger-${Math.min(i + 1, 6)}`}
                >
                  <div className="relative z-10 w-7 h-7 rounded-full bg-[#1B3A6B] text-white text-xs font-bold flex items-center justify-center shadow-md shadow-[#1B3A6B]/30">
                    {s.sequence}
                  </div>
                  <span className="text-sm text-[#0D1B2A] font-medium">{s.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
