import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import './Dashboard.css';

/* ─── Stat Card ─── */
const StatCard = ({ label, value, sub, color }) => (
  <div className={`stat-card stat-card--${color}`}>
    <p className="stat-label">{label}</p>
    <h3 className="stat-value">{value}</h3>
    <p className="stat-sub">{sub}</p>
  </div>
);

/* ─── Helpers ─── */
const getTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'MORNING';
  if (hour < 17) return 'AFTERNOON';
  return 'EVENING';
};

const formatDate = (date) =>
  date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

/* ─── Role-specific content ─── */

const StudentContent = () => (
  <>
    <div className="stats-grid">
      <StatCard label="Request Status" value="Pending"       sub="Awaiting admin approval"    color="amber"  />
      <StatCard label="Bus Number"     value="Not Assigned"  sub="Assigned after approval"    color="blue"   />
      <StatCard label="Bus Pass ID"    value="Not Generated" sub="Generated after assignment" color="green"  />
      <StatCard label="Attendance"     value="0 Days"        sub="Current month"              color="purple" />
    </div>

    <div className="info-section">
      <h3>What happens next?</h3>
      <ol className="step-list">
        {[
          'Submit a transport request',
          'Admin reviews your request',
          'Bus and route get assigned',
          'You receive your Bus Pass ID',
          'Driver scans your pass daily',
        ].map((step, i) => (
          <li key={i} className="step-item">
            <span className="step-number">{i + 1}</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </div>
  </>
);

const DriverContent = () => (
  <>
    <div className="stats-grid">
      <StatCard label="Assigned Bus"       value="Not Assigned" sub="Check with admin"       color="blue"   />
      <StatCard label="Assigned Route"     value="Not Assigned" sub="Route details here"     color="green"  />
      <StatCard label="Total Students"     value="0"            sub="On your bus"             color="amber"  />
      <StatCard label="Today's Attendance" value="0 Marked"     sub={formatDate(new Date())} color="purple" />
    </div>

    <div className="info-section">
      <h3>Driver Quick Guide</h3>
      <ol className="step-list">
        {[
          'View your assigned bus and route',
          'Student presents their Bus Pass ID',
          'Enter the pass ID to verify',
          'Mark attendance after verification',
          'Report any bus issue from the sidebar',
        ].map((step, i) => (
          <li key={i} className="step-item">
            <span className="step-number">{i + 1}</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </div>
  </>
);

const AdminContent = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className="stats-grid">
        <StatCard label="Total Students"   value="0" sub="Registered students"      color="blue"  />
        <StatCard label="Total Buses"      value="0" sub="Active fleet"              color="green" />
        <StatCard label="Pending Requests" value="0" sub="Awaiting your review"      color="amber" />
        <StatCard label="Open Problems"    value="0" sub="Reported by drivers"       color="red"   />
      </div>

      <div className="info-section">
        <h3>Admin Quick Actions</h3>
        <div className="admin-actions-grid">
          <button className="admin-action-btn" onClick={() => navigate('/admin/requests')}>
            View All Requests
          </button>
          <button className="admin-action-btn" onClick={() => navigate('/admin/buses')}>
            Manage Buses
          </button>
          <button className="admin-action-btn" onClick={() => navigate('/admin/routes')}>
            Manage Routes
          </button>
          <button className="admin-action-btn" onClick={() => navigate('/admin/reports')}>
            View Reports
          </button>
        </div>
      </div>
    </>
  );
};

/* ─── Role subtitle map ─── */
const SUBTITLE = {
  student: 'Track your bus pass and transport status',
  driver:  'Manage your bus, route and attendance',
  admin:   'Overview of the campus transport system',
};

/**
 * Dashboard — role-specific overview page with Navbar + Sidebar layout
 */
const Dashboard = () => {
  const { user } = useAuth();
  const role = user?.role || 'student';

  return (
    <div className="app-layout">
      <Navbar />
      <div className="app-body">
        <Sidebar />
        <main className="app-main">

          {/* Page header */}
          <div className="page-header">
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">{SUBTITLE[role]}</p>
          </div>

          {/* Welcome banner */}
          <div className="welcome-banner">
            <div>
              <p className="welcome-label">GOOD {getTimeOfDay()},</p>
              <h2 className="welcome-name">{user?.name}</h2>
            </div>
            <div className="welcome-role-text">{role} Portal</div>
          </div>

          {/* Role-specific content */}
          {role === 'student' && <StudentContent />}
          {role === 'driver'  && <DriverContent  />}
          {role === 'admin'   && <AdminContent   />}

        </main>
      </div>
    </div>
  );
};

export default Dashboard;
