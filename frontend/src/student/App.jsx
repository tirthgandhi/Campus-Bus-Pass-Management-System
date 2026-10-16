import { useState, useEffect } from "react";
import AttendanceHistory from "./AttendanceHistory";
import TransportRequestStatus from "./TransportRequestStatus";
import { useAuth } from "../common/context/AuthContext";
import { apiRequest } from "./api";
import "./styles.css";

// ── GSFC University Routes 2026-27 ───────────────────────────────────────────
const ROUTES = [
  { id: "ROUTE-1",  busNumber: "GJ-16-AU-4788", driverName: "Mr. Rajesh Patel",    stops: ["Soma Talav (BPC Pump)", "Gurukul Char Rasta", "Bapod Police St", "Super Bekery", "GSFC University"] },
  { id: "ROUTE-2",  busNumber: "GJ-06-BX-3670", driverName: "Mr. Suresh Sharma",   stops: ["Parivar Char Rasta", "Vrundavan Circle", "Sardar Estate (SS)", "Earth Icon", "Amit Nagar", "GSFC University"] },
  { id: "ROUTE-3",  busNumber: "GJ-06-BV-7875", driverName: "Mr. Dinesh Verma",    stops: ["Khodiyar Nagar", "Airport Circle", "Golden Chokadi", "Dena Chokadi", "GSFC University"] },
  { id: "ROUTE-4",  busNumber: "GJ-06-AX-3348", driverName: "Mr. Mahesh Yadav",    stops: ["Chankyapuri", "Abhilasha Char Rasta", "Harni Gada Circle", "GSFC University"] },
  { id: "ROUTE-5",  busNumber: "GJ-16-AU-4890", driverName: "Mr. Ramesh Chauhan",  stops: ["Earth Icon", "Jagdish Farshan", "Miletry Boys", "Amit Nagar", "L & T Circle", "GSFC University"] },
  { id: "ROUTE-6",  busNumber: "GJ-16-BV-7584", driverName: "Mr. Nilesh Solanki",  stops: ["Voltamp Company", "Maneja Crossing", "Hanuman Temple (Mak)", "Novino", "GSFC University"] },
  { id: "ROUTE-7",  busNumber: "GJ-16-AU-1390", driverName: "Mr. Hitesh Rathod",   stops: ["Ravi Park", "Gamgasagar", "Kabir Complex", "Polo Ground", "Susen Circle", "GSFC University"] },
  { id: "ROUTE-8",  busNumber: "GJ-06-BV-7989", driverName: "Mr. Bhavesh Joshi",   stops: ["Darbar Chowkdi", "Pramukh Prasad / Pramukh Darshan", "Avdhut Fatak / JL Baug Fatak", "Kalaghoda", "Mahesana Nagar Circle", "GSFC University"] },
  { id: "ROUTE-9",  busNumber: "GJ-06-BV-2915", driverName: "Mr. Alpesh Trivedi",  stops: ["Sarswati Complex", "Tulsidham", "Raj Mahel Gate", "Fatehgunj - 808", "Yogniketan", "Nizampura - Tasty Vadapav", "GSFC University"] },
  { id: "ROUTE-10", busNumber: "GJ-16-AU-3840", driverName: "Mr. Kalpesh Makwana", stops: ["Khekholi Circle", "Atladra", "Kia Moter", "Sun Pharma Road", "Tandalja", "GSFC University"] },
  { id: "ROUTE-11", busNumber: "GJ-06-AX-1826", driverName: "Mr. Pratik Desai",    stops: ["Hari Nagar Char Rasta", "Nandalay Circle", "Zansi Ki Rani", "Jain Derasar", "Dashama Chokdi", "Iti Gorwa", "Panchvati Circle", "GSFC University"] },
  { id: "ROUTE-12", busNumber: "GJ-06-BV-6129", driverName: "Mr. Jigar Shah",      stops: ["Akshar Chowk", "Devdeep Nagar", "Vasna Circle - Khteteshwar", "Swaminarayan Mandir", "Time Circle", "Chhani Jakat Naka", "Chhani Canal", "Chhani Gurudwara", "GSFC University"] },
  { id: "ROUTE-13", busNumber: "GJ-06-BV-6527", driverName: "Mr. Vishal Pandya",   stops: ["Nilamber Circle", "Yash Complex", "Natubhai Circle", "Chakli Circle", "Trident Circle", "Genda Circle", "GSFC University"] },
];

export default function StudentApp() {
  const { user, logout } = useAuth();
  const [page, setPage] = useState("dashboard");

  // Full profile from backend
  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    enrollment: "",
    phone: "",
    department: "",
    semester: "",
  });

  // Live data from backend
  const [dashData, setDashData]     = useState(null);
  const [transportReq, setTransportReq] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [busPass, setBusPass]       = useState(null); // local-only for Apply form state
  const [loading, setLoading]       = useState(typeof window !== "undefined");

  // Fetch all student data on mount
  useEffect(() => {
    let cancelled = false;
    async function fetchAll() {
      try {
        const [profileRes, dashRes, reqRes] = await Promise.allSettled([
          apiRequest("/students/profile"),
          apiRequest("/students/dashboard"),
          apiRequest("/students/transport-request"),
        ]);

        if (cancelled) return;

        if (profileRes.status === "fulfilled" && profileRes.value?.success) {
          const d = profileRes.value.data;
          setProfile({
            name: d.name || "",
            email: d.collegeEmail || d.email || "",
            enrollment: d.studentId || "",
            phone: d.phone || "",
            department: d.department || "",
            semester: d.semester ? String(d.semester) : "",
          });
        }

        if (dashRes.status === "fulfilled" && dashRes.value?.success) {
          setDashData(dashRes.value.data);
          if (dashRes.value.data?.assignment) {
            setAssignment(dashRes.value.data.assignment);
          }
        }

        if (reqRes.status === "fulfilled" && reqRes.value?.success) {
          setTransportReq(reqRes.value.data);
        }
      } catch (e) {
        // non-fatal
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchAll();
    return () => { cancelled = true; };
  }, []);

  function handleLogout() {
    logout();
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#e8f1fa" }}>
        <div style={{ textAlign: "center", color: "#1b3a6b" }}>
          <div style={{ fontSize: "2rem", marginBottom: "12px", fontWeight: "bold" }}>C</div>
          <p>Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="student-portal">
      <div className="app">
        <aside className="sidebar">
          <div className="logo">
            <div className="logo-circle">C</div>
            <div>
              <h2>CampusConnect</h2>
              <p>Student Transport</p>
            </div>
          </div>

          <button className={page === "dashboard"       ? "nav active" : "nav"} onClick={() => setPage("dashboard")}>⌂ Dashboard</button>
          <button className={page === "apply"           ? "nav active" : "nav"} onClick={() => setPage("apply")}>＋ Apply for Pass</button>
          <button className={page === "request-status"  ? "nav active" : "nav"} onClick={() => setPage("request-status")}>◷ Request Status</button>
          <button className={page === "pass"            ? "nav active" : "nav"} onClick={() => setPage("pass")}>▣ My Bus Pass</button>
          <button className={page === "transport"       ? "nav active" : "nav"} onClick={() => setPage("transport")}>⌁ Bus & Route</button>
          <button className={page === "profile"         ? "nav active" : "nav"} onClick={() => setPage("profile")}>◉ My Profile</button>
          <button className={page === "attendance"      ? "nav active" : "nav"} onClick={() => setPage("attendance")}>▤ Attendance History</button>

          <div className="sidebar-bottom">
            <p><strong>{profile.name}</strong></p>
            <small>Student</small>
            <button className="logout" onClick={handleLogout}>↪ Logout</button>
          </div>
        </aside>

        <main className="content">
          {page === "dashboard"      && <Dashboard profile={profile} dashData={dashData} setPage={setPage} />}
          {page === "apply"          && <ApplyPass transportReq={transportReq} setTransportReq={setTransportReq} setPage={setPage} />}
          {page === "pass"           && <MyBusPass profile={profile} assignment={assignment} transportReq={transportReq} setPage={setPage} />}
          {page === "transport"      && <Transport assignment={assignment} />}
          {page === "profile"        && <Profile profile={profile} setProfile={setProfile} />}
          {page === "attendance"     && <AttendanceHistory />}
          {page === "request-status" && <TransportRequestStatus transportReq={transportReq} setPage={setPage} />}
        </main>
      </div>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function Dashboard({ profile, dashData, setPage }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const req    = dashData?.transportRequest;
  const assign = dashData?.assignment;
  const att    = dashData?.attendance || {};

  return (
    <>
      <header>
        <p className="small-heading">STUDENT DASHBOARD</p>
        <h1>{greeting}, {profile.name || "Student"}.</h1>
        <p className="muted">Here is your transport overview.</p>
      </header>

      <section className="cards">
        <Card title="Pass Status"   value={req ? req.status.charAt(0).toUpperCase() + req.status.slice(1) : "Not Applied"} icon="▣" />
        <Card title="Assigned Bus"  value={assign?.bus?.busNumber || "Not Assigned"} icon="▰" />
        <Card title="Route"         value={assign?.route?.routeName || "Not Assigned"} icon="⌁" />
        <Card title="Attendance"    value={att.total > 0 ? `${att.percentage ?? 0}%` : "—"} icon="◷" />
      </section>

      <section className="panel">
        <h2>Bus Pass Application</h2>
        {req ? (
          <>
            <p><strong>Status:</strong> <span className={`status ${req.status}`}>{req.status.charAt(0).toUpperCase() + req.status.slice(1)}</span></p>
            <p><strong>Pickup Stop:</strong> {req.pickupPoint?.name || "—"}</p>
            {req.status === "rejected" && req.rejectionReason && (
              <p style={{ color: "#9e3645", background: "#f8dce0", padding: "10px 12px", borderRadius: "8px", marginTop: "8px" }}>
                <strong>Reason:</strong> {req.rejectionReason}
              </p>
            )}
            {assign && (
              <p><strong>Bus Pass ID:</strong> {assign.busPassId}</p>
            )}
            <button className="secondary-button" onClick={() => setPage("pass")}>
              View Pass Details
            </button>
          </>
        ) : (
          <>
            <p className="muted">You have not applied for a bus pass yet.</p>
            <button className="primary-small" onClick={() => setPage("apply")}>Apply Now</button>
          </>
        )}
      </section>
    </>
  );
}

// ── Apply for Pass ─────────────────────────────────────────────────────────────
function ApplyPass({ transportReq, setTransportReq, setPage }) {
  const [selectedRoute, setSelectedRoute] = useState("");
  const [pickupStop, setPickupStop]       = useState("");
  const [termDuration, setTermDuration]   = useState("");
  const [submitting, setSubmitting]       = useState(false);
  const [error, setError]                 = useState("");
  const [pickupPoints, setPickupPoints]   = useState([]);
  const [ppLoading, setPpLoading]         = useState(true);

  // Fetch real pickup points from backend
  useEffect(() => {
    apiRequest("/students/pickup-points")
      .then(res => { if (res?.success) setPickupPoints(res.data); })
      .catch(() => {})
      .finally(() => setPpLoading(false));
  }, []);

  const route           = ROUTES.find(r => r.id === selectedRoute);
  const availableStops  = route ? route.stops.filter(s => s !== "GSFC University") : [];

  // Find backend pickup point ID matching selected stop
  function getPickupPointId() {
    const match = pickupPoints.find(pp =>
      pp.name.toLowerCase().includes(pickupStop.toLowerCase()) ||
      pickupStop.toLowerCase().includes(pp.name.toLowerCase())
    );
    return match?._id || null;
  }

  if (transportReq && ["pending", "approved"].includes(transportReq.status)) {
    return (
      <>
        <h1>Apply for Bus Pass</h1>
        <div className="panel">
          <h2>You already have a {transportReq.status} application.</h2>
          <p className="muted">Pickup: {transportReq.pickupPoint?.name}</p>
          <button className="primary-small" onClick={() => setPage("pass")}>View My Bus Pass</button>
        </div>
      </>
    );
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      let pickupPointId = getPickupPointId();

      // If no match found in DB, submit with first available pickup point
      if (!pickupPointId && pickupPoints.length > 0) {
        pickupPointId = pickupPoints[0]._id;
      }

      if (!pickupPointId) {
        setError("No pickup points are available. Please contact the admin.");
        return;
      }

      const res = await apiRequest("/students/transport-request", {
        method: "POST",
        body: JSON.stringify({ pickupPointId }),
      });

      if (res?.success) {
        setTransportReq(res.data);
        setPage("pass");
      } else {
        setError(res?.message || "Failed to submit request.");
      }
    } catch (e) {
      setError(e?.message || "Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <p className="small-heading">STUDENT PORTAL</p>
      <h1>Apply for Bus Pass</h1>
      <p className="muted">Select the route closest to your home and your boarding stop.</p>

      <div className="panel form-panel">
        <form onSubmit={submit}>
          <label>Select Route</label>
          <select required value={selectedRoute} onChange={e => { setSelectedRoute(e.target.value); setPickupStop(""); }}>
            <option value="">— Select your route —</option>
            {ROUTES.map(r => (
              <option key={r.id} value={r.id}>
                {r.id.replace("ROUTE-", "Route ")} – {r.stops[0]}
              </option>
            ))}
          </select>

          {selectedRoute && (
            <>
              <label>Select Your Boarding Stop</label>
              <select required value={pickupStop} onChange={e => setPickupStop(e.target.value)}>
                <option value="">— Select your boarding stop —</option>
                {availableStops.map(stop => <option key={stop} value={stop}>{stop}</option>)}
              </select>

              <div className="route-preview">
                <p className="route-preview-label">All Stops on {selectedRoute.replace("ROUTE-", "Route ")}</p>
                <ol className="stops">
                  {route.stops.map(stop => (
                    <li key={stop} className={stop === pickupStop ? "stop-selected" : ""}>
                      {stop}
                      {stop === pickupStop && <span className="stop-tag boarding">Your Stop</span>}
                      {stop === "GSFC University" && <span className="stop-tag">Destination</span>}
                    </li>
                  ))}
                </ol>
              </div>
            </>
          )}

          <label>Term Duration</label>
          <select required value={termDuration} onChange={e => setTermDuration(e.target.value)}>
            <option value="">— Select duration —</option>
            <option>January – June 2026</option>
            <option>July – December 2026</option>
            <option>Full Academic Year 2026-27</option>
          </select>

          {error && <p className="error">{error}</p>}
          <button className="primary-button" type="submit" disabled={submitting}>
            {submitting ? "Submitting…" : "Submit Application"}
          </button>
        </form>
      </div>
    </>
  );
}

// ── My Bus Pass ────────────────────────────────────────────────────────────────
function MyBusPass({ profile, assignment, transportReq, setPage }) {
  if (!transportReq && !assignment) {
    return (
      <>
        <h1>My Bus Pass</h1>
        <div className="panel">
          <p className="muted">You have not applied for a bus pass.</p>
          <button className="primary-small" onClick={() => setPage("apply")}>Apply Now</button>
        </div>
      </>
    );
  }

  return (
    <>
      <p className="small-heading">STUDENT PORTAL</p>
      <h1>My Bus Pass</h1>

      <div className="pass-card">
        <div className="pass-card-top">
          <span>CAMPUSCONNECT</span>
          <span>STUDENT PASS</span>
        </div>
        <div className="pass-card-content">
          <div className="student-photo">{(profile.name || "S").charAt(0).toUpperCase()}</div>
          <div>
            <h2>{profile.name}</h2>
            <p>{profile.enrollment}</p>
            <p>{profile.department}</p>
          </div>
        </div>
        <div className="pass-card-bottom">
          <div>
            <small>STATUS</small>
            <strong>{assignment ? "Approved" : (transportReq?.status?.toUpperCase() || "PENDING")}</strong>
          </div>
          <div>
            <small>BUS PASS ID</small>
            <strong>{assignment?.busPassId || "Pending Approval"}</strong>
          </div>
        </div>
      </div>

      <div className="panel">
        <h2>Application Details</h2>
        {transportReq && <p><strong>Pickup Stop:</strong> {transportReq.pickupPoint?.name || "—"}</p>}
        {transportReq && <p><strong>Request Date:</strong> {new Date(transportReq.requestDate || transportReq.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>}
        {assignment && <p><strong>Bus Number:</strong> {assignment.bus?.busNumber || "—"}</p>}
        {assignment && <p><strong>Route:</strong> {assignment.route?.routeName || "—"}</p>}
        {transportReq?.status === "rejected" && transportReq.rejectionReason && (
          <p style={{ color: "#9e3645" }}><strong>Rejection Reason:</strong> {transportReq.rejectionReason}</p>
        )}
      </div>
    </>
  );
}

// ── Transport / Bus & Route ────────────────────────────────────────────────────
function Transport({ assignment }) {
  if (!assignment) {
    return (
      <>
        <p className="small-heading">STUDENT PORTAL</p>
        <h1>My Bus & Route</h1>
        <div className="panel">
          <h2>Assignment Pending</h2>
          <p className="muted">Bus number and driver details will appear here after admin approves your request.</p>
        </div>
      </>
    );
  }

  const { bus, route, pickupPoint, busPassId } = assignment;

  return (
    <>
      <p className="small-heading">STUDENT PORTAL</p>
      <h1>My Bus & Route</h1>
      <p className="muted">Your assigned transport details for this term.</p>

      <section className="cards">
        <Card title="Bus Number"   value={bus?.busNumber    || "—"} icon="▰" />
        <Card title="Route"        value={route?.routeName  || "—"} icon="⌁" />
        <Card title="Pickup Stop"  value={pickupPoint?.name || "—"} icon="◉" />
        <Card title="Bus Pass ID"  value={busPassId         || "—"} icon="▣" />
      </section>

      {route && (
        <div className="panel">
          <h2>{route.routeName}</h2>
          {route.timings && <p><strong>Timings:</strong> {route.timings}</p>}
          {bus?.busNumber && <p><strong>Bus Number:</strong> {bus.busNumber}</p>}
          {pickupPoint?.pickupTime && <p><strong>Pickup Time:</strong> {pickupPoint.pickupTime}</p>}
        </div>
      )}
    </>
  );
}

// ── Profile ───────────────────────────────────────────────────────────────────
function Profile({ profile, setProfile }) {
  const [form, setForm]       = useState(profile);
  const [message, setMessage] = useState("");
  const [error, setError]     = useState("");
  const [saving, setSaving]   = useState(false);

  async function save(event) {
    event.preventDefault();
    setError(""); setMessage(""); setSaving(true);
    try {
      const res = await apiRequest("/students/profile", {
        method: "PUT",
        body: JSON.stringify({ name: form.name, phone: form.phone, department: form.department }),
      });
      if (res?.success) {
        setProfile(prev => ({ ...prev, name: form.name, phone: form.phone, department: form.department }));
        setMessage("Profile updated successfully.");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setError(res?.message || "Update failed.");
      }
    } catch (e) {
      setError(e?.message || "Update failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <p className="small-heading">STUDENT PORTAL</p>
      <h1>My Profile</h1>
      <p className="muted">Keep your details current.</p>

      <div className="panel form-panel">
        <form onSubmit={save}>
          <label>Full Name</label>
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} disabled={saving} />

          <label>College Email</label>
          <input value={form.email} disabled />

          <label>Enrollment Number</label>
          <input value={form.enrollment} disabled />

          <label>Phone Number</label>
          <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} disabled={saving} />

          <label>Department</label>
          <input value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} disabled={saving} />

          <label>Semester</label>
          <input value={form.semester} disabled />

          {error   && <p className="error">{error}</p>}
          {message && <p className="success">{message}</p>}

          <button className="primary-button" type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </form>
      </div>
    </>
  );
}

// ── Shared Card ───────────────────────────────────────────────────────────────
function Card({ title, value, icon }) {
  return (
    <div className="card">
      <div className="card-icon">{icon}</div>
      <p>{title}</p>
      <h3>{value}</h3>
    </div>
  );
}
