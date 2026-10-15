import { useState } from "react";
import AttendanceHistory from "./AttendanceHistory";
import TransportRequestStatus from "./TransportRequestStatus";
import { useAuth } from "../common/context/AuthContext";
import "./styles.css";

// GSFC University Students Routes 2026-27
const ROUTES = [
  {
    id: "ROUTE-1",
    busNumber: "GJ-16-AU-4788",
    driverName: "Mr. Rajesh Patel",
    stops: [
      "Soma Talav (BPC Pump)",
      "Gurukul Char Rasta",
      "Bapod Police St",
      "Super Bekery",
      "GSFC University"
    ]
  },
  {
    id: "ROUTE-2",
    busNumber: "GJ-06-BX-3670",
    driverName: "Mr. Suresh Sharma",
    stops: [
      "Parivar Char Rasta",
      "Vrundavan Circle",
      "Sardar Estate (SS)",
      "Earth Icon",
      "Amit Nagar",
      "GSFC University"
    ]
  },
  {
    id: "ROUTE-3",
    busNumber: "GJ-06-BV-7875",
    driverName: "Mr. Dinesh Verma",
    stops: [
      "Khodiyar Nagar",
      "Airport Circle",
      "Golden Chokadi",
      "Dena Chokadi",
      "GSFC University"
    ]
  },
  {
    id: "ROUTE-4",
    busNumber: "GJ-06-AX-3348",
    driverName: "Mr. Mahesh Yadav",
    stops: [
      "Chankyapuri",
      "Abhilasha Char Rasta",
      "Harni Gada Circle",
      "GSFC University"
    ]
  },
  {
    id: "ROUTE-5",
    busNumber: "GJ-16-AU-4890",
    driverName: "Mr. Ramesh Chauhan",
    stops: [
      "Earth Icon",
      "Jagdish Farshan",
      "Miletry Boys",
      "Amit Nagar",
      "L & T Circle",
      "GSFC University"
    ]
  },
  {
    id: "ROUTE-6",
    busNumber: "GJ-16-BV-7584",
    driverName: "Mr. Nilesh Solanki",
    stops: [
      "Voltamp Company",
      "Maneja Crossing",
      "Hanuman Temple (Mak)",
      "Novino",
      "GSFC University"
    ]
  },
  {
    id: "ROUTE-7",
    busNumber: "GJ-16-AU-1390",
    driverName: "Mr. Hitesh Rathod",
    stops: [
      "Ravi Park",
      "Gamgasagar",
      "Kabir Complex",
      "Polo Ground",
      "Susen Circle",
      "GSFC University"
    ]
  },
  {
    id: "ROUTE-8",
    busNumber: "GJ-06-BV-7989",
    driverName: "Mr. Bhavesh Joshi",
    stops: [
      "Darbar Chowkdi",
      "Pramukh Prasad / Pramukh Darshan",
      "Avdhut Fatak / JL Baug Fatak",
      "Kalaghoda",
      "Mahesana Nagar Circle",
      "GSFC University"
    ]
  },
  {
    id: "ROUTE-9",
    busNumber: "GJ-06-BV-2915",
    driverName: "Mr. Alpesh Trivedi",
    stops: [
      "Sarswati Complex",
      "Tulsidham",
      "Raj Mahel Gate",
      "Fatehgunj - 808",
      "Yogniketan",
      "Nizampura - Tasty Vadapav",
      "GSFC University"
    ]
  },
  {
    id: "ROUTE-10",
    busNumber: "GJ-16-AU-3840",
    driverName: "Mr. Kalpesh Makwana",
    stops: [
      "Khekholi Circle",
      "Atladra",
      "Kia Moter",
      "Sun Pharma Road",
      "Tandalja",
      "GSFC University"
    ]
  },
  {
    id: "ROUTE-11",
    busNumber: "GJ-06-AX-1826",
    driverName: "Mr. Pratik Desai",
    stops: [
      "Hari Nagar Char Rasta",
      "Nandalay Circle",
      "Zansi Ki Rani",
      "Jain Derasar",
      "Dashama Chokdi",
      "Iti Gorwa",
      "Panchvati Circle",
      "GSFC University"
    ]
  },
  {
    id: "ROUTE-12",
    busNumber: "GJ-06-BV-6129",
    driverName: "Mr. Jigar Shah",
    stops: [
      "Akshar Chowk",
      "Devdeep Nagar",
      "Vasna Circle - Khteteshwar",
      "Swaminarayan Mandir",
      "Time Circle",
      "Chhani Jakat Naka",
      "Chhani Canal",
      "Chhani Gurudwara",
      "GSFC University"
    ]
  },
  {
    id: "ROUTE-13",
    busNumber: "GJ-06-BV-6527",
    driverName: "Mr. Vishal Pandya",
    stops: [
      "Nilamber Circle",
      "Yash Complex",
      "Natubhai Circle",
      "Chakli Circle",
      "Trident Circle",
      "Genda Circle",
      "GSFC University"
    ]
  }
];

export default function App() {
 const { user, logout } = useAuth();
 const [page, setPage] = useState("dashboard");
 const [student, setStudent] = useState(() => ({name:user.name,email:user.email,enrollment:user.studentId || "",phone:user.phone || "",department:user.department || "",semester:user.semester || ""}));
 const [busPass,setBusPass]=useState(null);
 const handleLogout=logout;
  return (
    <div className="student-portal"><div className="app">
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-circle">C</div>
          <div>
            <h2>CampusConnect</h2>
            <p>Student Transport</p>
          </div>
        </div>

        <button className={page === "dashboard" ? "nav active" : "nav"} onClick={() => setPage("dashboard")}>
          ⌂ Dashboard
        </button>
        <button className={page === "apply" ? "nav active" : "nav"} onClick={() => setPage("apply")}>
          ＋ Apply for Pass
        </button>
        <button className={page === "request-status" ? "nav active" : "nav"} onClick={() => setPage("request-status")}>
          ◷ Request Status
        </button>
        <button className={page === "pass" ? "nav active" : "nav"} onClick={() => setPage("pass")}>
          ▣ My Bus Pass
        </button>
        <button className={page === "transport" ? "nav active" : "nav"} onClick={() => setPage("transport")}>
          ⌁ Bus & Route
        </button>
        <button className={page === "profile" ? "nav active" : "nav"} onClick={() => setPage("profile")}>
          ◉ My Profile
        </button>
        <button className={page === "attendance" ? "nav active" : "nav"} onClick={() => setPage("attendance")}>
          ▤ Attendance History
        </button>

        <div className="sidebar-bottom">
          <p><strong>{student.name}</strong></p>
          <small>Student</small>
          <button className="logout" onClick={handleLogout}>↪ Logout</button>
        </div>
      </aside>

      <main className="content">
        {page === "dashboard" && (
          <Dashboard student={student} busPass={busPass} setPage={setPage} />
        )}
        {page === "apply" && (
          <ApplyPass busPass={busPass} setBusPass={setBusPass} setPage={setPage} />
        )}
        {page === "pass" && (
          <MyBusPass student={student} busPass={busPass} setPage={setPage} />
        )}
        {page === "transport" && <Transport busPass={busPass} />}
        {page === "profile" && (
          <Profile student={student} setStudent={setStudent} />
        )}
        {page === "attendance" && <AttendanceHistory />}
        {page === "request-status" && (
          <TransportRequestStatus busPass={busPass} setPage={setPage} />
        )}
      </main>
    </div></div>
 );
}

function Dashboard({ student, busPass, setPage }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <>
      <header>
        <p className="small-heading">STUDENT DASHBOARD</p>
        <h1>{greeting}, {student.name || "Student"}.</h1>
        <p className="muted">Here is your transport overview.</p>
      </header>

      <section className="cards">
        <Card title="Pass Status" value={busPass ? busPass.status : "Not Applied"} icon="▣" />
        <Card title="Assigned Bus" value={busPass?.status === "Approved" ? assignedTransport.busNumber : "Not Assigned"} icon="▰" />
        <Card title="Route" value={busPass?.status === "Approved" ? assignedTransport.routeNumber : "Not Assigned"} icon="⌁" />
        <Card title="Pickup Time" value={busPass?.status === "Approved" ? "7:35 AM" : "—"} icon="◷" />
      </section>

      <section className="panel">
        <h2>Bus Pass Application</h2>
        {busPass ? (
          <>
            <p><strong>Status:</strong> <span className="status">{busPass.status}</span></p>
            <p><strong>Pickup Stop:</strong> {busPass.pickupStop}</p>
            <button className="secondary-button" onClick={() => setPage("pass")}>
              View Pass Details
            </button>
          </>
        ) : (
          <>
            <p className="muted">You have not applied for a bus pass yet.</p>
            <button className="primary-small" onClick={() => setPage("apply")}>
              Apply Now
            </button>
          </>
        )}
      </section>
    </>
  );
}

function ApplyPass({ busPass, setBusPass, setPage }) {
  const [selectedRoute, setSelectedRoute] = useState("");
  const [pickupStop, setPickupStop] = useState("");
  const [termDuration, setTermDuration] = useState("");

  const route = ROUTES.find((r) => r.id === selectedRoute);
  const availableStops = route ? route.stops.filter((s) => s !== "GSFC University") : [];

  if (busPass && ["Pending", "Approved"].includes(busPass.status)) {
    return (
      <>
        <h1>Apply for Bus Pass</h1>
        <div className="panel">
          <h2>You already have a {busPass.status.toLowerCase()} application.</h2>
          <button className="primary-small" onClick={() => setPage("pass")}>
            View My Bus Pass
          </button>
        </div>
      </>
    );
  }

  function submit(event) {
    event.preventDefault();
    setBusPass({
      applicationId: `APP-${Date.now()}`,
      status: "Pending",
      routeId: selectedRoute,
      busNumber: route?.busNumber || "",
      driverName: route?.driverName || "",
      pickupStop,
      termDuration
    });
    setPage("pass");
  }

  return (
    <>
      <p className="small-heading">STUDENT PORTAL</p>
      <h1>Apply for Bus Pass</h1>
      <p className="muted">Select the route closest to your home and your boarding stop.</p>

      <div className="panel form-panel">
        <form onSubmit={submit}>

          <label>Select Route</label>
          <select
            required
            value={selectedRoute}
            onChange={(e) => { setSelectedRoute(e.target.value); setPickupStop(""); }}
          >
            <option value="">— Select your route —</option>
            {ROUTES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.id.replace("ROUTE-", "Route ")} – {r.stops[0]}
              </option>
            ))}
          </select>

          {selectedRoute && (
            <>
              <label>Select Your Boarding Stop</label>
              <select
                required
                value={pickupStop}
                onChange={(e) => setPickupStop(e.target.value)}
              >
                <option value="">— Select your boarding stop —</option>
                {availableStops.map((stop) => (
                  <option key={stop} value={stop}>{stop}</option>
                ))}
              </select>

              <div className="route-preview">
                <p className="route-preview-label">All Stops on {selectedRoute.replace("ROUTE-", "Route ")}</p>
                <ol className="stops">
                  {route.stops.map((stop) => (
                    <li
                      key={stop}
                      className={stop === pickupStop ? "stop-selected" : ""}
                    >
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
          <select required value={termDuration} onChange={(e) => setTermDuration(e.target.value)}>
            <option value="">— Select duration —</option>
            <option>January – June 2026</option>
            <option>July – December 2026</option>
            <option>Full Academic Year 2026-27</option>
          </select>

          <button className="primary-button" type="submit">Submit Application</button>
        </form>
      </div>
    </>
  );
}

function MyBusPass({ student, busPass, setPage }) {
  if (!busPass) {
    return (
      <>
        <h1>My Bus Pass</h1>
        <div className="panel">
          <p>You have not applied for a bus pass.</p>
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
          <div className="student-photo">{(student.name || "S").charAt(0).toUpperCase()}</div>
          <div>
            <h2>{student.name}</h2>
            <p>{student.enrollment}</p>
            <p>{student.department}</p>
          </div>
        </div>

        <div className="pass-card-bottom">
          <div>
            <small>STATUS</small>
            <strong>{busPass.status}</strong>
          </div>
          <div>
            <small>VALIDITY</small>
            <strong>{busPass.termDuration}</strong>
          </div>
        </div>
      </div>

      <div className="panel">
        <h2>Application Details</h2>
        <p><strong>Application ID:</strong> {busPass.applicationId}</p>
        <p><strong>Bus Pass ID:</strong>{" "}
          {busPass.status === "Approved" ? busPass.busPassId : "Will be generated after admin approval"}
        </p>
        <p><strong>Pickup Stop:</strong> {busPass.pickupStop}</p>
      </div>
    </>
  );
}

function Transport({ busPass }) {
  const route = busPass ? ROUTES.find((r) => r.id === busPass.routeId) : null;

  if (!busPass || busPass.status !== "Approved") {
    return (
      <>
        <p className="small-heading">STUDENT PORTAL</p>
        <h1>My Bus & Route</h1>
        <div className="panel">
          <h2>Assignment Pending</h2>
          <p className="muted">
            Bus number and driver details will be revealed here once the admin approves your transport request.
          </p>
          {busPass && (
            <div style={{ marginTop: "16px", padding: "14px 16px", borderRadius: "10px", background: "#f8e7c9", color: "#a66a16", fontSize: "0.9rem" }}>
              Your application for <strong>{busPass.routeId?.replace("ROUTE-", "Route ")}</strong> (boarding at <strong>{busPass.pickupStop}</strong>) is currently <strong>{busPass.status}</strong>.
            </div>
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <p className="small-heading">STUDENT PORTAL</p>
      <h1>My Bus & Route</h1>
      <p className="muted">Your assigned transport details for this term.</p>

      <section className="cards">
        <Card title="Bus Number" value={busPass.busNumber || route?.busNumber || "—"} icon="▰" />
        <Card title="Route" value={busPass.routeId?.replace("ROUTE-", "Route ") || "—"} icon="⌁" />
        <Card title="Driver" value={busPass.driverName || route?.driverName || "—"} icon="◉" />
        <Card title="Boarding Stop" value={busPass.pickupStop || "—"} icon="◷" />
      </section>

      {route && (
        <div className="panel">
          <h2>{busPass.routeId?.replace("ROUTE-", "Route ")} — All Stops</h2>
          <p><strong>Bus Number:</strong> {route.busNumber}</p>
          <p><strong>Driver:</strong> {route.driverName}</p>
          <p><strong>Your Boarding Stop:</strong> {busPass.pickupStop}</p>
          <p><strong>Stops in order:</strong></p>
          <ol className="stops">
            {route.stops.map((stop) => (
              <li key={stop} className={stop === busPass.pickupStop ? "stop-selected" : ""}>
                {stop}
                {stop === busPass.pickupStop && <span className="stop-tag boarding">Your Stop</span>}
                {stop === "GSFC University" && <span className="stop-tag">Destination</span>}
              </li>
            ))}
          </ol>
        </div>
      )}
    </>
  );
}

function Profile({ student, setStudent }) {
  const [form, setForm] = useState(student);
  const [message, setMessage] = useState("");

  function save(event) {
    event.preventDefault();
    setStudent(form);
    localStorage.setItem("student_user", JSON.stringify(form));
    setMessage("Profile updated successfully.");
    setTimeout(() => setMessage(""), 3000);
  }

  return (
    <>
      <p className="small-heading">STUDENT PORTAL</p>
      <h1>My Profile</h1>
      <p className="muted">Keep your details current.</p>

      <div className="panel form-panel">
        <form onSubmit={save}>
          <label>Full Name</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />

          <label>College Email</label>
          <input value={form.email} disabled />

          <label>Enrollment Number</label>
          <input value={form.enrollment} disabled />

          <label>Phone Number</label>
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />

          <label>Department</label>
          <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />

          <label>Semester</label>
          <input value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} />

          {message && <p className="success">{message}</p>}

          <button className="primary-button" type="submit">Save Changes</button>
        </form>
      </div>
    </>
  );
}

function Card({ title, value, icon }) {
  return (
    <div className="card">
      <div className="card-icon">{icon}</div>
      <p>{title}</p>
      <h3>{value}</h3>
    </div>
  );
}
