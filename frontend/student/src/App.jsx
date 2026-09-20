import React, { useState } from "react";
import AttendanceHistory from "./AttendanceHistory";
import TransportRequestStatus from "./TransportRequestStatus";

const defaultStudent = {
  name: "Haley",
  email: "haley@university.edu",
  enrollment: "2026AWT001",
  phone: "9876543210",
  department: "Computer Engineering",
  semester: "5"
};

const assignedTransport = {
  busNumber: "GJ-01-BU-2145",
  driverName: "Mr. Raj Patel",
  routeName: "North Campus Express",
  routeNumber: "R-04",
  timing: "7:35 AM – 8:20 AM",
  stops: ["University Gate", "City Square", "Library Junction", "North Campus"]
};

export default function App() {
  const [page, setPage] = useState("login");
  const [student, setStudent] = useState(defaultStudent);
  const [busPass, setBusPass] = useState(null);

  if (page === "login") {
    return <LoginPage setPage={setPage} />;
  }

  if (page === "register") {
    return <RegisterPage setPage={setPage} />;
  }

  return (
    <div className="app">
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
          <button className="logout" onClick={() => setPage("login")}>↪ Logout</button>
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
    </div>
  );
}

function LoginPage({ setPage }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function login(event) {
    event.preventDefault();

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setPage("dashboard");
  }

  return (
    <div className="auth-page">
      <div className="auth-form">
        <div className="auth-logo">C</div>
        <p className="small-heading">CAMPUSCONNECT</p>
        <h1>Welcome back</h1>
        <p className="muted">Sign in to manage your university transport.</p>

        <form onSubmit={login}>
          <label>College Email</label>
          <input
            type="email"
            placeholder="you@university.edu"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          {error && <p className="error">{error}</p>}

          <button className="primary-button" type="submit">Sign In</button>
        </form>

        <p className="center-text">
          New student?{" "}
          <button className="link-button" onClick={() => setPage("register")}>
            Create an account
          </button>
        </p>
      </div>

      <div className="auth-side">
        <p>SMART UNIVERSITY TRANSPORT</p>
        <h1>Your journey,<br />made simpler.</h1>
      </div>
    </div>
  );
}

function RegisterPage({ setPage }) {
  const [message, setMessage] = useState("");

  function register(event) {
    event.preventDefault();
    setMessage("Registration successful. You can now sign in.");
  }

  return (
    <div className="auth-page">
      <div className="auth-form">
        <div className="auth-logo">C</div>
        <p className="small-heading">STUDENT REGISTRATION</p>
        <h1>Create Account</h1>

        <form onSubmit={register}>
          <label>Full Name</label>
          <input required placeholder="Your full name" />

          <label>College Email</label>
          <input required type="email" placeholder="you@university.edu" />

          <label>Enrollment Number</label>
          <input required placeholder="2026AWT001" />

          <label>Phone Number</label>
          <input required placeholder="10-digit phone number" />

          <label>Password</label>
          <input required type="password" placeholder="Minimum 6 characters" />

          {message && <p className="success">{message}</p>}

          <button className="primary-button" type="submit">Create Account</button>
        </form>

        <p className="center-text">
          Already registered?{" "}
          <button className="link-button" onClick={() => setPage("login")}>
            Sign In
          </button>
        </p>
      </div>

      <div className="auth-side">
        <p>STUDENT BUS PASS PORTAL</p>
        <h1>Travel smarter,<br />every day.</h1>
      </div>
    </div>
  );
}

function Dashboard({ student, busPass, setPage }) {
  return (
    <>
      <header>
        <p className="small-heading">STUDENT DASHBOARD</p>
        <h1>Good morning, {student.name}.</h1>
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
  const [pickupStop, setPickupStop] = useState("");
  const [termDuration, setTermDuration] = useState("");

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
      pickupStop,
      termDuration
    });

    setPage("pass");
  }

  return (
    <>
      <p className="small-heading">STUDENT PORTAL</p>
      <h1>Apply for Bus Pass</h1>
      <p className="muted">Submit your transport requirements for admin approval.</p>

      <div className="panel form-panel">
        <form onSubmit={submit}>
          <label>Select Pickup Point</label>
          <select
            required
            value={pickupStop}
            onChange={(event) => setPickupStop(event.target.value)}>
          <option value="">Select your pickup point</option>
          <option value="Darbar Chokdi">Darbar Chokdi</option>
          <option value="Suncity Circle">Suncity Circle</option>
          <option value="Avdhut Fatak">Avdhut Fatak</option>
          </select> 

          <label>Term Duration</label>
          <select required value={termDuration} onChange={(event) => setTermDuration(event.target.value)}>
            <option value="">Select duration</option>
            <option>January – June 2026</option>
            <option>July – December 2026</option>
            <option>Full Academic Year</option>
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
          <div className="student-photo">{student.name.charAt(0)}</div>
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
         {busPass.status === "Approved"
         ? busPass.busPassId
         : "Will be generated after admin approval"}
        </p> 
        <p><strong>Pickup Stop:</strong> {busPass.pickupStop}</p>
      </div>
    </>
  );
}

function Transport({ busPass }) {
  if (!busPass || busPass.status !== "Approved") {
    return (
      <>
        <p className="small-heading">STUDENT PORTAL</p>
        <h1>My Bus & Route</h1>

        <div className="panel">
          <h2>Assignment Pending</h2>
          <p className="muted">
            Your bus and route details will appear here after the admin
            approves your transport request.
          </p>
        </div>
      </>
    );
  } 
  return (
    <>
      <p className="small-heading">STUDENT PORTAL</p>
      <h1>My Bus & Route</h1>
      <p className="muted">Your assigned transport details.</p>

      <section className="cards">
        <Card title="Bus Number" value={assignedTransport.busNumber} icon="▰" />
        <Card title="Route Number" value={assignedTransport.routeNumber} icon="⌁" />
        <Card title="Driver" value={assignedTransport.driverName} icon="◉" />
        <Card title="Pickup Time" value="7:35 AM" icon="◷" />
      </section>

      <div className="panel">
        <h2>{assignedTransport.routeName}</h2>
        <p><strong>Route Timing:</strong> {assignedTransport.timing}</p>
        <p><strong>Stops:</strong></p>

        <ol className="stops">
          {assignedTransport.stops.map((stop) => <li key={stop}>{stop}</li>)}
        </ol>
      </div>
    </>
  );
}

function Profile({ student, setStudent }) {
  const [form, setForm] = useState(student);
  const [message, setMessage] = useState("");

  function save(event) {
    event.preventDefault();
    setStudent(form);
    setMessage("Profile updated successfully.");
  }

  return (
    <>
      <p className="small-heading">STUDENT PORTAL</p>
      <h1>My Profile</h1>
      <p className="muted">Keep your details current.</p>

      <div className="panel form-panel">
        <form onSubmit={save}>
          <label>Full Name</label>
          <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />

          <label>College Email</label>
          <input value={form.email} disabled />

          <label>Enrollment Number</label>
          <input value={form.enrollment} disabled />

          <label>Phone Number</label>
          <input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />

          <label>Department</label>
          <input value={form.department} onChange={(event) => setForm({ ...form, department: event.target.value })} />

          <label>Semester</label>
          <input value={form.semester} onChange={(event) => setForm({ ...form, semester: event.target.value })} />

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