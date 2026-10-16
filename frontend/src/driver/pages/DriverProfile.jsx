import { useEffect, useState } from "react";
import AppLayout from "../components/DriverLayout";
import Spinner from "../components/Spinner";
import { getProfile } from "../services/driverApi";

export default function DriverProfile() {
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await getProfile();
        if (res.data.success) {
          setDriver(res.data.driver);
        } else {
          setError(res.data.message || "Failed to load profile");
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

  const rows = [
    { label: "Name", value: driver?.name },
    { label: "Driver ID", value: driver?.driverId },
    { label: "Email", value: driver?.email },
    { label: "Phone", value: driver?.phone },
    { label: "License Number", value: driver?.licenseNumber },
    { label: "Assigned Bus", value: driver?.assignedBus?.busNumber },
    { label: "Assigned Route", value: driver?.assignedRoute?.routeName },
    { label: "Status", value: driver?.status },
  ];

  return (
    <AppLayout title="My Profile">
      {error && (
        <div className="mb-4 p-3.5 bg-red-50 text-red-700 rounded-xl text-sm border border-red-200 animate-fade-up">
          {error}
        </div>
      )}

      <div className="max-w-md animate-fade-up">
        <div className="card overflow-hidden">
          <div className="bg-gradient-to-br from-[#1B3A6B] to-[#0D1B2A] px-6 py-7 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-28 h-28 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-white/15 border-2 border-white/30 flex items-center justify-center text-2xl font-bold text-white mx-auto mb-3">
                {(driver?.name || "D")[0].toUpperCase()}
              </div>
              <p className="text-white font-semibold text-lg">{driver?.name || "—"}</p>
              <p className="text-[#A8C5E0] text-xs mt-0.5">{driver?.driverId || "—"}</p>
              {driver?.status && (
                <span className="inline-block mt-2 badge bg-white/15 text-white text-[10px]">
                  {driver.status}
                </span>
              )}
            </div>
          </div>

          <div className="p-5 space-y-0">
            {rows
              .filter((r) => r.label !== "Name" && r.label !== "Driver ID" && r.label !== "Status")
              .map((row, i) => (
                <div
                  key={row.label}
                  className={`flex justify-between items-center py-3.5 border-b border-[#E8F1FA] last:border-0 text-sm animate-fade-up stagger-${Math.min(i + 1, 6)}`}
                >
                  <span className="text-[#6B8CAE] font-medium">{row.label}</span>
                  <strong className="text-[#0D1B2A] text-right max-w-[55%] truncate">
                    {row.value || "—"}
                  </strong>
                </div>
              ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
