import { useState } from "react";
import AppLayout from "../components/DriverLayout";
import { verifyPass, recordAttendance } from "../services/driverApi";

export default function VerifyBusPass() {
  const [passNumber, setPassNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [result, setResult] = useState(null);

  const handleVerify = async () => {
    const pass = passNumber.trim().toUpperCase();
    if (!pass) {
      setResult({ type: "error", message: "Please enter a Bus Pass ID" });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await verifyPass(pass);
      if (res.data.success) {
        setResult({
          type: "success",
          data: res.data.student,
          passNumber: pass,
        });
      } else {
        setResult({
          type: "error",
          message: res.data.message || "Verification failed",
        });
      }
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || "Cannot connect to server";

      if (status === 409) {
        setResult({ type: "warning", message: msg });
      } else {
        setResult({ type: "error", message: msg });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!result?.passNumber) return;

    setAccepting(true);
    try {
      const res = await recordAttendance(result.passNumber);
      if (res.data.success) {
        setResult({
          type: "accepted",
          data: res.data.attendance,
        });
        setPassNumber("");
      } else {
        setResult({
          type: "error",
          message: res.data.message || "Failed to accept student",
        });
      }
    } catch (err) {
      setResult({
        type: "error",
        message: err.response?.data?.message || "Cannot connect to server",
      });
    } finally {
      setAccepting(false);
    }
  };

  const resultStyles = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-amber-50 border-amber-200 text-amber-800",
    accepted: "bg-green-50 border-green-200 text-green-800",
  };

  return (
    <AppLayout title="Verify Student">
      <div className="max-w-md mx-auto animate-fade-up">
        <div className="card p-5 sm:p-7">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#E8F1FA] text-[#1B3A6B] mb-3">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-[#0D1B2A]">
              Enter Bus Pass ID
            </h2>
            <p className="text-xs text-[#6B8CAE] mt-1">
              Scan or type the student's pass number
            </p>
          </div>

          <input
            type="text"
            value={passNumber}
            onChange={(e) => setPassNumber(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleVerify()}
            placeholder="GSFC-01-001"
            className="input-field text-center text-lg tracking-wider uppercase font-semibold mb-4"
            autoFocus
          />

          <button
            onClick={handleVerify}
            disabled={loading}
            className="btn-primary w-full py-3.5 text-sm"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Verifying…
              </span>
            ) : (
              "Verify Student"
            )}
          </button>

          {result && (
            <div
              className={`mt-5 p-4 rounded-xl border animate-scale-in ${resultStyles[result.type]}`}
            >
              {result.type === "success" && (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-full bg-green-200 flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-sm">Student Verified</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    {[
                      ["Name", result.data.name],
                      ["Bus Pass ID", result.data.busPassId],
                      ["Status", result.data.status],
                    ].map(([label, val]) => (
                      <div key={label} className="flex justify-between items-center">
                        <span className="text-green-700/70">{label}</span>
                        <strong>{val}</strong>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleAccept}
                    disabled={accepting}
                    className="w-full mt-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition active:scale-[0.98] disabled:opacity-60"
                  >
                    {accepting ? "Accepting…" : "Accept Student"}
                  </button>
                </>
              )}

              {result.type === "accepted" && (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-full bg-green-200 flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-sm">Student Accepted</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    {[
                      ["Name", result.data.studentName],
                      ["Pass ID", result.data.busPassId || result.data.passNumber],
                      ["Time", result.data.time ? new Date(result.data.time).toLocaleTimeString() : "—"],
                    ].map(([label, val]) => (
                      <div key={label} className="flex justify-between items-center">
                        <span className="text-green-700/70">{label}</span>
                        <strong>{val || "—"}</strong>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {(result.type === "error" || result.type === "warning") && (
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-sm font-medium">{result.message}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
