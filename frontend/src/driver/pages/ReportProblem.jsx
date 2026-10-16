import { useState } from "react";
import AppLayout from "../components/DriverLayout";
import { reportProblem } from "../services/driverApi";

export default function ReportProblem() {
  const [problemType, setProblemType] = useState("");
  const [severity, setSeverity] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (!problemType || !severity || !description.trim()) {
      setMessage({ type: "error", text: "Please fill all fields" });
      return;
    }

    setLoading(true);
    try {
      const res = await reportProblem({
        problemType,
        severity,
        description: description.trim(),
      });

      if (res.data.success) {
        setMessage({ type: "success", text: "Problem reported successfully!" });
        setProblemType("");
        setSeverity("");
        setDescription("");
      } else {
        setMessage({
          type: "error",
          text: res.data.message || "Failed to submit",
        });
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Cannot connect to server",
      });
    } finally {
      setLoading(false);
    }
  };

  const severityColors = {
    Low: "border-green-300 bg-green-50 text-green-800",
    Medium: "border-amber-300 bg-amber-50 text-amber-800",
    High: "border-orange-300 bg-orange-50 text-orange-800",
    Critical: "border-red-300 bg-red-50 text-red-800",
  };

  return (
    <AppLayout title="Report Bus Problem">
      <div className="max-w-md animate-fade-up">
        <div className="card p-5 sm:p-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 mb-3">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-[#0D1B2A]">Report an Issue</h2>
            <p className="text-xs text-[#6B8CAE] mt-1">Describe the problem with your assigned bus</p>
          </div>

          {message.text && (
            <div
              className={`mb-4 p-3.5 rounded-xl text-sm border animate-scale-in ${
                message.type === "success"
                  ? "bg-green-50 text-green-800 border-green-200"
                  : "bg-red-50 text-red-800 border-red-200"
              }`}
            >
              <div className="flex items-center gap-2">
                {message.type === "success" ? (
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                )}
                {message.text}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#0D1B2A] mb-1.5">
                Problem Type
              </label>
              <select
                value={problemType}
                onChange={(e) => setProblemType(e.target.value)}
                className="input-field"
              >
                <option value="">Select problem type</option>
                <option value="Engine Problem">Engine Problem</option>
                <option value="Brake Problem">Brake Problem</option>
                <option value="Tyre Problem">Tyre Problem</option>
                <option value="Electrical Problem">Electrical Problem</option>
                <option value="Fuel Problem">Fuel Problem</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#0D1B2A] mb-1.5">
                Severity
              </label>
              <div className="grid grid-cols-2 gap-2">
                {["Low", "Medium", "High", "Critical"].map((sev) => (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setSeverity(sev)}
                    className={`py-2.5 rounded-xl text-xs font-semibold border-2 transition active:scale-95 ${
                      severity === sev
                        ? severityColors[sev] + " border-current shadow-sm"
                        : "border-[#CDE1F2] bg-white text-[#6B8CAE] hover:border-[#A8C5E0]"
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#0D1B2A] mb-1.5">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the problem in detail…"
                rows={4}
                className="input-field resize-y"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 text-sm"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Submitting…
                </span>
              ) : (
                "Submit Problem"
              )}
            </button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
